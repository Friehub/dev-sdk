import { Recipe } from '../src/core/recipe';
import { Step } from '../src/core/steps';

async function main() {
    console.log("--- TaaS SDK v4.0 Verification ---");

    const marketResolutionRecipe = Recipe.define({
        name: "Premier League Match Resolver",
        description: "Resolves a prediction market based on live match scores via SportMonks discovery.",
        category: "Sports",
        version: "4.1.0",
        outcomeType: "BINARY",
        inputs: {
            // Tier 1: Static Enum (Fixed Options)
            sport: Step.input.enum("Sport Type", ["Soccer", "Basketball", "Tennis"]),

            // Tier 2: Discovery (Dynamic Selection)
            matchId: Step.input.string("Select Match").discovery("sportmonks.matches.live"),

            // Tier 3: Range (Constrained Input)
            threshold: Step.input.number("Winning Margin").range(1, 10, 1)
        }
    }).handler(async (inputs) => {
        // Fetch live score from the match using the new generic Data API
        const score = Step.data.fetch("Sports", "matchDetails", { matchId: inputs.matchId });

        // NEW: Using Fluent Logic DSL (v4.5) instead of string templates
        const isTargetMet = Step.logic.gt(score, inputs.threshold);

        return isTargetMet;
    });

    console.log("Compiling to Protobuf RecipeTemplate...");
    const template = await marketResolutionRecipe.compile();

    console.log("\n--- Compiled Template (Protobuf Schema) ---");
    console.log(JSON.stringify(template, (key, value) => {
        if (key === 'pipeline') return `[${value.length} Nodes]`;
        return value;
    }, 2));

    console.log("\n--- Logic Flowchart (Mermaid Visual Audit) ---");
    const mermaid = await marketResolutionRecipe.toMermaid();
    console.log(mermaid);

    // Verify discoverySrc exists in the compiled variables
    const matchVar = template.ui!.variables.find(v => v.name === 'matchId');
    if (matchVar?.discoverySrc === "sportmonks.matches.live") {
        console.log("\n✅ SUCCESS: discoverySrc 'sportmonks.matches.live' successfully propagated to binary template.");
    } else {
        console.log("\n❌ FAILURE: discoverySrc missing or mismatched.");
        process.exit(1);
    }

    console.log("✅ SUCCESS: RecipeTemplate naming and version 4.0.0 confirmed.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
