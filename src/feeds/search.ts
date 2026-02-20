import { BuilderContext } from '../core/context';

/**
 * Utility for performing proxied web searches through the Sovereign Truth Gateway.
 */
export class Search {
    /**
     * Executes a high-quality web search and returns a node reference for use in recipes.
     * @param query The search term or question to investigate.
     * @param options Configuration for the search engine and result count.
     * @returns A node object representing the search result (toString handles string interpolation).
     */
    static async query(query: string, options: { count?: number, engine?: string } = {}): Promise<any> {
        const ctx = BuilderContext.get();
        const id = `node_${paramsHash(query + Date.now())}`;
        // Simple hash to ensure uniqueness or use counter
        const uniqueId = `search_${Math.floor(Math.random() * 100000)}`;

        ctx.addNode({
            id: uniqueId,
            type: 'search',
            query: query,
            engine: options.engine || 'serper',
            count: options.count || 5,
            targetVar: uniqueId
        });

        // Return an object that represents this value
        // For string interpolation, we might return "${search_123}"
        // But for code usage, we return an object wrapper
        return {
            targetVar: uniqueId,
            toString: () => `\${${uniqueId}}`
        };
    }
}

function paramsHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}
