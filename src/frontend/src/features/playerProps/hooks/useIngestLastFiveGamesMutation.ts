import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { type Game } from '../../../backend';

interface IngestParams {
  playerName: string;
}

interface BallDontLiePlayer {
  id: number;
  first_name: string;
  last_name: string;
}

interface BallDontLieStat {
  pts: number;
  reb: number;
  ast: number;
  fg3m: number;
  game: {
    id: number;
    date: string;
    home_team: {
      abbreviation: string;
    };
    visitor_team: {
      abbreviation: string;
    };
    home_team_score: number;
    visitor_team_score: number;
  };
  team: {
    id: number;
    abbreviation: string;
  };
}

export function useIngestLastFiveGamesMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerName }: IngestParams) => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }

      // Step 1: Search for the player by name
      const searchResponse = await fetch(
        `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(playerName)}`
      );

      if (!searchResponse.ok) {
        throw new Error('Network error while searching for player');
      }

      const searchData = await searchResponse.json();

      if (!searchData.data || searchData.data.length === 0) {
        throw new Error(`Player "${playerName}" not found. Please check the spelling and try again.`);
      }

      const player: BallDontLiePlayer = searchData.data[0];
      const playerId = player.id;

      // Step 2: Fetch the player's stats (last 5 games)
      // We'll fetch stats and sort by date to get the most recent games
      const statsResponse = await fetch(
        `https://api.balldontlie.io/v1/stats?player_ids[]=${playerId}&per_page=25`
      );

      if (!statsResponse.ok) {
        throw new Error('Network error while fetching player stats');
      }

      const statsData = await statsResponse.json();

      if (!statsData.data || statsData.data.length === 0) {
        throw new Error('Invalid response: No game stats found for this player');
      }

      // Step 3: Process and sort the stats to get the last 5 games
      const stats: BallDontLieStat[] = statsData.data;

      // Sort by game date (most recent first)
      const sortedStats = stats.sort((a, b) => {
        const dateA = new Date(a.game.date).getTime();
        const dateB = new Date(b.game.date).getTime();
        return dateB - dateA;
      });

      // Take the last 5 games
      const last5Stats = sortedStats.slice(0, 5);

      if (last5Stats.length === 0) {
        throw new Error('Invalid response: No recent games found for this player');
      }

      // Step 4: Convert to backend Game format
      const games: Game[] = last5Stats.map((stat) => {
        // Determine opponent: if player's team matches home team abbreviation, opponent is visitor team
        const playerTeamAbbr = stat.team.abbreviation;
        const isHomeTeam = playerTeamAbbr === stat.game.home_team.abbreviation;
        const opponent = isHomeTeam
          ? stat.game.visitor_team.abbreviation
          : stat.game.home_team.abbreviation;

        return {
          points: BigInt(stat.pts || 0),
          rebounds: BigInt(stat.reb || 0),
          assists: BigInt(stat.ast || 0),
          threes: BigInt(stat.fg3m || 0),
          date: stat.game.date,
          opponent: opponent,
        };
      });

      // Step 5: Store in backend
      await actor.fetchLast5GamesAndStore(playerName, games);

      return { playerName, games };
    },
    onSuccess: (_, variables) => {
      // Invalidate queries for this player
      queryClient.invalidateQueries({
        queryKey: ['lastFiveGames', variables.playerName],
      });
      queryClient.invalidateQueries({
        queryKey: ['propRecommendations', variables.playerName],
      });
    },
  });
}
