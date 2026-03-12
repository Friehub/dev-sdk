import { SportsClient } from '../src/core/SportsClient';

async function main() {
    console.log("--- TaaS Sports SDK Discovery Demo ---");

    // Gateway running on port 8080
    const sports = new SportsClient('http://localhost:8080');

    console.log("1. Discovering Active Football Matches...");
    const discovery = await sports.listLiveMatches();

    if (!discovery || !discovery.matches) {
        console.error("Failed to discover matches or none active.");
        return;
    }

    const matches = discovery.matches;
    console.log(`Found ${matches.length} active matches.`);

    // Display first 3 matches
    matches.slice(0, 3).forEach((m: any) => {
        console.log(`📍 [ID: ${m.Id}] ${m.HomeTeam} vs ${m.AwayTeam} (${m.League})`);
    });

    if (matches.length > 0) {
        const testMatchId = matches[0].Id;
        console.log(`\n2. Fetching Real-time Score for Match ID: ${testMatchId}...`);

        try {
            const score = await sports.getMatchScore(testMatchId);
            console.log("✅ Live Score Result:");
            console.log(`🏟️  ${score.match}`);
            console.log(`📊 Result: ${score.home_score} - ${score.away_score}`);
            console.log(`⏱️  Status: ${score.status}`);
        } catch (e: any) {
            console.error("Failed to fetch score:", e.message);
        }
    }
}

main().catch(console.error);
