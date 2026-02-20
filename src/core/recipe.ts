import { Recipe, VariableDef, LogicNode } from './types';
import { BuilderContext } from './context';

// Import outcome types
/**
 * Supported types for the final TaaS Truth outcome.
 */
export type OutcomeType = 'BINARY' | 'SCALAR' | 'CATEGORICAL' | 'PROBABILISTIC' | 'INVALID';

/**
 * Configuration for defining a new Truth Recipe.
 */
export interface RecipeConfig {
    /** The human-readable name of the recipe. */
    name: string;
    /** A concise description of the truth-seeking logic. */
    description?: string;
    /** The domain category (e.g., 'Finance', 'Sports'). */
    category?: string;
    /** The mathematical type of the expected result. */
    outcomeType?: OutcomeType;
    /** Typed input parameters required by the handler. */
    inputs: { [key: string]: VariableDef };
    /** The async handler where the truth logic is defined using SDK nodes. */
    handler: (inputs: any) => Promise<any>;
}

/**
 * Entry point for the TaaS Recipe Engine.
 */
export class Recipe {
    /**
     * Defines a new Autonomous Truth Recipe.
     * @param config The recipe blueprint configuration.
     * @returns A RecipeDefinition instance ready for compilation.
     */
    static define(config: RecipeConfig) {
        return new RecipeDefinition(config);
    }
}

/**
 * Manages the transformation of high-level handler logic into a protocol-compliant JSON blueprint.
 */
export class RecipeDefinition {
    constructor(public config: RecipeConfig) { }

    async compile(idOverride?: string): Promise<Recipe> {
        const ctx = BuilderContext.get();
        ctx.start();

        const inputProxies: any = {};
        const variables: VariableDef[] = [];

        for (const [key, def] of Object.entries(this.config.inputs)) {
            const varDef = { ...def, name: key } as VariableDef;
            variables.push(varDef);
            inputProxies[key] = `\${${key}}`;
        }

        const result = await this.config.handler(inputProxies);
        const nodes = ctx.stop();

        let finalExpression = '0';
        if (typeof result === 'string' && result.startsWith('node_')) {
            finalExpression = result;
        } else if (typeof result === 'object' && result?.targetVar) {
            finalExpression = result.targetVar;
        } else {
            finalExpression = String(result);
        }

        return {
            id: idOverride || this.config.name.toLowerCase().replace(/\s+/g, '-'),
            metadata: {
                name: this.config.name,
                description: this.config.description || '',
                category: this.config.category || 'General',
                version: '3.2.0', // Rich outcomes version
                outcomeType: this.config.outcomeType || 'BINARY' // Default to binary for backward compat
            },
            ui: {
                titleTemplate: `${this.config.name}`,
                variables: variables,
                outcomeType: this.config.outcomeType || 'SCALAR' // UI hint
            },
            logic: {
                pipeline: nodes,
                resolution: {
                    type: 'expression',
                    config: {
                        expression: finalExpression
                    }
                }
            }
        };
    }
}
