import { BuilderContext } from '../core/context';

/**
 * Standard Truth Feed Builder.
 * Routes requests through the TaaS Decentralized Gateway Enclaves.
 */
export class Truth {
    /**
     * Fetches a verifiable truth point from the TaaS Decentralized Gateway.
     * @param method The provider method to call (e.g. 'binance.getPrice', 'weather.getTemp').
     * @param params Parameters for the data provider.
     * @param options Execution options including timeout and caching hints.
     */
    static async fetch(method: string, params: Record<string, any> = {}, options: { timeout?: number } = {}): Promise<any> {
        const ctx = BuilderContext.get();
        const uniqueId = `truth_${Math.floor(Math.random() * 100000)}`;

        ctx.addNode({
            id: uniqueId,
            type: 'standard-feed',
            method: method,
            params: params,
            timeout: options.timeout,
            targetVar: uniqueId
        });

        return {
            targetVar: uniqueId,
            toString: () => `\${${uniqueId}}`
        };
    }
}
