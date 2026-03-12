import { IntentBuilder } from './IntentBuilder';
import { RecipeTemplate } from './types';

/**
 * Lego Builder: The Visual Block Foundation.
 * This class abstracts away the technical IntentBuilder syntax into "Blocks".
 * Perfect for LLM-driven logic generation and non-technical users.
 */
export class LegoBuilder {
    private builder: IntentBuilder;

    private constructor(name: string, gatewayUrl?: string) {
        this.builder = new IntentBuilder(name, gatewayUrl);
    }

    /**
     * Start a new Lego Intent.
     */
    public static create(name: string, gatewayUrl?: string): LegoBuilder {
        return new LegoBuilder(name, gatewayUrl);
    }

    /**
     * DATA BLOCK: Price Feed
     * High-level abstraction for "crypto.price" capability.
     */
    public addPriceBlock(symbol: string, id: string = 'token_price'): this {
        this.builder.addNode(id, {
            category: 'crypto',
            method: 'price',
            params: { symbol },
            asType: 'number'
        });
        return this;
    }

    /**
     * DATA BLOCK: Sport Score
     * High-level abstraction for "sports.football.score" capability.
     */
    public addSportScoreBlock(matchId: string, id: string = 'match_score'): this {
        this.builder.addNode(id, {
            category: 'sports',
            method: 'score',
            params: { matchId },
            asType: 'number' // Home score by default or composite object
        });
        return this;
    }

    /**
     * LOGIC BLOCK: Threshold Check
     * "If value is greater than threshold"
     */
    public addThresholdBlock(targetVar: string, threshold: number, id: string = 'check'): this {
        this.builder.logic(id, `\${${targetVar}} >= ${threshold}`);
        return this;
    }

    /**
     * ACTION BLOCK: Final Attestation
     * "Attest the truth based on condition"
     */
    public attestCondition(conditionVar: string): RecipeTemplate {
        return this.builder
            .attest(`if(\${${conditionVar}}, 0, 1)`)
            .build();
    }

    /**
     * PROMPT BLOCK: AI-driven logic generation
     * Mock for natural language to blocks.
     */
    public async fromPrompt(prompt: string): Promise<RecipeTemplate> {
        // In a real system, this would call an LLM (e.g. Gemini) to return blocks
        console.log(`🤖 AI interpreting prompt: "${prompt}"...`);

        if (prompt.toLowerCase().includes('bitcoin') && prompt.includes('over')) {
            const match = prompt.match(/(\d+)/);
            const price = match ? parseInt(match[0]) : 70000;
            return this.addPriceBlock('BTC')
                .addThresholdBlock('token_price', price)
                .attestCondition('check');
        }

        throw new Error("AI could not interpret prompt. Try 'Check if Bitcoin is over 75000'");
    }
}
