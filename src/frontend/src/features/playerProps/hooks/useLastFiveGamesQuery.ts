import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { PlayerPropsBackendClient } from '../backendClient';
import { type GameStatsInput } from '../types';

export function useLastFiveGamesQuery(playerName: string, enabled: boolean) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<GameStatsInput[]>({
    queryKey: ['lastFiveGames', playerName],
    queryFn: async () => {
      if (!actor) return [];

      const client = new PlayerPropsBackendClient(actor);
      return await client.getLastFiveGames(playerName);
    },
    enabled: enabled && !!actor && !isActorFetching && !!playerName,
  });
}
