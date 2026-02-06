import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LastFiveGamesForm } from './features/playerProps/components/LastFiveGamesForm';
import { RecommendationsList } from './features/playerProps/components/RecommendationsList';
import { OfferedPropsEditor } from './features/playerProps/components/OfferedPropsEditor';
import { usePropRecommendationsQuery } from './features/playerProps/hooks/usePropRecommendationsQuery';
import { type OfferedProp } from './features/playerProps/types';
import { TrendingUp } from 'lucide-react';
import { SiCaffeine } from 'react-icons/si';

const queryClient = new QueryClient();

function AppContent() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [ingestionComplete, setIngestionComplete] = useState(false);
  const [offeredProps, setOfferedProps] = useState<OfferedProp[]>([]);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [sportsbook, setSportsbook] = useState<string>('DraftKings');

  const { data: recommendations, isLoading, error } = usePropRecommendationsQuery(
    selectedPlayer,
    offeredProps,
    filterEnabled,
    ingestionComplete
  );

  const handleFormSubmit = (playerName: string) => {
    setSelectedPlayer(playerName);
    setIngestionComplete(true);
  };

  const handleReset = () => {
    setSelectedPlayer('');
    setIngestionComplete(false);
    setOfferedProps([]);
    setFilterEnabled(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-chart-1 to-chart-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Prop Bet Analyzer</h1>
              <p className="text-sm text-muted-foreground">Auto-fetch last 5 games performance insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Input Section */}
          <section>
            <LastFiveGamesForm onSubmit={handleFormSubmit} onReset={handleReset} />
          </section>

          {/* Results Section */}
          {ingestionComplete && selectedPlayer && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Offered Props Editor - Left Sidebar */}
              <aside className="lg:col-span-1">
                <OfferedPropsEditor
                  offeredProps={offeredProps}
                  onOfferedPropsChange={setOfferedProps}
                  filterEnabled={filterEnabled}
                  onFilterEnabledChange={setFilterEnabled}
                  sportsbook={sportsbook}
                  onSportsbookChange={setSportsbook}
                />
              </aside>

              {/* Recommendations - Main Content */}
              <section className="lg:col-span-2">
                <RecommendationsList
                  playerName={selectedPlayer}
                  recommendations={recommendations || []}
                  isLoading={isLoading}
                  error={error}
                  filterEnabled={filterEnabled}
                  hasOfferedProps={offeredProps.length > 0}
                />
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026. Built with <SiCaffeine className="inline h-4 w-4 text-chart-1" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-chart-1 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
