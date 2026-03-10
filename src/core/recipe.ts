import { RecipeTemplate, VariableDef } from './types';
import { BuilderContext } from './context';
import { SDKValidator } from './Validation';

/**
 * Supported types for the final TaaS Truth outcome.
 */
export type OutcomeType = 'BINARY' | 'SCALAR' | 'CATEGORICAL' | 'PROBABILISTIC' | 'INVALID';

/**
 * Configuration for defining a new Truth Recipe Template.
 */
export interface RecipeConfig {
    /** The human-readable name of the recipe. */
    name: string;
    /** A concise description of the truth-seeking logic. */
    description?: string;
    /** The domain category (e.g., 'Finance', 'Sports'). */
    category?: string;
    /** Explicit versioning for the template (e.g. '1.0.0') */
    version?: string;
    /** The mathematical type of the expected result. */
    outcomeType?: OutcomeType;
    /** Typed input parameters required by the handler. */
    inputs: { [key: string]: VariableDef | any };
    /** The final truth attestation strategy (default: 'expression') */
    attestation?: { type: string, config: Record<string, any> };
    /** The async handler where the logic is defined. */
    handler?: (inputs: Record<string, string>) => Promise<string | number | boolean | Record<string, any>>;
}

/**
 * Entry point for the TaaS Recipe Engine.
 */
export class Recipe {
    /**
     * Defines a new Autonomous Truth Recipe Template.
     * @param config The recipe template configuration.
     * @returns A RecipeDefinition instance ready for compilation.
     */
    static define(config: RecipeConfig) {
        return new RecipeDefinition(config);
    }
}

/**
 * Manages the transformation of high-level handler logic into a protocol-compliant Template.
 */
export class RecipeDefinition {
    constructor(public config: RecipeConfig) { }

    /**
     * Sets the async handler logic for this recipe.
     */
    handler(fn: (inputs: Record<string, string>) => Promise<string | number | boolean | Record<string, any>>): this {
        this.config.handler = fn;
        return this;
    }

    /**
     * Compiles the recipe handler into a portable RecipeTemplate.
     */
    async compile(idOverride?: string): Promise<RecipeTemplate> {
        return BuilderContext.run(async (ctx) => {
            const inputProxies: Record<string, string> = {};
            const variables: VariableDef[] = [];

            for (const [key, defOrFluent] of Object.entries(this.config.inputs)) {
                const def = (defOrFluent as any).def ? (defOrFluent as any).def : defOrFluent;
                const varDef = { ...def, name: key } as VariableDef;
                variables.push(varDef);
                inputProxies[key] = `\${${key}}`;
            }

            if (!this.config.handler) {
                throw new Error(`[TaaS SDK] Handler not defined for recipe: ${this.config.name}`);
            }

            const result = await this.config.handler(inputProxies);
            const nodes = ctx.getNodes();

            let finalExpression = '0';
            if (typeof result === 'string' && result.startsWith('truth_')) {
                finalExpression = `\${${result}}`;
            } else if (typeof result === 'object' && (result as any).targetVar) {
                finalExpression = `\${${(result as any).targetVar}}`;
            } else {
                finalExpression = String(result);
            }

            const template: RecipeTemplate = {
                id: idOverride || this.config.name.toLowerCase().replace(/\s+/g, '-'),
                metadata: {
                    id: idOverride || this.config.name.toLowerCase().replace(/\s+/g, '-'),
                    name: this.config.name,
                    description: this.config.description || '',
                    category: this.config.category || 'General',
                    version: this.config.version || '4.0.0',
                    outcomeType: this.config.outcomeType || 'BINARY',
                    tags: []
                },
                ui: {
                    titleTemplate: `${this.config.name}`,
                    variables: variables,
                    truthType: this.config.outcomeType || 'SCALAR',
                    resultLabels: []
                },
                logic: {
                    pipeline: nodes,
                    attestation: (this.config.attestation as any) || {
                        type: 'expression',
                        config: {
                            expression: finalExpression
                        }
                    }
                },
                snapshots: {}
            };

            // STATIC ANALYSIS: Cycle detection and variable verification
            SDKValidator.analyzeDAG(template);

            return template;
        });
    }

    /**
     * Simulates the recipe execution.
     * If a client is provided, it uses the TaaS Gateway.
     * If no client is provided, it runs locally using provided mocks.
     * @param inputs User inputs for the simulation.
     * @param options Execution options (client or mocks).
     */
    async test(inputs: Record<string, any>, options: { client: any }): Promise<any> {
        const template = await this.compile();

        // Execution is ALWAYS delegated to the Gateway for protocol consistency.
        if (!options.client) {
            throw new Error(`[TaaS SDK] Simulation requires a TruthGatewayClient. Local execution is deprecated for accuracy.`);
        }

        console.log(`[TaaS SDK] Simulating on Remote Gateway...`);
        return await options.client.simulate(template, inputs);
    }

    /**
     * Compiles and deploys the recipe template to a TaaS Gateway.
     */
    async deploy(client: any, token?: string) {
        const template = await this.compile();
        return await client.submitTemplate(template, token);
    }

    /**
     * NEW: Visual Auditing (v4.5)
     * Generates a Mermaid.js string representing the recipe's logic DAG.
     */
    async toMermaid(): Promise<string> {
        const template = await this.compile();
        let mermaid = "graph TD\n";

        // 1. Inputs
        mermaid += "  subgraph Inputs\n";
        template.ui?.variables.forEach(v => {
            mermaid += `    input_${v.name}["(${v.type}) ${v.label}"]\n`;
        });
        mermaid += "  end\n\n";

        // 2. Logic Nodes
        template.logic.pipeline.forEach((node: any) => {
            const label = node.id;
            const subLabel = node.type === 'condition' ? `[IF] ${node.expression}` : `[${node.type}] ${node.method || ''}`;
            mermaid += `  node_${node.id}["<b>${label}</b><br/>${subLabel}"]\n`;

            // Connections (Dependencies)
            node.dependencies?.forEach((dep: string) => {
                if (template.ui?.variables.find(v => v.name === dep)) {
                    mermaid += `  input_${dep} --> node_${node.id}\n`;
                } else {
                    mermaid += `  node_${dep} --> node_${node.id}\n`;
                }
            });

            // Conditional Flow
            if (node.type === 'condition') {
                node.onTrue?.forEach((next: string) => mermaid += `  node_${node.id} -- True --> node_${next}\n`);
                node.onFalse?.forEach((next: string) => mermaid += `  node_${node.id} -- False --> node_${next}\n`);
            }
        });

        // 3. Output
        const attestation = template.logic.attestation as any;
        if (attestation.type === 'expression') {
            mermaid += `\n  attestation["Attestation Expression<br/>${attestation.config.expression}"]\n`;
            const deps = [...attestation.config.expression.matchAll(/\$\{([^${}]+)\}/g)].map(m => m[1]);
            deps.forEach(dep => {
                mermaid += `  node_${dep} --> attestation\n`;
            });
        }

        return mermaid;
    }
}
