import { TruthGatewayClient } from './GatewayClient';

/**
 * High-level client for Sports Data.
 * Simplifies discovery and fetching of live match scores and events.
 */
export class SportsClient {
    private client: TruthGatewayClient;

    constructor(gatewayUrl?: string) {
        this.client = new TruthGatewayClient(gatewayUrl);
    }

    /**
     * listLiveMatches
     * Returns a list of active matches from the Gateway.
     * @param league Optional league filter (e.g. 'English Premier League')
     */
    async listLiveMatches(league?: string) {
        const response = await this.client.executeNode({
            category: 'sports',
            method: 'sports.football.list',
            params: { league }
        });
        return response.result;
    }

    /**
     * getMatchScore
     * Fetches real-time score for a specific match ID.
     */
    async getMatchScore(matchId: string) {
        const response = await this.client.executeNode({
            category: 'sports',
            method: 'sports.football.score',
            params: { matchId }
        });
        return response.result;
    }

    /**
     * getMatchEvents
     * Fetches match events (red cards, goals) for a specific match ID.
     */
    async getMatchEvents(matchId: string) {
        const response = await this.client.executeNode({
            category: 'sports',
            method: 'sports.football.events',
            params: { matchId }
        });
        return response.result;
    }
}
