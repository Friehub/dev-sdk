import { Recipe, Step, Truth } from '../src';

/**
 * FrieMarket Prediction Recipe
 *
 * Demonstrates the power of TaaS v2 SDK by defining rich UI inputs
 * that seamlessly compile into a Sovereign Truth DAG.
 * 
 * Flow:
 * 1. User selects an Asset via a dynamic Gateway search component.
 * 2. User sets a target price threshold via a numeric input.
 * 3. User sets a resolution date.
 * 4. The TaaS node fetches the crypto price at that date.
 * 5. Returns a boolean truth outcome (True/False) to TruthOracleV2.
 */
export const recipe = Recipe.define({
    name: "FrieMarket Crypto Prediction",
    description: "Resolves a prediction market based on a cryptocurrency's price at a specific date.",
    category: "finance",
    outcomeType: "BINARY", // Explicitly telling TruthOracleV2 we are returning a Boolean
    inputs: {
        // Dynamic search input: the Dashboard uses the Gateway to search for the asset (e.g., BTC, ETH)
        assetId: Step.input.string("Asset ID")
            .renderAs("dynamic-search")
            .source("crypto.searchAssets", { limit: 10 })
            .hint("Search for the cryptocurrency ticket (e.g. bitcoin)"),

        // Numeric threshold input
        targetPrice: Step.input.number("Target Price (USD)")
            .renderAs("number")
            .validation({ min: 0 })
            .hint("The price the asset must reach or exceed"),

        // Date picker for market resolution
        resolutionDate: Step.input.date("Resolution Date")
            .hint("When should the Node fetch the historical price?"),

        // Arbitrary boolean configuration
        strictGreater: Step.input.boolean("Strictly Greater Than?")
            .renderAs("toggle")
            .hint("If yes, the price must be strictly greater than the threshold (not equal).")
    },
    handler: async (inputs: { assetId: any, targetPrice: any, resolutionDate: any, strictGreater: any }) => {
        // Step 1: Fetch the price of the asset at the specified date using the Truth wrapper
        const price = await Truth.crypto().priceAt(inputs.assetId, inputs.resolutionDate);

        // Step 2: Build the condition logic dynamically based on the strict tracker input
        // Using TaaS template literal injection, the DAG processes this string securely.
        const operator = `\${${inputs.strictGreater}} ? ">" : ">="`;

        // Return the final string evaluation for the DAG
        return `\${${price}} \${${operator}} \${${inputs.targetPrice}}`;
    }
});
