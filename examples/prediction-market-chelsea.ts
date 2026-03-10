import { Recipe, RecipeConfig } from '@friehub/taas-sdk';

/**
 * Natural Recipe Template: Sports Event Resolution
 * 
 * This recipe is a "Template". A platform like Polymarket would deploy this once,
 * and then instantiate it for specific markets by providing inputs.
 */
const sportsScoreRecipe = Recipe.define({
    name: "Match Score Truth",
    description: "Resolves if a specific team scored in a match",
    category: "Sports",
    outcomeType: "BINARY",
    inputs: {
        team_name: { type: 'string', label: 'Team Name', required: true },
        match_date: { type: 'date', label: 'Match Date', required: true }
    },
    // The handler defines the logic flow
    handler: async (inputs) => {
        // 1. Fetch match data from SportMonks via the TaaS Gateway Hive
        // This is a "Standard Feed" node in the protocol
        const matchData = await Recipe.fetch('sportmonks', 'get_team_match_data', {
            team: inputs.team_name,
            date: inputs.match_date
        });

        // 2. Compute the truth (Did they score?)
        // This becomes a "Condition" node in the protocol
        const didScore = matchData.goals > 0;

        return didScore;
    }
});

/**
 * Usage Example:
 * Will Chelsea score a goal on 2026-03-10?
 */
async function createMarket() {
    // 1. Compile the template to a protocol-compliant Blueprint
    const blueprint = await sportsScoreRecipe.compile();
    console.log("Recipe Blueprint Hash:", blueprint.id);

    // 2. The platform (Polymarket) now creates a specific instance
    // In our ecosystem, this means requesting a Truth-Node to execute 
    // the blueprint with specific inputs.
    const marketInputs = {
        team_name: "Chelsea",
        match_date: "2026-03-10"
    };

    console.log("Market for Chelsea Goal ready for resolution.");
    // In production, this blueprint + inputs are sent to the TaaS P2P Network
}

createMarket();
