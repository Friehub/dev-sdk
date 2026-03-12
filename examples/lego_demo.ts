import { LegoBuilder } from '../src/core/LegoBuilder';
import { RecipeSimulator } from '../src/core/Simulator';

/**
 * LEGO DEMO: No-Code Visual Oracle Blocks.
 * Demonstrates the "7-year-old" user flow using Visual Blocks and AI Prompts.
 */
async function runDemo() {
    console.log("🧱 Starting Lego-based No-Code Demo...");

    // 1. THE "7-YEAR-OLD" FLOW: Visual Blocks
    console.log("\n--- [FLOW A] Connection Blocks ---");
    const lego = LegoBuilder.create('my-first-oracle');
    const recipe = lego
        .addPriceBlock('ETH') // "Add an Ethereum Price Lego Block"
        .addThresholdBlock('token_price', 2500) // "If it's over $2500"
        .attestCondition('check'); // "That's my truth"

    console.log("✅ Oracle built using visual-style blocks (No raw JSON/Regex).");

    // 2. THE "AI PROMPT" FLOW: Natural Language
    console.log("\n--- [FLOW B] Natural Language Prompt ---");
    const aiLego = LegoBuilder.create('ai-intent');
    const aiRecipe = await aiLego.fromPrompt("Check if Bitcoin is over 85000");

    console.log("✅ Oracle generated from AI Prompt.");
    console.log(`Intent Structure: ${aiRecipe.id}`);

    // 3. SIMULATION (User Verification)
    console.log("\n--- [FLOW C] User Simulation ---");
    try {
        const result = await RecipeSimulator.simulate(aiRecipe, {
            token_price: 92000, // Simulated aggregate from gateway
            attestationTimestamp: Date.now()
        });

        console.log(`Result: ${result.truth === 0 ? 'TRUE (Market Met)' : 'FALSE (Market Not Met)'}`);
        console.log(`Logic Trace: ${result.context.check}`);
    } catch (e: any) {
        console.error("Simulation failed", e.message);
    }
}

runDemo();
