# TaaS SDK — TODO

> The SDK's role is to give developers a safe, ergonomic, and production-accurate way to define, simulate, and deploy oracle intents. The SDK must behave identically to the Gateway's Rust execution engine.

---

## Role Summary

| Component | Responsibility |
| :--- | :--- |
| `IntentBuilder` | Chainable DSL for defining oracle logic (capabilities, transforms, attestation) |
| `RecipeSimulator` | High-fidelity local simulation using the embedded WASM Rust engine |
| `TaasClient` | Low-level ABI encoding / off-chain TDS interaction / on-chain intent commitment |
| `GatewayClient` | HTTP client for interacting with a live TaaS Gateway |
| `RecipeScanner` | Static analysis of recipe DAGs for schema validation |

---

## Critical Fixes

### [SDK-1] `TaasClient.uploadInputsToTds()` — Mock Implementation
- **Flaw**: Returns `bafy_${Math.random().toString(36)}` — a fake CID. The data is never stored anywhere. (`TaasClient.ts:46-51`)
- **Fix**:
  - [ ] Call `POST ${this.gatewayUrl}/tds/store` with `{ data: JSON.stringify(parameters), ttl: ... }`
  - [ ] Parse and return the real `cid` from the Gateway response
  - [ ] Handle errors and expose them clearly to the caller

### [SDK-2] `TaasClient.registerResolutionIntent()` — Console Log Stub
- **Flaw**: Only logs to console and returns a mock `intentId`. No contract write happens. (`TaasClient.ts:57-80`)
- **Fix**:
  - [ ] Implement the actual `TruthOracle.registerIntent(recipeId, inputCid, trigger)` viem `writeContract` call
  - [ ] Expose `walletClient` configuration (private key or injected wallet) in `TaasClient` constructor
  - [ ] Return the real `intentId` (from receipt logs) and an accurate gas estimate

### [SDK-3] `GatewayClient` — Mismatched API Paths
- **Flaw**: `verify()` calls `proxy/verify`, `deploy()` calls `gateway/templates`, `executeNode()` calls `/execute-node` — none of these match the actual Gateway REST routes defined in `hot-core/src/node.rs`.
- **Fix**:
  - [ ] Standardize all paths to the `/api/v1/` prefix
  - [ ] `verify()` → `POST /api/fetch` (with attestation context)
  - [ ] `deploy()` → `POST /recipe/execute`
  - [ ] `executeNode()` → `POST /api/v1/execute`
  - [ ] `test()` → `POST /api/templates/simulate` (on the Node)
  - [ ] Add path constants to a single `API_PATHS` object for maintainability

### [SDK-4] `IntentBuilder.resource()` — No URL Validation
- **Flaw**: Adds a `universal-request` node with any user-supplied URL directly. This is an SSRF vector when the recipe is executed — `index.ts:72` and `truthWorker.ts:75` call `axios({ url: node.url })` without an allowlist. (`IntentBuilder.ts:61-84`)
- **Fix**:
  - [ ] Introduce a `capability(id, method, params)` method as the safe primary API for registered UCM nodes
  - [ ] In `resource()`, emit a `console.warn` if the URL does not match a registered gateway domain
  - [ ] Add an `allowUncheckedUrls: boolean` opt-in flag to `IntentBuilder` constructor for advanced dev use

### [SDK-5] `RecipeSimulator` — Unconstrained Direct HTTP in Local Mode
- **Flaw**: In local simulation, the simulator dispatches `universal-request` nodes with bare `axios` calls to arbitrary URLs. This is identical to the SSRF risk in the Node. (`Simulator.ts:79-89`)
- **Fix**:
  - [ ] Block `universal-request` execution in local mode unless `allowDirectUrls: true` is set in options
  - [ ] When `gatewayUrl` is provided, route all `standard-feed` and `universal-request` nodes through the Gateway's `/api/v1/execute` endpoint
  - [ ] Log a clear warning when bypassing gateway routing in simulation

---

## Feature Improvements

### [SDK-6] `RecipeSimulator` — Structured Proof Trace Output
- **What**: The simulation result returns a raw `outcome.proof.executionTrace` object. No formatting is applied.
- **Fix**:
  - [ ] Parse and format the trace into a `SimulationTrace` type with per-node `{ id, type, input, output, duration }` entries
  - [ ] Add a `simulationId` (UUID) to every result for log correlation
  - [ ] Add a `.formatTrace()` helper method to `RecipeSimulator` for human-readable console output

### [SDK-7] SDK — Integrate and Export `@taas/tds-client`
- **What**: `@taas/tds-client` lives in `taas-gateway/ts/tds-client` but is not declared in the root `pnpm-workspace.yaml` and is not exported from `@taas/sdk`.
- **Fix**:
  - [ ] Add `taas-gateway/ts/tds-client` to `pnpm-workspace.yaml`
  - [ ] Re-export `TDSClient` and all its types from `taas-sdk/src/index.ts`

### [SDK-8] `IntentBuilder` — Multi-Source Consensus Shorthand
- **What**: Building a multi-source median oracle requires manually calling `.addNode()` for each source. There is no ergonomic shorthand.
- **Fix**:
  - [ ] Introduce `.multiSource(id, sources: { category, method, params }[], strategy?: 'MEDIAN' | 'CONSENSUS')` method
  - [ ] Internally generates one `standard-feed` node per source and wires the `aggregation_override` field correctly

### [SDK-9] `RecipeScanner` — Static Validation Before Simulation
- **What**: `RecipeScanner.ts` exists but is not called before simulation or deployment. Invalid recipes fail at runtime with opaque errors.
- **Fix**:
  - [ ] Call `RecipeScanner.scan(recipe)` at the start of `RecipeSimulator.simulate()` and `TaasClient methods`
  - [ ] Surface validation errors as typed `RecipeValidationError` with clear field-level messages

---

## Test Coverage Required

- [ ] `[TEST-SDK-1]` Unit tests for `IntentBuilder` DSL chain (`.input().resource().logic().attest().build()`)
- [ ] `[TEST-SDK-2]` Unit tests for `RecipeSimulator` with a mock provider (no network access)
- [ ] `[TEST-SDK-3]` Unit tests for `RecipeSimulator.applySelector()` edge cases (null, nested, array index)
- [ ] `[TEST-SDK-4]` Integration test: `TaasClient.encodeRecipeRequest()` output decoded correctly by the Node's `decodeAbiParameters` call
- [ ] `[TEST-SDK-5]` Integration test: `GatewayClient.getCapabilities()` response shape matches the gateway's `/discovery` schema
