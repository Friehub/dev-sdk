import { RecipeTemplate, LogicNode } from './types';
import { TruthGatewayClient } from './GatewayClient';

/**
 * Sovereign Intent Builder.
 * Chainable DSL for defining verifiable off-chain logic.
 */
export class IntentBuilder {
    private recipe: RecipeTemplate;
    private client?: TruthGatewayClient;

    constructor(id: string, gatewayUrl?: string) {
        this.recipe = {
            id,
            metadata: {
                id,
                name: id.replace(/-/g, ' '),
                description: '',
                category: 'Universal',
                version: '4.0.0',
                outcomeType: 'BINARY',
                tags: []
            },
            ui: {
                titleTemplate: id,
                variables: [],
                truthType: 'BINARY',
                resultLabels: []
            },
            logic: {
                pipeline: [],
                attestation: {
                    type: 'expression',
                    config: { expression: '0' }
                }
            },
            snapshots: {}
        };

        if (gatewayUrl) {
            this.client = new TruthGatewayClient(gatewayUrl);
        }
    }

    /**
     * Define a user input variable (e.g. threshold, targetPrice).
     */
    input(name: string, config: { label: string, type: 'number' | 'string' | 'boolean', default?: any }) {
        this.recipe.ui.variables.push({
            name,
            label: config.label,
            type: config.type,
            required: true
        });
        return this;
    }

    /**
     * Fetch data from any HTTP endpoint.
     */
    resource(id: string, config: {
        url: string,
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
        headers?: Record<string, string>,
        params?: Record<string, any>,
        body?: any,
        selector?: string,
        asType?: 'string' | 'number' | 'boolean'
    }) {
        this.recipe.logic.pipeline.push({
            type: 'universal-request',
            id,
            url: config.url,
            method: config.method || 'GET',
            headers: config.headers,
            params: config.params,
            body: config.body,
            targetVar: id,
            dependencies: [],
            selector: config.selector,
            asType: config.asType
        } as any);
        return this;
    }

    /**
     * Define a logic transformation or condition.
     */
    logic(id: string, expression: string) {
        this.recipe.logic.pipeline.push({
            type: 'transform',
            id,
            expression,
            targetVar: id,
            dependencies: this.extractDeps(expression)
        } as any);
        return this;
    }

    /**
     * Define a programmable script node.
     */
    script(id: string, language: string, code: string) {
        this.recipe.logic.pipeline.push({
            type: 'script',
            id,
            language,
            code,
            targetVar: id,
            dependencies: this.extractDeps(code)
        } as any);
        return this;
    }

    /**
     * Final truth attestation expression.
     */
    attest(expression: string) {
        this.recipe.logic.attestation.config.expression = expression;
        return this;
    }

    /**
     * Integrates a discovered Gateway capability into the Intent.
     */
    addNode(id: string, config: {
        category: string,
        method: string,
        params?: Record<string, any>,
        selector?: string,
        asType?: 'string' | 'number' | 'boolean'
    }) {
        this.recipe.logic.pipeline.push({
            type: 'standard-feed',
            id,
            category: config.category,
            method: config.method,
            params: config.params,
            targetVar: id,
            dependencies: [],
            selector: config.selector,
            asType: config.asType
        } as any);
        return this;
    }

    /**
     * Dynamically fetches available nodes from the Gateway.
     */
    async discover(): Promise<any[]> {
        if (!this.client) {
            throw new Error("Gateway URL required for discovery. Initialize with IntentBuilder('id', 'http://...')");
        }
        const data = await this.client.getNodes();
        return data || [];
    }

    /**
     * Prints a developer-friendly guide of all available Gateway capabilities.
     */
    async help(): Promise<void> {
        const nodes = await this.discover();
        console.log("\n--- TaaS Gateway Dynamic Capability Registry ---");
        console.log(`Gateway: ${this.client?.['baseUrl']}\n`);

        nodes.forEach((node: any) => {
            console.log(`🔹 [${node.value}] - ${node.label}`);
        });
        console.log("\nUse .addNode('id', config) to integrate these into your Intent.");
        console.log("------------------------------------------------\n");
    }

    private extractDeps(str: string): string[] {
        const matches = [...str.matchAll(/\$\{([^${}]+)\}/g)];
        return Array.from(new Set(matches.map(m => m[1])));
    }

    /**
     * Finalize the Intent and return the Recipe Template.
     */
    build(): RecipeTemplate {
        return this.recipe;
    }
}
