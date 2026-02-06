import { type backendInterface, type Game } from '../../backend';
import { type GameStatsInput } from './types';

export class PlayerPropsBackendClient {
  constructor(private actor: backendInterface) {}

  async getLastFiveGames(playerName: string): Promise<GameStatsInput[]> {
    const result = await this.actor.getLast5Games(playerName);
    
    if (!result || result.length === 0) {
      return [];
    }

    // Convert backend Game type to frontend GameStatsInput type
    return result.map((game: Game) => ({
      points: Number(game.points),
      rebounds: Number(game.rebounds),
      assists: Number(game.assists),
      threesMade: Number(game.threes),
    }));
  }
}
