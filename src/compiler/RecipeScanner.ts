import { type RecipeBlueprint, type LogicNode } from '../core/types';

export interface ScanResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * RecipeScanner
 * Performs static semantic analysis on a Recipe Blueprint to catch issues before execution.
 *
 * Checks performed:
 *  1. Non-empty pipeline
 *  2. Duplicate node IDs (FLAW-SC2)
 *  3. Variable interpolation — both ${var} and {{var}} syntax (FLAW-SC3)
 *  4. Explicit dependency existence
 *  5. Attestation valueVar resolution
 */
export class RecipeScanner {
    static scan(recipe: RecipeBlueprint): ScanResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        const nodes = recipe.logic?.pipeline || [];
        if (nodes.length === 0) {
            errors.push('Recipe logic pipeline is empty.');
        }

        // FLAW-SC2 FIX: Detect duplicate node IDs
        const nodeIds = new Set<string>();
        nodes.forEach((node: LogicNode) => {
            if (nodeIds.has(node.id)) {
                errors.push(`Duplicate node ID: '${node.id}'. All node IDs must be unique within a recipe.`);
            }
            nodeIds.add(node.id);
        });

        const targetVars = new Set<string>();
        nodes.forEach((node: LogicNode) => {
            if ((node as any).targetVar) {
                targetVars.add((node as any).targetVar);
            }
        });

        // Helper: check a string for unresolved interpolation variables in both syntaxes
        const checkString = (str: string, nodeId: string, fieldContext: string) => {
            // FLAW-SC3 FIX: Check ${var} syntax
            const dollarBrace = str.match(/\$\{(.*?)\}/g);
            if (dollarBrace) {
                dollarBrace.forEach(match => {
                    const varName = match.substring(2, match.length - 1).trim();
                    if (!targetVars.has(varName) && !recipe.ui?.variables?.find((v: any) => v.name === varName)) {
                        errors.push(`Node '${nodeId}': Referenced variable '\${${varName}}' in ${fieldContext} is not defined in pipeline outputs or recipe inputs.`);
                    }
                });
            }

            // FLAW-SC3 FIX: Also check {{var}} syntax (executor supports both)
            const doubleBrace = str.match(/\{\{(.*?)\}\}/g);
            if (doubleBrace) {
                doubleBrace.forEach(match => {
                    const varName = match.substring(2, match.length - 2).trim();
                    if (!targetVars.has(varName) && !recipe.ui?.variables?.find((v: any) => v.name === varName)) {
                        errors.push(`Node '${nodeId}': Referenced variable '{{${varName}}}' in ${fieldContext} is not defined in pipeline outputs or recipe inputs.`);
                    }
                });
            }
        };

        // Validate interpolation in node fields
        nodes.forEach((node: any) => {
            if ((node as any).expression) checkString(String((node as any).expression), node.id, 'expression');
            if ((node as any).query) checkString(String((node as any).query), node.id, 'query');
            if ((node as any).url) checkString(String((node as any).url), node.id, 'url');

            if ((node as any).args && Array.isArray((node as any).args)) {
                (node as any).args.forEach((arg: any, i: number) => {
                    if (typeof arg === 'string') checkString(arg, node.id, `args[${i}]`);
                });
            }

            if ((node as any).params && typeof (node as any).params === 'object') {
                Object.entries((node as any).params).forEach(([key, val]) => {
                    if (typeof val === 'string') checkString(val, node.id, `params.${key}`);
                });
            }
        });

        // Validate explicit dependencies
        nodes.forEach((node: any) => {
            if (node.dependencies) {
                node.dependencies.forEach((depId: any) => {
                    if (!nodeIds.has(depId)) {
                        errors.push(`Node '${node.id}': Dependency '${depId}' does not exist in the pipeline.`);
                    }
                });
            }
        });

        // Validate attestation
        const attestation = recipe.logic?.attestation;
        if (attestation) {
            const config = attestation.config as Record<string, any>;
            if (config?.valueVar) {
                if (!targetVars.has(config.valueVar)) {
                    errors.push(`Attestation: valueVar '${config.valueVar}' is not produced by any pipeline node.`);
                }
            }
        } else {
            warnings.push('Recipe has no attestation config; it will produce a VOID result.');
        }

        return { valid: errors.length === 0, errors, warnings };
    }
}
