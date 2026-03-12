#@taas/sdk

**The Fluent Developer Kit for Programmable Oracles.**

`@taas/sdk` is the easiest way to build, simulate, and deploy verifiable oracle logic. It features a chainable "Fluent API" that allows you to define complex data intents in seconds.

## Installation

```bash
pnpm add@taas/sdk
```

## The Fluent Vision

TaaS moves beyond "Data-as-a-Service" to "Verdict-as-a-Service". Instead of fetching raw JSON and processing it in your smart contract, you define the logic at the source.

### Example: Sports Prediction Market
"Will Mason score a winning goal?"

```typescript
import { TaaS } from '@taas/sdk';

const intent = TaaS.intent('mason-winning-goal')
    .sports('match_123').score() 
    .check('total_goals > 2')     
    .sports('match_123').events() 
    .check("match_events.some(e => e.player === 'Mason' && e.type === 'goal')")
    .attest(); // Returns a signed recipe for the Gateway
```

## Features

-   **Fluent API**: Chainable methods for data fetching and logical checks.
-   **Proxy-based Discovery**: Automatically maps to Gateway capabilities.
-   **Simulation Parity**: Uses `@taas/core-rs` (WASM) locally to ensure simulation perfectly matches production execution.
-   **verifiable Proofs**: All results returned by the Gateway include cryptographic signatures verify-able on-chain.

### 3. `TruthGatewayClient`
A low-level gRPC/HTTP client for direct interaction with TaaS Gateways.

---

## Sports Dictionary

The TaaS Gateway includes a high-fidelity sports dictionary with multi-source consensus. The system supports natural parameter resolution (GIM), removing the requirement for provider-specific identifiers.

### Anonymous Data Fetching (GIM)
Fetch match or team data via name-based resolution. The Gateway translates these into provider IDs automatically.

```typescript
// Fetch via team names (Internal resolution)
const score = await TaaS.sports('football').score({ 
    homeTeam: 'Arsenal', 
    awayTeam: 'Liverpool' 
});

// Fetch team details via name lookup
const info = await TaaS.sports('team').detail({ teamName: 'Chelsea' });
```

### Supported Methods

| Category | Method | Description |
| :--- | :--- | :--- |
| **Football** | `score` | Real-time score & status (Consensus) |
| | `statistics` | Granular in-play stats (Shots, Corners, Possession) |
| | `events` | Chronological match events |
| | `lineup` | Starting XI and bench |
| | `cards`/`goals`/`subs` | Filtered event streams |
| | `status` | Cancellation/Postponement verification |
| **Basketball** | `score` | NBA/Live scores with period precision |
| **Discovery** | `league.list` | List all supported leagues |
| | `team.list` | List teams in a league |
| | `player.list` | List players in a team |
| **Intelligence** | `league.standings` | Current league table |
| | `league.upcoming` | Scheduled matches |
| | `league.top_scorers` | Golden boot tracking |
| | `team.results` | Team form (last 5 results) |

---

---

## Developer Experience (DX)

```bash
# Build the SDK
pnpm build

# Run verify vision script
pnpm ts-node src/verify_vision.ts
```

---

© 2026 TaaS Foundation. Part of the Sovereign Data Layer.
