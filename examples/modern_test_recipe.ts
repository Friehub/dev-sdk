import { Recipe, Step, Truth, CryptoAssets } from '../src';

/**
 * Modern TaaS Recipe: BTC Threshold Alert
 * 
 * Demonstrates:
 * 1. Using SDK Constants (CryptoAssets)
 * 2. Semantic Truth Feed (Truth.crypto().price)
 * 3. User Input (threshold)
 * 4. Rich Attestation (binary result)
 */
async function run() {
    const btcAlertRecipe = Recipe.define({
        name: "BTC Price Threshold Alert",
        description: "Checks if Bitcoin price is above a custom threshold using multi-source consensus.",
        category: "finance",
        outcomeType: "BINARY",
        inputs: {
            threshold: Step.input.number("Alert Threshold (USD)", { default: 60000 })
        },
        handler: async (inputs) => {
            // 1. Fetch live BTC price from the decentralized network
            // The Truth.crypto helper automatically selects the 'crypto' category and 'price' method
            const btcPrice = await Truth.crypto().price(CryptoAssets.BITCOIN);

            // 2. Perform math comparison inside the node
            const isAbove = `\${${btcPrice}} > \${${inputs.threshold}}`;

            return isAbove;
        }
    });

    // 1. Compile to JSON Blueprint
    const blueprint = await btcAlertRecipe.compile();
    console.log("--- COMPILED BLUEPRINT ---");
    console.log(JSON.stringify(blueprint, null, 2));

    /*
    // 2. Deploy to Production Gateway (Commented out until ready)
    // const client = new TruthGatewayClient("https://gateway.friehub.com"); 
    // await btcAlertRecipe.deploy(client, process.env.TAAS_AUTH_TOKEN);
    */
}

run().catch(console.error);
