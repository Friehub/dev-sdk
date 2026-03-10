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
     * Proxies a discovery request to the Gateway.
     */
    async discover(path: string, params: any = {}) {
        const response = await axios.get(`${this.baseUrl}/gateway/discovery`, {
            params: { path, ...params }
        });
        return response.data;
    }

    /**
     * Retrieves a directory of all available truth providers (feeds) and their capabilities.
     */
    async getCapabilities(): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/gateway/capabilities`);
        return response.data;
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

    /**
     * Simulates the recipe execution through the Gateway for monetized testing.
     * Proxies the blueprint and inputs to a Truth Node and returns the trace.
     * @param blueprint The compiled JSON recipe blueprint.
     * @param inputs The required user inputs.
     * @param apiKey The developer's TaaS API key for billing.
     */
    async simulate(blueprint: any, inputs: any = {}, apiKey?: string) {
        // Fallback to environment variable if not provided explicitly
        const token = apiKey || process.env.TAAS_API_KEY;
        const response = await axios.post(`${this.baseUrl}/gateway/simulate`, {
            template: blueprint,
            inputs
        }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    }
}
