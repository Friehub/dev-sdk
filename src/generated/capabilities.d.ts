/**
 * Auto-generated TaaS Capabilities
 * Generated on 2026-03-07T22:21:54.156Z
 */

export type TaaSCapabilities = {
  "Sports": {
    "matchDetails": { matchId: string };
    "leagueStandings": { leagueId: string, season: number };
  };
  "Finance": {
    "spotPrice": { symbol: string };
    "historicalOHLC": { symbol: string, interval: '1h' | '1d' };
  };
};

declare module '../src/core/steps' {
  interface DataBuilder {
    fetch<C extends keyof TaaSCapabilities, M extends keyof TaaSCapabilities[C]>(
      category: C,
      method: M,
      params: TaaSCapabilities[C][M],
      options?: { dataPath?: string, timeout?: number }
    ): string;
  }
}
