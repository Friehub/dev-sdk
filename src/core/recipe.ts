import { Recipe, VariableDef, LogicNode } from './types';
import { BuilderContext } from './context';

// Import outcome types
export type OutcomeType = 'BINARY' | 'SCALAR' | 'CATEGORICAL' | 'PROBABILISTIC' | 'INVALID';

export interface RecipeConfig {
    name: string;
    description?: string;
    category?: string;

    // NEW: Outcome type declaration
    outcomeType?: OutcomeType;

    inputs: { [key: string]: VariableDef };
    handler: (inputs: any) => Promise<any>;
}

export class Recipe {
    static define(config: RecipeConfig) {
        return new RecipeDefinition(config);
    }
}

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
