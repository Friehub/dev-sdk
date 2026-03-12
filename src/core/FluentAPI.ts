import { IntentBuilder } from './IntentBuilder';
import { RecipeTemplate } from './types';

/**
 * TaaS Fluent API: The "jQuery for Oracles"
 * Uses Proxy for dynamic chainable logic creation.
 */
export class FluentAPI {
    private builder: IntentBuilder;
    private lastNodeId: string = '';

    constructor(id: string = `intent-${Date.now()}`, gatewayUrl?: string) {
        this.builder = new IntentBuilder(id, gatewayUrl);
    }

    /**
     * Start a new fluent session.
     */
    public static create(id?: string, gatewayUrl?: string): any {
        const api = new FluentAPI(id, gatewayUrl);
        return api.createProxy();
    }

    private createProxy(): any {
        return new Proxy(this, {
            get: (target: any, prop: string) => {
                if (prop in target) {
                    return target[prop];
                }

                // DYNAMIC NAMESPACE: TaaS.crypto, TaaS.sports, TaaS.weather
                return (resourceId: string) => {
                    return new Proxy({}, {
                        get: (_: any, method: string) => {
                            return (...args: any[]) => {
                                const nodeId = `${prop}_${method}_${Date.now()}`;
                                target.builder.addNode(nodeId, {
                                    category: prop,
                                    method: method,
                                    params: { id: resourceId, ...args[0] }
                                });
                                target.lastNodeId = nodeId;
                                return target.createProxy();
                            };
                        }
                    });
                };
            }
        });
    }

    /**
     * LOGIC: Check a condition on the last node.
     */
    public check(expression: string): any {
        const id = `check_${Date.now()}`;
        // Automatically inject the last node variable if using relative syntax
        const sanitizedExpr = expression.includes('${') ? expression : `\${${this.lastNodeId}} ${expression}`;
        this.builder.script(id, 'expression', sanitizedExpr);
        this.lastNodeId = id;
        return this.createProxy();
    }

    /**
     * ATTEST: Finalize and build.
     */
    public attest(expression?: string): RecipeTemplate {
        if (expression) {
            this.builder.attest(expression);
        } else {
            // Default to attesting the last logic node
            this.builder.attest(`if(\${${this.lastNodeId}}, 0, 1)`);
        }
        return this.builder.build();
    }
}

// Export a default instance entry point
export const TaaS = {
    intent: (id?: string, gatewayUrl?: string) => FluentAPI.create(id, gatewayUrl)
};
