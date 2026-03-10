import { Recipe, Step, Truth } from '../src';
import { SupportedCrypto } from '../src/constants/assets';

/**
 * TaaS Recipe: Prediction Market Resolution (Polymarket Style)
 * 
 * Logic:
 * 1. User inputs a crypto asset and a target price.
 * 2. Truth Feed fetches the price at a specific resolution date.
 * 3. Logic determines if the price is ABOVE the target (BINARY).
 */
export const recipe = Recipe.define({
    name: "Crypto Price Prediction (Above X)",
    description: "Determines if an asset is above a target price at a specific date.",
    category: "PREDICTION_MARKET",
    outcomeType: "BINARY",
    inputs: {
        asset: Step.input.string("Crypto Asset")
            .renderAs("dynamic-search")
            .source("discovery.crypto")
            .hint("Search for any crypto asset supported by CoinGecko/Binance"),

        targetPrice: Step.input.number("Target Price ($)")
            .renderAs("number")
            .placeholder("100000")
            .hint("Enter the strike price for this market"),

        resolutionDate: Step.input.date("Resolution Date")
            .renderAs("date")
            .hint("When should the price be checked?")
    }
})
    .handler(async (inputs) => {
        // 1. Fetch the historical price at the resolution timestamp
        // We convert date string to timestamp internally or keep it as string
        const price = await (Truth as any).crypto.priceAt({
            symbol: inputs.asset,
            timestamp: inputs.resolutionDate
        });

        // 2. Compare against targetPrice
        // Returns a boolean literal that the execution engine captures
        return Step.logic.condition(`\${${price}} >= \${${inputs.targetPrice}}`, ['true'], ['false']);
    });

export default recipe;
