# @friehub/taas-sdk

**Institutional Developer Kit for Decentralized Truth Attestation**

`@friehub/taas-sdk` is the official development toolkit for interacting with the Friehub Truth-as-a-Service (TaaS) ecosystem. It allows developers to build, verify, and deploy "Truth Recipes" and interact with the **Sovereign Truth Gateway** using a professional, type-safe interface.

---

## Core Capabilities

This SDK abstracts the complexity of decentralized data fetching and consensus, providing three primary integration paths:

### 1. The Recipe Engine (Autonomous Logic)
Define deterministic execution flows (DAGs) that describe exactly how "Truth" should be derived from the world.
- **Strictly Typed Inputs**: Define parameters for your truth requests (e.g., Asset Symbols, Match IDs).
- **Logical Nodes**: Chain together `Search`, `AI Reasoning`, and `Data Extraction` nodes.
- **Autonomous Execution**: Compiled recipes can be executed by any Friehub Node without local infrastructure.

### 2. The Truth Gateway Client (Thin Integration)
For applications that need direct access to verified data without building full recipes.
- **Zero-Key Architecture**: Fetch data from 50+ premium providers without managing individual API keys.
- **Institutional Domains**: Semantic helpers for Finance, Sports, Economics, and Environmental data.
- **Built-in Resilience**: Automatic fallback and circuit breaking handled at the gateway level.

### 3. AI & Search Synthesis
Native integration with the Friehub Prediction Engine:
- **Search Feed**: Proxied, high-quality web search results.
- **AI Reasoners**: Multi-model consensus (Gemini, Claude, GPT) to analyze unstructured data.

---

## Available Data Domains

Through the `TruthGatewayClient`, developers have immediate access to:

| Domain | Available Data | Usage Example |
| :--- | :--- | :--- |
| **Finance** | Spot Prices, Historical PriceAt, Forex Pairs | `gateway.finance().price('BTC')` |
| **Sports** | Livescores, Schedules, Match Details (10+ Sports) | `gateway.sports().livescore('EPL')` |
| **Economics**| FRED Series (GDP, Inflation), Employment Data | `gateway.economics().series('CPIAUCSL')` |
| **Environmental** | Real-time Weather, Global Forecasts | `gateway.environmental().current(lat, lon)` |

---

## Example Gallery

Explore full implementation templates in the [/examples](file:///home/oxisrael/Friehub/Taas/taas-sdk/examples) directory:

1.  **[01_crypto_price.ts](file:///home/oxisrael/Friehub/Taas/taas-sdk/examples/01_crypto_price.ts)**: Institutional-grade price verification using the Truth Gateway.
2.  **[02_sports_result.ts](file:///home/oxisrael/Friehub/Taas/taas-sdk/examples/02_sports_result.ts)**: Attesting to real-world sports match outcomes with structured metadata.
3.  **[03_market_sentiment.ts](file:///home/oxisrael/Friehub/Taas/taas-sdk/examples/03_market_sentiment.ts)**: Subjective truth synthesis using proxied Search + AI Reasoner nodes.

---

## Quick Start Guide

### Installation
```bash
pnpm add @friehub/taas-sdk
```

### Path A: Building an Autonomous Recipe
The most powerful way to use TaaS. Define the logic once, run it anywhere.

```typescript
import { Recipe, Step, AI, Search } from '@friehub/taas-sdk';

const verifier = Recipe.define({
  name: "Asset News Sentiment",
  inputs: {
    symbol: Step.input.string("Target Asset", { default: "ETH" })
  },
  handler: async (inputs) => {
    // 1. Fetch latest market news via Gateway Search
    const context = await Search.query(`Latest crypto news for ${inputs.symbol}`);
    
    // 2. Synthesize truth using AI Consensus
    const result = await AI.ask({
      model: "gemini-2.0-flash",
      prompt: "Based on the news, is there a significant bullish trend?",
      context
    });

    return result;
  }
});

const blueprint = await verifier.compile();
```

### Path B: Using the Truth Gateway Client
Perfect for traditional backends needing verified data snapshots.

```typescript
import { TruthGatewayClient } from '@friehub/taas-sdk';

const gateway = new TruthGatewayClient('https://api.friehub.cloud');

// Get verified Bitcoin price from institutional sources
const btcData = await gateway.finance().price('BTC');
console.log(`Current Price: ${btcData.value}`);
```

---

## Security & Best Practices
- **Environment Isolation**: Always use `process.env.INDEXER_API_URL` to configure your gateway endpoint.
- **Deterministic Outcomes**: Ensure your recipe logic doesn't rely on `Math.random()` or non-deterministic variables.
- **Redaction**: The SDK automatically masks sensitive metadata in logs to prevent credential leakage.

---
 2026 Friehub Protocol. All Rights Reserved.
Licensed under the MIT Enterprise License.
