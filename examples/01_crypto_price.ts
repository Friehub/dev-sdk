import { Recipe, Step, TruthGatewayClient } from '../src';

/**
 * Example 01: Multi-Source Price Verification
 * 
 * This recipe demonstrates how to fetch a financial asset price 
 * through the Truth Gateway and assess it for consensus.
 */
const cryptoPriceRecipe = Recipe.define({
    name: "Verified BTC Price",
    description: "Fetches Bitcoin price from institutional sources with built-in consensus.",
    category: "Finance",
    outcomeType: "SCALAR",
    inputs: {
        symbol: Step.input.string("Asset Symbol", { default: "BTC" })
    },
    handler: async (inputs) => {
        const gateway = new TruthGatewayClient();

        // Fetch the price directly via the Truth Gateway helper
        // In a recipe, we typically return the data point for the engine to verify
        const priceData = await gateway.finance().price(inputs.symbol);

        return priceData;
    }
});

export default cryptoPriceRecipe;
