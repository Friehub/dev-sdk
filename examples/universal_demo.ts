import { IntentBuilder, RecipeSimulator } from '../src/index';

async function main() {
    console.log("🚀 Starting Universal Intent Demo...");

    // 1. Define the Intent (Resource-Agnostic)
    const recipe = IntentBuilder.create("Binance BTC Price Monitor")
        .description("Fetches real-time BTC price and checks threshold parity")
        .input("threshold", { type: "number", label: "USD Threshold" })
        .resource("ticker", {
            url: "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
            method: "GET",
            selector: "$.price",
            asType: "number"
        })
        .logic("priceValue", "${ticker}")
        .logic("isAbove", "${priceValue} > ${threshold}")
        // Truth is 0 (PASS/TRUE) or 1 (FAIL/FALSE)
        .attest("if(isAbove, 0, 1)")
        .build();

    console.log("✅ Universal Intent Built.");
    console.log("-----------------------------------------");
    console.log(JSON.stringify(recipe, null, 2));
    console.log("-----------------------------------------");

    // 2. Local Simulation with Sovereign Rust Engine (WASM)
    console.log("🛠️ Starting Local WASM Simulation...");

    try {
        const thresholdValue = 60000;
        console.log(`\n⏳ Simulating BTC Price Check (Threshold: $${thresholdValue})...`);

        let result;
        try {
            result = await RecipeSimulator.simulate(recipe, {
                threshold: thresholdValue,
                attestationTimestamp: Date.now()
            });
        } catch (simErr: any) {
            console.warn(`\n⚠️ Live Fetch Failed: ${simErr.message}. Falling back to Mock Data for demonstration.`);
            // Mock data for demonstration when network is blocked
            const mockRecipe = { ...recipe };
            result = await RecipeSimulator.simulate(recipe, {
                threshold: thresholdValue,
                attestationTimestamp: Date.now(),
                // Pre-bind the 'ticker' value for mock run
                ticker: 65432.10
            });
        }

        console.log("\n✨ Simulation Results:");
        console.log(`Current BTC Price: $${result.context.priceValue}`);
        console.log(`Target Threshold: $${thresholdValue}`);
        console.log(`Condition (Price > Threshold): ${result.context.isAbove}`);
        console.log(`-----------------------------------------`);
        console.log(`Final Truth Outcome: ${result.truth === 0 ? "PASS (Condition Met)" : "FAIL (Condition Not Met)"}`);
        console.log(`Protocol Version: ${result.proof?.version || '4.0.0'}`);
        console.log(`Execution Trace Status: ${result.trace?.status || 'COMPLETED'}`);

    } catch (err: any) {
        console.error("\n❌ Simulation Error:", err.message);
    }
}

main();
