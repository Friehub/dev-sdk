import * as fs from 'fs';
import * as path from 'path';

/**
 * TaaS Type-Safe Capability Generator (v4.5 Prototype)
 * Transforms Gateway discovery manifests into TypeScript definitions.
 */
export function generateCapabilities(manifest: any, outputPath: string) {
    let code = `/**\n * Auto-generated TaaS Capabilities\n * Generated on ${new Date().toISOString()}\n */\n\n`;

    code += "export type TaaSCapabilities = {\n";

    for (const [category, methods] of Object.entries(manifest)) {
        code += `  "${category}": {\n`;
        for (const [method, spec] of Object.entries(methods as any)) {
            const params = (spec as any).params || {};
            const paramType = Object.keys(params).length > 0
                ? `{ ${Object.entries(params).map(([k, v]) => `${k}: ${v}`).join(", ")} }`
                : "Record<string, any>";

            code += `    "${method}": ${paramType};\n`;
        }
        code += `  };\n`;
    }

    code += "};\n\n";

    // Extend the Step.data.fetch method (Augmentation)
    code += `declare module '../src/core/steps' {
  interface DataBuilder {
    fetch<C extends keyof TaaSCapabilities, M extends keyof TaaSCapabilities[C]>(
      category: C,
      method: M,
      params: TaaSCapabilities[C][M],
      options?: { dataPath?: string, timeout?: number }
    ): string;
  }
}\n`;

    fs.writeFileSync(outputPath, code);
    console.log(`✅ TaaS Capabilities generated to: ${outputPath}`);
}

// Sample Manifest (Usually fetched from Gateway /discovery)
const sampleManifest = {
    "Sports": {
        "matchDetails": { params: { matchId: "string" } },
        "leagueStandings": { params: { leagueId: "string", season: "number" } }
    },
    "Finance": {
        "spotPrice": { params: { symbol: "string" } },
        "historicalOHLC": { params: { symbol: "string", interval: "'1h' | '1d'" } }
    }
};

const outputDir = path.join(process.cwd(), 'src', 'generated');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

generateCapabilities(sampleManifest, path.join(outputDir, 'capabilities.d.ts'));
