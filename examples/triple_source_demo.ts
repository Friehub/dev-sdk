import { IntentBuilder } from '../src/core/IntentBuilder';
import { RecipeSimulator } from '../src/core/Simulator';

/**
 * TRIPLE-SOURCE DEMO: Resilient Crypto Oracle.
 * This demo showcases the new "Capability" layer where the Gateway 
 * automatically aggregates from 3 sources (Binance, CoinGecko, CMC).
 */
async function runDemo() {
    console.log("🚀 Starting Resilient Multi-Source Oracle Demo...");

    // 1. Build the Intent using a Capability ID
    // We don't specify the URL or Plugin, just the "crypto.price" capability
    const builder = new IntentBuilder('resilient-btc-price');

    const intent = builder
        .input('threshold', { label: 'Price Threshold', type: 'number', default: 95000 })

        // Use the new "Capability" node (requires Gateway support)
        // For local simulation, we can still use Inject-and-Test
        .addNode('crypto_price', {
            category: 'crypto',
            method: 'price',
            params: { symbol: 'BTC' },
            asType: 'number'
        })

        // Complex Logic: Check if Median Price is above threshold
        .logic('isOver', '${crypto_price} >= ${threshold}')

        // Final Truth: PASS if price is high enough
        .attest('if(isOver, 0, 1)')
        .build();

    console.log("✅ Intent Built using 'crypto.price' Capability.");

    console.log("\n-----------------------------------------");
    console.log("🛠️ Local Logic Simulation (Verifying Aggregate Consumption)...");

    try {
        // We simulate what the GATEWAY would return after aggregation
        const simulationResult = await RecipeSimulator.simulate(intent, {
            threshold: 90000,
            // Gateway returns a single aggregated number for the capability
            crypto_price: 91234.56,
            attestationTimestamp: Date.now()
        });

        console.log("\n✨ Simulation Results:");
        console.log(`Median BTC Price (Aggregated): $${simulationResult.context.crypto_price}`);
        console.log(`Threshold Check: ${simulationResult.context.isOver}`);
        console.log(`-----------------------------------------`);
        console.log(`Final Truth Outcome: ${simulationResult.truth === 0 ? "PASS (High Price)" : "FAIL (Low Price)"}`);
        console.log(`Protocol Version: ${simulationResult.proof?.version || '4.0.0'}`);

    } catch (err: any) {
        console.error("\n❌ Simulation Error:", err.message);
    }
}

runDemo();
