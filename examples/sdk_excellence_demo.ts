import { Recipe, Step, Truth } from '../src';

/**
 * TaaS SDK Excellence Demo: Local-First Workflow
 * 
 * Shows how to build, validate, and test recipes entirely offline
 * using the new SDKValidator and LocalEngine.
 */
async function runDemo() {
    console.log("--- TaaS SDK Excellence: Local-First Workflow ---");

    // 1. Define a Recipe with strict inputs
    const myRecipe = Recipe.define({
        name: "SDK Excellence Demo",
        outcomeType: "BINARY",
        inputs: {
            threshold: Step.input.number("Price Threshold")
                .validation({ min: 1000, max: 100000 })
                .placeholder("e.g. 50000"),
            asset: Step.input.select("Crypto Asset")
                .options([
                    { label: "Bitcoin", value: "BTC" },
                    { label: "Ethereum", value: "ETH" }
                ])
        },
        async handler(inputs) {
            const price = Truth.crypto.price({ symbol: inputs.asset });

            // Logic: Is Price > Threshold?
            return Step.logic.condition(`\${${price}} > \${${inputs.threshold}}`, ["YES"], ["NO"]);
        }
    });

    // 2. Local Execution with Mock Data
    console.log("\n[TEST 1] Successful Local Execution");
    try {
        const result = await myRecipe.test(
            { threshold: 55000, asset: "BTC" },
            {
                mocks: {
                    "crypto.price": (params: any) => params.symbol === "BTC" ? 60000 : 2500,
                }
            }
        );
        console.log("-> Truth Result:", result.truth); // YES
        console.log("-> Node Trace:", Object.keys(result.trace).length, "nodes executed");
    } catch (e: any) {
        console.error("-> Failed:", e.message);
    }

    // 3. Validation Failure (Out of Range)
    console.log("\n[TEST 2] Input Validation (Out of Range)");
    try {
        await myRecipe.test({ threshold: 500, asset: "BTC" });
    } catch (e: any) {
        console.log("-> Expected Error Caught:", e.message);
    }

    // 4. Validation Failure (Invalid Option)
    console.log("\n[TEST 3] Choice Validation");
    try {
        await myRecipe.test({ threshold: 50000, asset: "DOGE" });
    } catch (e: any) {
        console.log("-> Expected Error Caught:", e.message);
    }

    // 5. Static Analysis (Cycle Detection)
    console.log("\n[TEST 4] Static DAG Analysis (Cycle Detection)");
    try {
        const cycleRecipe = Recipe.define({
            name: "Cycle Error",
            inputs: {},
            async handler() {
                // Manually creating a circular dependency if we could...
                // But the builder makes it hard. Let's try to simulate one.
                console.log("Compiling cycle...");
            }
        });

        const blueprint = await cycleRecipe.compile();
        // Force a cycle in the blueprint nodes for demonstration
        blueprint.logic.pipeline.push({
            id: 'A', type: 'logic-op', params: { a: '${B}' }, targetVar: 'A'
        } as any);
        blueprint.logic.pipeline.push({
            id: 'B', type: 'logic-op', params: { a: '${A}' }, targetVar: 'B'
        } as any);

        const { SDKValidator } = await import('../src/core/Validation');
        SDKValidator.analyzeDAG(blueprint);
    } catch (e: any) {
        console.log("-> Expected Static Analysis Error:", e.message);
    }

    console.log("\n--- Demo Complete ---");
}

runDemo().catch(console.error);
