import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIngestLastFiveGamesMutation } from '../hooks/useIngestLastFiveGamesMutation';
import { useLastFiveGamesQuery } from '../hooks/useLastFiveGamesQuery';
import { validatePlayerName } from '../validation';
import { Loader2, Download, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LastFiveGamesFormProps {
  onSubmit: (playerName: string) => void;
  onReset: () => void;
}

export function LastFiveGamesForm({ onSubmit, onReset }: LastFiveGamesFormProps) {
  const [playerName, setPlayerName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [ingestionComplete, setIngestionComplete] = useState(false);

  const mutation = useIngestLastFiveGamesMutation();
  const { data: lastFiveGames, isLoading: isLoadingGames } = useLastFiveGamesQuery(
    playerName,
    ingestionComplete
  );

  const handleFetchGames = async () => {
    const validationErrors: string[] = [];

    const nameError = validatePlayerName(playerName);
    if (nameError) {
      validationErrors.push(nameError);
      setErrors(validationErrors);
      return;
    }

    try {
      setErrors([]);
      await mutation.mutateAsync({ playerName });
      setIngestionComplete(true);
      onSubmit(playerName);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('not found')) {
          setErrors(['Player not found. Please check the player name and try again.']);
        } else if (errorMessage.includes('invalid')) {
          setErrors(['Invalid response from stats provider. Please try again.']);
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          setErrors(['Network error. Please check your connection and try again.']);
        } else {
          setErrors([`Failed to fetch games: ${error.message}`]);
        }
      } else {
        setErrors(['An unknown error occurred while fetching game data.']);
      }
      setIngestionComplete(false);
    }
  };

  const handleReset = () => {
    setPlayerName('');
    setErrors([]);
    setIngestionComplete(false);
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fetch Player Stats</CardTitle>
        <CardDescription>
          Enter a player name to automatically fetch their last 5 games from BallDontLie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player Name */}
        <div className="space-y-2">
          <Label htmlFor="playerName">Player Name</Label>
          <Input
            id="playerName"
            placeholder="e.g., LeBron James"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setIngestionComplete(false);
            }}
            disabled={mutation.isPending}
          />
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {ingestionComplete && !mutation.isPending && errors.length === 0 && (
          <Alert className="border-chart-4 bg-chart-4/10">
            <CheckCircle2 className="h-4 w-4 text-chart-4" />
            <AlertDescription className="text-chart-4">
              Successfully fetched last 5 games for {playerName}
            </AlertDescription>
          </Alert>
        )}

        {/* Last Five Games Preview */}
        {ingestionComplete && lastFiveGames && lastFiveGames.length > 0 && (
          <div className="space-y-2">
            <Label>Last 5 Games (Most Recent First)</Label>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Game</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Rebounds</TableHead>
                    <TableHead>Assists</TableHead>
                    <TableHead>3PM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastFiveGames.map((game, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>{game.points}</TableCell>
                      <TableCell>{game.rebounds}</TableCell>
                      <TableCell>{game.assists}</TableCell>
                      <TableCell>{game.threesMade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Loading State for Games Preview */}
        {isLoadingGames && ingestionComplete && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading game data...</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleFetchGames}
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching last 5 games...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Fetch Last 5 Games
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={mutation.isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
