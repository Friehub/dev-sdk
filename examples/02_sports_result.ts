import { Recipe, Step, TruthGatewayClient } from '../src';

/**
 * Example 02: Sports Result Attestation
 * 
 * This recipe demonstrates how to fetch a match result 
 * for a specific league and competition.
 */
const sportsResultRecipe = Recipe.define({
    name: "Premier League Result",
    description: "Attests to the final score of a Premier League match.",
    category: "Sports",
    outcomeType: "CATEGORICAL",
    inputs: {
        matchId: Step.input.string("Match ID"),
        league: Step.input.string("League", { default: "EPL" })
    },
    handler: async (inputs) => {
        const gateway = new TruthGatewayClient();

        // Fetch match details via the sports domain helper
        const match = await gateway.sports().matchDetails(inputs.matchId);

        return match;
    }
});

export default sportsResultRecipe;
