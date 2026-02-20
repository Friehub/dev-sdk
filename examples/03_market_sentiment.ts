import { Recipe, Step, Search, AI } from '../src';

/**
 * Example 03: Market Sentiment Synthesis
 * 
 * This is a high-level "Truth Node" recipe that uses web search 
 * and AI consensus to determine the sentiment of a specific market event.
 */
const marketSentimentRecipe = Recipe.define({
    name: "Event Sentiment Analysis",
    description: "Synthesizes market sentiment using proxied web search and multi-model AI.",
    category: "AI/General",
    outcomeType: "CATEGORICAL",
    inputs: {
        event: Step.input.string("Market Event", { default: "Fed Rate Decision" })
    },
    handler: async (inputs) => {
        // 1. Fetch latest news and data about the event via proxied search
        const context = await Search.query(`Latest updates and expert analysis on ${inputs.event}`);

        // 2. Pass the search results to the AI Reasoner for consensus-based synthesis
        const verdict = await AI.ask({
            model: "gemini-2.0-flash",
            prompt: `Based on the provided context, categorize the market sentiment for "${inputs.event}" as Bullish, Bearish, or Neutral.`,
            context
        });

        return verdict;
    }
});

export default marketSentimentRecipe;
