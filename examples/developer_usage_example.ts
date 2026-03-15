/**
 * EXAMPLE: "Will Ronaldo have a yellow card in Chelsea vs Real Madrid?"
 * This demonstrates the full TaaS 4.0 DApp Lifecycle.
 */
async function predictionMarketExample() {
    const client = new TaasClient();

    // 1. DEVELOPER PHASE: Logic Design
    // The dev publishes a 'yellow card' recipe that uses the gateway 'sports.football.cards.yellow' capability.
    const recipeId = 'sports.football.yellowcard.v1';
    console.log(`[Developer] Initializing Market with Template: ${recipeId}`);

    // 2. USER PHASE: Discovery & Parameter Binding
    // In the DApp UI, we fetch live matches during the user's booking flow.
    const liveMatches = await client.getLiveDiscovery('football', 'list', { league: 'UCL' });
    const selectedMatch = liveMatches[0]; // User selects 'Chelsea vs Real Madrid'
    
    const userInput = {
        matchId: selectedMatch.id, // e.g. 'CHEL-RMA-4455'
        playerName: 'Cristiano Ronaldo' // User types this or selects from team roster discovery
    };

    // 3. DEPLOY PHASE: Secure Intent (Multi-chain Flow)
    // We cannot pass raw 'matchId' and 'playerName' on-chain (too expensive).
    // Instead, we prepare them off-chain and commit the CID.
    
    // a) Upload full parameters to TDS Swarm (off-chain)
    const inputCid = await client.uploadInputsToTds(userInput);
    console.log('[Developer] Parameters uploaded to TDS. CID:', inputCid);

    // b) Register the Intent on Mantle (on-chain commitment)
    const resolutionBatchTime = new Date('2024-03-14T23:30:00Z').getTime(); 
    const intent = await client.registerResolutionIntent({
        recipeId,
        inputCid, // Only the CID goes on-chain
        trigger: {
            type: 'time',
            value: resolutionBatchTime
        },
        priority: 'high',
        memo: `UCL Prediction: Ronaldo Yellow Card`
    });

    console.log('[Developer] Market Deployed! Intent Registered with CID on-chain:', intent.intentId);
}
