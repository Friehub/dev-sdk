import { BuilderContext } from '../core/context';
import { z } from 'zod';

/**
 * Engine for performing AI reasoning and consensus through the Friehub Prediction Network.
 */
export class AI {
    /**
     * Asks an AI model a question, optionally providing a search context or strict Zod schema.
     * @param options Configuration including model choice, prompt, and optional context.
     * @returns A node object representing the distilled AI result.
     */
    static async ask(options: {
        model: string,
        prompt: string,
        context?: any,
        schema?: z.ZodType<any>
    }): Promise<any> {
        const ctx = BuilderContext.get();
        const uniqueId = `reasoner_${Math.floor(Math.random() * 100000)}`;

        // If schema is provided, we might append format instructions to prompt
        // or configure the node to enforce JSON (if engine supports it)
        // For now, we pass the raw prompt.

        let contextVar = undefined;
        if (options.context && options.context.targetVar) {
            contextVar = options.context.targetVar;
        }

        ctx.addNode({
            id: uniqueId,
            type: 'reasoner',
            question: options.prompt,
            models: [options.model],
            contextVar: contextVar,
            targetVar: uniqueId,
            strategy: 'majority'
        });

        return {
            targetVar: uniqueId,
            toString: () => `\${${uniqueId}}`
        };
    }
}
