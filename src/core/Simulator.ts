import { RecipeTemplate, RecipeExecutionResult } from './types';
import axios from 'axios';

// Dynamically import the WASM engine
const wasmEnginePromise = import('@taas/taas-core-rs');

/**
 * High-fidelity simulator for TaaS Recipes.
 * Uses the Sovereign Rust Engine (WASM) to ensure bit-for-bit parity with production nodes.
 */
export class RecipeSimulator {
    private static applySelector(data: any, selector?: string, asType?: string): any {
        if (!selector) return data;

        let result = data;
        // Simple support for $.prop.subprop or prop.subprop[0]
        const cleanSelector = selector.startsWith('$.') ? selector.substring(2) : selector;
        const parts = cleanSelector.split('.');

        for (const part of parts) {
            if (result === undefined || result === null) break;

            // Handle array indexing like results[0]
            const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
            if (arrayMatch) {
                const [, key, index] = arrayMatch;
                result = result[key]?.[parseInt(index)];
            } else {
                result = result[part];
            }
        }

        if (asType === 'number') {
            const num = Number(result);
            return isNaN(num) ? result : num;
        }
        if (asType === 'boolean') return Boolean(result);
        if (asType === 'string') return String(result);

        return result;
    }

    /**
     * Executes a recipe locally using the embedded Sovereign Engine.
     */
    static async simulate(recipe: RecipeTemplate, inputs: Record<string, any>, options: { gatewayUrl?: string } = {}): Promise<RecipeExecutionResult> {
        const { execute_recipe } = await wasmEnginePromise;

        const provider = {
            dispatch: async (node: any, _context: Record<string, any>) => {
                // Support Inject-and-Test: Skip fetch if result is already in context
                if (inputs[node.id] !== undefined) {
                    console.log(`[Simulator] Using pre-bound value for ${node.id} (Inject-and-Test)`);
                    return {
                        value: inputs[node.id],
                        signature: 'SIM_TSS_SIG_PREBOUND',
                        evidence: { source: 'prebound-context', isMock: true }
                    };
                }

                console.log(`[Simulator] Executing Resource Node: ${node.id} (${node.type})`);

                try {
                    let rawData: any;
                    let sourceKey: string;
                    let signature = 'SIM_TSS_SIG_LOCAL_UNSAFE';

                    if (options.gatewayUrl) {
                        // Route through TaaS Gateway for signed/attested data
                        console.log(`[Simulator] Routing ${node.id} through Gateway: ${options.gatewayUrl}`);
                        const response = await axios.post(`${options.gatewayUrl}/v1/execute-node`, {
                            node,
                            context: _context
                        });
                        return response.data; // Gateway already returns normalized { value, signature, evidence }
                    }

                    // Direct execution (Local Simulation Mode)
                    if (node.type === 'universal-request') {
                        const response = await axios({
                            url: node.url,
                            method: node.method as any,
                            headers: node.headers,
                            params: node.params,
                            data: node.body,
                            timeout: 10000
                        });
                        rawData = response.data;
                        sourceKey = node.url;
                    } else if (node.type === 'graphql-request') {
                        const response = await axios.post(node.url, {
                            query: node.query,
                            variables: node.variables
                        }, { headers: node.headers });
                        rawData = response.data;
                        sourceKey = node.url;
                    } else {
                        throw new Error(`Node type ${node.type} not yet supported in local simulator.`);
                    }

                    // Standardize: Apply Selector and Cast Type (Ingestion-Side Normalization)
                    const normalizedValue = this.applySelector(rawData, node.selector, node.asType);

                    return {
                        value: normalizedValue,
                        signature,
                        evidence: {
                            source: sourceKey,
                            isLocal: true,
                            raw: rawData // Keep raw for audit trace
                        }
                    };
                } catch (err: any) {
                    console.error(`[Simulator-Provider] Dispatch failed for ${node.id}:`, err.message);
                    throw err;
                }
            }
        };

        try {
            const outcome = await execute_recipe(recipe as any, inputs, provider);

            if (!outcome.success) {
                throw new Error(outcome.error || "Simulation failed");
            }

            return {
                success: true,
                truth: outcome.truth,
                attestationStatus: outcome.attestationStatus,
                context: outcome.context,
                proofs: {},
                trace: outcome.proof?.executionTrace || {},
                proof: outcome.proof,
                logs: []
            };
        } catch (err: any) {
            console.error(`[Simulator] Sovereign Execution FAILED:`, err);
            throw err;
        }
    }
}
