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
     * Executes a single capability node on the Gateway.
     */
    async executeNode(node: { category: string, method: string, params?: any }) {
        const timestamp = Date.now();
        const response = await axios.post(`${this.baseUrl}/execute-node`, {
            requestId: `sdk-exec-${timestamp}`,
            node: {
                id: node.method || `node-${timestamp}`,
                type: 'standard-feed',
                ...node,
                args: [],
                targetVar: 'result'
            },
            context: {},
            attestationTimestamp: timestamp
        });
        return response.data;
    }

    /**
     * Internal query execution (Legacy/Proxy)
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
        const response = await axios.get(`${this.baseUrl}/discovery`, {
            params: { path, ...params }
        });
        return response.data;
    }

    /**
     * Retrieves a directory of all available truth providers (feeds) and their capabilities.
     */
    async getCapabilities(): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/discovery`);
        return response.data;
    }

    /**
     * Retrieves a list of available nodes/plugins from the Gateway.
     * Essential for "Dynamic SDK" behavior where developers explore capabilities at runtime.
     */
    async getNodes(): Promise<any[]> {
        const response = await axios.get(`${this.baseUrl}/discovery`);
        return response.data;
    }

    /**
     * Off-chain logic testing (Monetized Simulation).
     * Developers are charged via API Key usage to test their recipes.
     * This abstracts away internal TaaS tokens for better DX.
     */
    async test(template: any, inputs: any = {}, apiKey?: string) {
        const token = apiKey || process.env.TAAS_API_KEY;
        const response = await axios.post(`${this.baseUrl}/v1/simulate`, {
            template,
            inputs
        }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
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
     * Submit a new recipe template for production execution.
     */
    async deploy(template: any, token?: string) {
        const response = await axios.post(`${this.baseUrl}/gateway/templates`, template, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    }
}
