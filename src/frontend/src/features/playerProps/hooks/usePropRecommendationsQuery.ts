import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { PlayerPropsBackendClient } from '../backendClient';
import { type OfferedProp, type PropRecommendation, type GameStatsInput } from '../types';
import { matchesOfferedProp } from '../utils/propMatching';

// Calculate prop recommendations from game stats
function calculateRecommendations(games: GameStatsInput[]): PropRecommendation[] {
  if (games.length === 0) return [];

  const propTypes = ['points', 'rebounds', 'assists', 'threesMade'] as const;
  const recommendations: PropRecommendation[] = [];

  // For each prop type, find thresholds that hit frequently
  propTypes.forEach((propType) => {
    // Get all values for this prop type
    const values = games.map((game) => game[propType]);
    const maxValue = Math.max(...values);
    
    // Test various thresholds
    const thresholdsToTest = [
      Math.floor(maxValue * 0.5),
      Math.floor(maxValue * 0.6),
      Math.floor(maxValue * 0.7),
      Math.floor(maxValue * 0.8),
      Math.floor(maxValue * 0.9),
    ].filter((t) => t > 0);

    // Remove duplicates
    const uniqueThresholds = [...new Set(thresholdsToTest)];

    uniqueThresholds.forEach((threshold) => {
      const hits = values.filter((v) => v >= threshold).length;
      const hitRate = hits / games.length;

      // Only include recommendations with at least 60% hit rate
      if (hitRate >= 0.6) {
        recommendations.push({
          propType: propType === 'threesMade' ? 'threes' : propType,
          threshold,
          hits,
          total: games.length,
        });
      }
    });
  });

  // Sort by hit rate (descending), then by threshold (descending)
  return recommendations.sort((a, b) => {
    const rateA = a.hits / a.total;
    const rateB = b.hits / b.total;
    if (rateB !== rateA) return rateB - rateA;
    return b.threshold - a.threshold;
  });
}

export function usePropRecommendationsQuery(
  playerName: string,
  offeredProps: OfferedProp[],
  filterEnabled: boolean,
  enabled: boolean
) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<PropRecommendation[]>({
    queryKey: ['propRecommendations', playerName, offeredProps, filterEnabled],
    queryFn: async () => {
      if (!actor) return [];

      const client = new PlayerPropsBackendClient(actor);
      const games = await client.getLastFiveGames(playerName);

      // Calculate recommendations from the games data
      const recommendations = calculateRecommendations(games);

      // Apply filtering if enabled
      if (filterEnabled && offeredProps.length > 0) {
        return recommendations.filter((rec) =>
          offeredProps.some((offered) => matchesOfferedProp(rec, offered))
        );
      }

      return recommendations;
    },
    enabled: enabled && !!actor && !isActorFetching && !!playerName,
  });
}
