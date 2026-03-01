# @friehub/taas-sdk

**Developer SDK for the TaaS Protocol**

`@friehub/taas-sdk` provides the core type definitions, interfaces, and client utilities used by developers integrating with the TaaS Truth-as-a-Service ecosystem. It is the foundational layer shared between TaaS nodes, gateways, backends, and plugin authors.

---

## Installation

```bash
pnpm add @friehub/taas-sdk
```

---

## What's Included

### Type Definitions

Shared types used across all TaaS components:

```typescript
import {
    RecipeExecutionResult,
    TruthAttestation,
    ExecutionProof,
    OutcomeType
} from '@friehub/taas-sdk';

// RecipeExecutionResult: returned by the execution-engine
const result: RecipeExecutionResult = {
    success: true,
    winningOutcome: 1,
    signature: '0x...',
    proof: {
        recipeHash: '0x...',
        executionTrace: [...]
    }
};
```

### TruthGatewayClient

A typed HTTP client for interacting with the TaaS Truth Gateway. Use this when you need verified data without running a full node.

```typescript
import { TruthGatewayClient } from '@friehub/taas-sdk';

const client = new TruthGatewayClient({
    baseUrl: process.env.INDEXER_API_URL || 'https://gateway.friehub.com'
});

// Fetch verified price data
const btcPrice = await client.finance().price('BTC');

// Fetch sports data
const match = await client.sports().livescore('EPL');
```

### Available Gateway Domains

| Domain | Methods | Description |
|---|---|---|
| `finance()` | `price(symbol)`, `priceAt(symbol, timestamp)` | Spot and historical prices |
| `sports()` | `livescore(league)`, `result(matchId)` | Live scores and match results |
| `economics()` | `series(id)` | FRED macro-economic indicators |
| `weather()` | `current(lat, lon)` | Real-time weather conditions |

---

## Recipe Authoring

The SDK provides types for authoring and compiling TaaS Recipes:

```typescript
import { RecipeBlueprint, OutcomeType } from '@friehub/taas-sdk';

const recipe: RecipeBlueprint = {
    id: 'btc-dominance-binary',
    version: '1.0.0',
    outcomeType: OutcomeType.BINARY,
    inputs: {
        threshold: { type: 'number', required: true, default: 50 }
    },
    logic: {
        // Declarative logic definition executed by @friehub/execution-engine
    }
};
```

---

## Security

- All types are strict — no `any` on public API boundaries.
- The `TruthGatewayClient` uses HTTPS and validates response schemas automatically.
- Execution results include cryptographic proofs; consumers should always verify the `signature` field against the on-chain `TruthOracleV2` contract.

---

## Related Packages

| Package | Role |
|---|---|
| `@friehub/execution-engine` | Executes compiled recipes |
| `@friehub/recipes` | Recipe registry and instance management |
| `@friehub/sovereign-logic` | Data adapter orchestration |
| `@friehub/taas-plugins` | Domain-specific data source adapters |

---

© 2026 Friehub Organization. All Rights Reserved.
