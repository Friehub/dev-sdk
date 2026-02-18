import { Recipe } from '../core/recipe';
import { Step } from '../core/steps';
import { Search } from '../feeds/search';
import { AI } from '../feeds/ai';

export const SubjectiveGeneral = Recipe.define({
    name: "General Subjective Question (Transpiled)",
    description: "Resolves any subjective question using real-time search and AI reasoning.",
    category: "Social",
    inputs: {
        searchQuery: Step.input.string("Search Query"),
        reasoningQuestion: Step.input.string("Reasoning Question")
    },
    handler: async ({ searchQuery, reasoningQuestion }) => {
        // 1. Fetch Information
        // We use the 'serper' engine with 10 results (as verified in testing)
        const searchResults = await Search.query(searchQuery, {
            engine: 'serper',
            count: 10
        });

        // 2. AI Reasoning
        // We explicitly pass the search results as context
        const sentiment = await AI.ask({
            model: 'llama-3.3-70b-versatile',
            prompt: `${reasoningQuestion} Based on the evidence, determine the outcome. Rules: Return 0 if the answer is YES (Likely). Return 1 if the answer is NO (Unlikely). Return 2 if the answer is UNCERTAIN (Conflicting or insufficient evidence). ONLY return the number.`,
            context: searchResults
        });

        return sentiment;
    }
});
