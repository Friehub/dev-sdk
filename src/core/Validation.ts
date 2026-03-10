import { VariableDef, LogicNode, RecipeTemplate } from './types';

/**
 * Lean, Protocol-First SDK Validation.
 * Stripped of heavy execution-engine dependencies.
 */
export class SDKValidator {
    /**
     * Performs static analysis on the Recipe/Template DAG.
     */
    static analyzeDAG(recipe: RecipeTemplate) {
        const nodes = recipe.logic!.pipeline;
        const inputs = new Set(recipe.ui.variables.map((v: any) => v.name));
        const nodeIds = new Set(nodes.map((n: any) => n.id));

        // 1. Dependency Analysis & Cycle Detection
        const adj = new Map<string, string[]>();
        for (const node of nodes) {
            const deps = this.getDependencies(node);
            adj.set(node.id, deps);

            // Verify all dependencies exist either as inputs or other nodes
            for (const dep of deps) {
                if (!inputs.has(dep) && !nodeIds.has(dep)) {
                    throw new Error(`[TaaS SDK Analysis] Node "${node.id}" references unknown variable: "\${${dep}}"`);
                }
            }
        }

        // 2. Cycle Detection (DFS)
        const visited = new Set<string>();
        const recStack = new Set<string>();

        const checkCycle = (curr: string) => {
            visited.add(curr);
            recStack.add(curr);

            const neighbors = adj.get(curr) || [];
            for (const neighbor of neighbors) {
                if (!inputs.has(neighbor)) { // Only care about node-to-node cycles
                    if (!visited.has(neighbor)) {
                        if (checkCycle(neighbor)) return true;
                    } else if (recStack.has(neighbor)) {
                        return true;
                    }
                }
            }

            recStack.delete(curr);
            return false;
        };

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                if (checkCycle(node.id)) {
                    throw new Error(`[TaaS SDK Analysis] Circular dependency detected in Truth Recipe involving node: "${node.id}"`);
                }
            }
        }
    }

    private static getDependencies(node: LogicNode): string[] {
        const deps: string[] = [];

        // Check params and specialized fields for \${var}
        const findInValues = (obj: any) => {
            if (typeof obj === 'string') {
                const matches = [...obj.matchAll(/\$\{([^${}]+)\}/g)];
                matches.forEach(m => deps.push(m[1]));
            } else if (Array.isArray(obj)) {
                obj.forEach(findInValues);
            } else if (typeof obj === 'object' && obj !== null) {
                Object.values(obj).forEach(findInValues);
            }
        };

        // Standard logic node fields
        findInValues((node as any).params);
        if ((node as any).expression) findInValues((node as any).expression);

        return Array.from(new Set(deps));
    }
}
