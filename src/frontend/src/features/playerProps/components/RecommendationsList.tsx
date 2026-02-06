import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { type PropRecommendation } from '../types';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RecommendationsListProps {
  playerName: string;
  recommendations: PropRecommendation[];
  isLoading: boolean;
  error: Error | null;
  filterEnabled: boolean;
  hasOfferedProps: boolean;
}

export function RecommendationsList({
  playerName,
  recommendations,
  isLoading,
  error,
  filterEnabled,
  hasOfferedProps,
}: RecommendationsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getHitRateColor = (hits: number, total: number) => {
    const rate = hits / total;
    if (rate >= 0.8) return 'bg-chart-4 text-white';
    if (rate >= 0.6) return 'bg-chart-1 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const getConfidenceLabel = (hits: number, total: number) => {
    const rate = hits / total;
    if (rate === 1) return 'Very High';
    if (rate >= 0.8) return 'High';
    if (rate >= 0.6) return 'Moderate';
    return 'Low';
  };

  const formatPropType = (propType: string) => {
    return propType.charAt(0).toUpperCase() + propType.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-chart-1" />
          Prop Recommendations for {playerName}
        </CardTitle>
        <CardDescription>
          {filterEnabled && hasOfferedProps
            ? 'Showing only props matching your sportsbook offerings'
            : 'Based on last 5 games performance'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {filterEnabled && hasOfferedProps
                ? 'No recommendations match your offered props. Try disabling the filter or adding more offered props.'
                : 'No strong recommendations found. The player may not have consistent performance patterns in the last 5 games.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index}>
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {formatPropType(rec.propType)} {rec.threshold}+
                      </h3>
                      <Badge className={getHitRateColor(rec.hits, rec.total)}>
                        {rec.hits}/{rec.total} Games
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-chart-4" />
                      <span>
                        Hit in {rec.hits} of last {rec.total} games
                      </span>
                      <span className="text-xs">•</span>
                      <span className="font-medium">
                        {getConfidenceLabel(rec.hits, rec.total)} Confidence
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: rec.total }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded-full ${
                            i < rec.hits ? 'bg-chart-4' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-chart-1">
                      {Math.round((rec.hits / rec.total) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Hit Rate</div>
                  </div>
                </div>
                {index < recommendations.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
