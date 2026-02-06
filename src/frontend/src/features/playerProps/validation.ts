import { type GameStatsInput } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePlayerName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Player name is required';
  }
  if (name.trim().length < 2) {
    return 'Player name must be at least 2 characters';
  }
  return null;
}

export function validateGameStats(stats: GameStatsInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (stats.points < 0) {
    errors.push({ field: 'points', message: 'Points cannot be negative' });
  }
  if (stats.rebounds < 0) {
    errors.push({ field: 'rebounds', message: 'Rebounds cannot be negative' });
  }
  if (stats.assists < 0) {
    errors.push({ field: 'assists', message: 'Assists cannot be negative' });
  }
  if (stats.threesMade < 0) {
    errors.push({ field: 'threesMade', message: 'Threes made cannot be negative' });
  }

  return errors;
}
