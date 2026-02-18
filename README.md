# Friehub TaaS SDK

**Professional Development Kit for the Friehub Truth-as-a-Service (TaaS) Protocol.**

The Friehub TaaS SDK is an institutional-grade toolkit designed for developers to build, test, and deploy decentralized truth feeds. It abstracts the complexity of the underlying FTS execution engine, allowing for the rapid creation of resilient, multi-source data ingestion logic.

## Core Pillars

### 1. Recipe Engine
The SDK provides a fluent interface for defining "Data Recipes"—deterministic DAGs that describe how data should be fetched, transformed, and resolved.
- **Input Definition**: Strictly typed variable definitions (String, Number, Address, Boolean).
- **Logic Pipeline**: A sequential or parallel execution flow of data ingestion and AI reasoning nodes.
- **Resolution**: Configurable outcome logic (Binary, Scalar, Categorical, Probabilistic).

### 2. Execution Environment
Recipes defined in the SDK are compiled into a protocol-standard JSON format, which can be executed by any FTS Truth Node.
- **Deterministic Runtime**: Ensures identical results across different node operators.
- **Cryptographic Attestations**: Automated EIP-712 signing of execution results.
- **Auditability**: Generates full execution traces and IPFS-based proof certificates.

### 3. Keyless Data Infrastructure
The SDK is designed for the "Keyless Node" architectural standard. 
- **Truth Gateway**: Data requests for 50+ sources, including Search and AI models, are automatically proxied through the centralized Truth Gateway.
- **Security**: Node operators do not manage individual API keys, reducing operational risk and preventing credential leakage.

## Getting Started

### Installation
```bash
pnpm add @friehub/taas-sdk
```

### Creating Your First Recipe
```typescript
import { Recipe, Step, AI, Search } from '@friehub/taas-sdk';

const recipe = Recipe.define({
  name: "Institutional Truth Feed",
  description: "Aggregates market sentiment using AI and Search",
  inputs: {
    symbol: Step.input.string("Asset Symbol", { default: "BTC" })
  },
  handler: async (inputs) => {
    // 1. Perform a proxied web search
    const news = await Search.query(`Latest news for ${inputs.symbol}`);
    
    // 2. Perform AI sentiment analysis via Truth Gateway
    const analysis = await AI.ask({
      model: "gemini-2.0-flash",
      prompt: "Analyze the sentiment of this asset based on the provided news context.",
      context: news
    });

    return analysis;
  }
});

const compiled = await recipe.compile();
console.log(JSON.stringify(compiled, null, 2));
```

## Advanced Features

### Multi-Source Synthesis
The SDK automatically leverages the FTS Protocol's consensus mechanism to aggregate data from multiple independent providers, ensuring 100% accuracy and resilience.

### Custom Logic Nodes
Developers can extend the execution engine by defining specialized transition nodes for complex data transformations or ZK-based proof generation.

## Documentation and Support

Comprehensive integration guides and protocol specifications are available in the [Friehub Documentation Portal](https://docs.friehub.protocol).

Copyright (c) 2026 Friehub Protocol.
Licensed under the MIT License.
