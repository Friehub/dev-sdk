import axios from 'axios';

async function auditSchemas() {
    console.log("🔍 AUDITING RAW API SCHEMAS...\n");

    const targets = [
        {
            name: "Binance BTC",
            url: "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        },
        {
            name: "CoinGecko BTC",
            url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        },
        {
            name: "SportDB Match 441613",
            url: "https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=441613"
        }
    ];

    for (const target of targets) {
        try {
            console.log(`📡 Fetching ${target.name}...`);
            const response = await axios.get(target.url, { timeout: 5000 });
            console.log(`✅ Success for ${target.name}`);
            console.log("Raw Response Structure:");
            console.log(JSON.stringify(response.data, null, 2).slice(0, 500) + "...");
            console.log("-------------------------------------------\n");
        } catch (e: any) {
            console.error(`❌ Failed ${target.name}: ${e.message}`);
        }
    }

    // CMC requires key, trying sandbox/public if possible or just skipping
    console.log("📡 Note: CoinMarketCap requires an API key. Skipping raw fetch to avoid 401.");
}

auditSchemas();
