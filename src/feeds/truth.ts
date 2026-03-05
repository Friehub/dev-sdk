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
     * @param options Execution options including timeout and data path selection.
     */
    static async fetch(method: string, params: Record<string, any> = {}, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}): Promise<any> {
        const ctx = BuilderContext.get();
        const uniqueId = `truth_${Math.floor(Math.random() * 100000)}`;

        ctx.addNode({
            id: uniqueId,
            type: 'standard-feed',
            method: method,
            params: params,
            timeout: options.timeout,
            dataPath: options.dataPath, // Pass through for plugin resolution
            targetVar: uniqueId,
            optional: options.optional
        });

        return uniqueId;
    }

    /**
     * Semantic Helper: Sports Data
     */
    static sports() {
        return {
            livescore: (league: string, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('sports.livescore', { league }, options),
            schedule: (league: string, date?: string, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('sports.schedule', { league, date }, options),
            matchDetails: (matchId: string, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('sports.matchDetails', { matchId }, options)
        };
    }

    /**
     * Semantic Helper: Crypto/Finance Data
     */
    static finance() {
        return {
            price: (symbol: string, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('crypto.price', { symbol }, options),
            priceAt: (symbol: string, timestamp: number, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('crypto.priceAt', { symbol, timestamp }, options),
            forex: (pair: string, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('forex.rate', { pair }, options)
        };
    }

    /**
     * Semantic Helper: Weather
     */
    static weather() {
        return {
            current: (lat: number, lon: number, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('weather.current', { lat, lon }, options),
            forecast: (lat: number, lon: number, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('weather.forecast', { lat, lon }, options)
        };
    }

    /**
     * Semantic Helper: Economics
     */
    static economics() {
        return {
            series: (seriesId: string, options: { timeout?: number, dataPath?: string, optional?: boolean } = {}) =>
                this.fetch('economics.series', { seriesId }, options)
        };
    }
}
