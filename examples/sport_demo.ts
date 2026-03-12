import { IntentBuilder } from '../src/core/IntentBuilder';
import { RecipeSimulator } from '../src/core/Simulator';

/**
 * SPORT DEMO: Programmable Sports Oracle.
 * This demo showcases logic based on complex sport data (Match Result + Red Cards).
 */
async function runDemo() {
    console.log("🚀 Starting Programmable Sport Intent Demo...");

    // 1. Build the Intent
    // Use the new Universal Intent DSL
    const builder = new IntentBuilder('match-condition-oracle');

    const intent = builder
        .input('matchId', { label: 'TheSportsDB Event ID', type: 'string', default: '441613' })
        .input('minGoals', { label: 'Min Goals Required', type: 'number', default: 2 })

        // Fetch Match Data from SportDB (via Universal Request)
        .resource('match', {
            url: 'https://www.thesportsdb.com/api/v1/json/3/lookupevent.php',
            params: { id: '${matchId}' },
            selector: '$.events[0]'
        })

        // Programmable Logic: Extract specific stats
        .logic('homeGoals', 'float(${match}.intHomeScore)')
        .logic('awayGoals', 'float(${match}.intAwayScore)')
        .logic('totalGoals', '${homeGoals} + ${awayGoals}')

        // Complex Condition: High scoring game AND no extreme score (e.g. > 10)
        .logic('isHighScoring', '${totalGoals} >= ${minGoals}')
        .logic('isLegitGame', '${totalGoals} < 10')

        // Final Truth: 0 if condition met, 1 otherwise
        .attest('if(isHighScoring && isLegitGame, 0, 1)')
        .build();

    console.log("✅ Sport Intent Built.");
    console.log(JSON.stringify(intent, null, 2));

    console.log("\n-----------------------------------------");
    console.log("🛠️ Starting Local WASM Simulation (Inject-and-Test)...");

    try {
        // We use Inject-and-Test to simulate a specific match result
        const result = await RecipeSimulator.simulate(intent, {
            matchId: '441613',
            minGoals: 3,
            // Mock Match Data (Injecting Truth)
            match: {
                intHomeScore: "2",
                intAwayScore: "1"
            },
            attestationTimestamp: Date.now()
        });

        console.log("\n✨ Simulation Results:");
        console.log(`Match Summary: ${result.context.homeGoals} - ${result.context.awayGoals}`);
        console.log(`Total Goals: ${result.context.totalGoals}`);
        console.log(`High Scoring Check: ${result.context.isHighScoring}`);
        console.log(`Legit Game Check: ${result.context.isLegitGame}`);
        console.log(`-----------------------------------------`);
        console.log(`Final Truth Outcome: ${result.truth === 0 ? "PASS (Condition Met)" : "FAIL (Condition Not Met)"}`);
        console.log(`Protocol Version: ${result.proof?.version || '4.0.0'}`);

    } catch (err: any) {
        console.error("\n❌ Simulation Error:", err.message);
    }
}

runDemo();
