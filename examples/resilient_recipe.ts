import { Recipe, Step, Truth } from '../src';

/**
 * Example: Resilient Football Result Recipe
 * 
 * Demonstrates:
 * 1. Optional Nodes: SportMonks can fail without breaking the DAG.
 * 2. Dynamic DataPath: Overriding the default '0' index to get a specific match.
 * 3. Fallback Logic: If SportMonks fails, The Odds API is called.
 */
export async function createResilientRecipe() {
    return Recipe.define({
        name: "EPL Match Result (Resilient)",
        description: "Fetches match result with multiple fallbacks",
        category: "SPORTS",
        version: "2.0.0"
    })
        .withInput(Step.input.number("Fixture ID (SportMonks)"))
        .withInput(Step.input.string("League Slug (The Odds API)"))

        .handler(async (inputs) => {
            // 1. Primary Source: SportMonks (Optional)
            // We use a custom dataPath if we wanted, but fixtureId is unique.
            const primaryResult = await Truth.fetch('sportmonks.fixture',
                { fixtureId: inputs.fixtureId },
                { timeout: 5000 }
            );
            Step.logic.optional(); // Mark as optional

            // 2. Secondary Source: The Odds API (Fallback)
            // Here we demonstrate DYNAMIC DATAPATH to select a match in a list
            const secondaryResult = await Truth.sports().livescore(inputs.leagueSlug, {
                dataPath: 'matches.0.score', // Override default to get specific field
                timeout: 8000
            });

            // 3. Logic: If primary fails (null), use secondary
            Step.logic.fallback(primaryResult.targetVar, secondaryResult.id);

            return primaryResult; // Distiller will handle the DAG branch
        })
        .compile();
}

console.log("Resilient Recipe Blueprint Generated successfully.");
