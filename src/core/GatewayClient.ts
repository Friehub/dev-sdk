import axios from 'axios';

/**
 * Standardized Client for the Sovereign Truth Gateway.
 * Used by "Thin Client" applications to fetch verified truth 
 * without needing to build full recipes or manage private API keys.
 */
export class TruthGatewayClient {
    private baseUrl: string;

    /**
     * Initializes the client with a gateway URL.
     * @param baseUrl Defaults to INDEXER_API_URL or http://localhost:3002.
     */
    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || process.env.INDEXER_API_URL || 'http://localhost:3002';
    }

    /**
     * Internal query execution
     */
    private async _exec(provider: string, params: any = {}) {
        const response = await axios.get(`${this.baseUrl}/proxy/truth`, {
            params: { provider, ...params }
        });
        return response.data;
    }

    /**
     * Generic Truth Discovery Query
     */
    async discover(providerId: string, params: any = {}) {
        return this._exec(providerId, params);
    }

    /**
     * Retrieves a directory of all available truth providers (feeds) and their capabilities.
     */
    async getFeeds(): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/gateway/feeds`);
        return response.data;
    }

    /**
     * Semantic Helper: Sports Data
     */
    sports() {
        return {
            livescore: (league: string) => this._exec('sports', { league }),
            schedule: (league: string, date?: string) => this._exec('sports', { league, date, type: 'schedule' }),
            matchDetails: (matchId: string) => this._exec('sports', { matchId })
        };
    }

    /**
     * Semantic Helper: Crypto/Finance Data
     */
    finance() {
        return {
            price: (symbol: string) => this._exec('crypto', { symbol }),
            priceAt: (symbol: string, timestamp: number) => this._exec('crypto', { symbol, timestamp }),
            forex: (pair: string) => this._exec('forex', { pair })
        };
    }

    /**
     * Semantic Helper: Weather/Environmental Data
     */
    environmental() {
        return {
            current: (lat: number, lon: number) => this._exec('weather', { latitude: lat, longitude: lon }),
            forecast: (lat: number, lon: number) => this._exec('weather', { latitude: lat, longitude: lon, type: 'forecast' })
        };
    }

    /**
     * Semantic Helper: Economics
     */
    economics() {
        return {
            series: (seriesId: string) => this._exec('economics', { seriesId }),
            search: (query: string) => this._exec('economics', { query, type: 'search' })
        };
    }

    /**
     * Verify a full recipe blueprint without saving it.
     */
    async verify(template: any, inputs: any = {}) {
        const response = await axios.post(`${this.baseUrl}/proxy/verify`, {
            template,
            inputs
        });
        return response.data;
    }

    /**
     * Submit a new recipe template to the global registry.
     * Requires admin/authorized token if the gateway is protected.
     */
    async submitTemplate(template: any, token?: string) {
        const response = await axios.post(`${this.baseUrl}/gateway/templates`, template, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    }
}
