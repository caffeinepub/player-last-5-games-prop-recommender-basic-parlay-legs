import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { type OfferedProp } from '../types';
import { Plus, X, Filter } from 'lucide-react';

interface OfferedPropsEditorProps {
  offeredProps: OfferedProp[];
  onOfferedPropsChange: (props: OfferedProp[]) => void;
  filterEnabled: boolean;
  onFilterEnabledChange: (enabled: boolean) => void;
  sportsbook: string;
  onSportsbookChange: (sportsbook: string) => void;
}

export function OfferedPropsEditor({
  offeredProps,
  onOfferedPropsChange,
  filterEnabled,
  onFilterEnabledChange,
  sportsbook,
  onSportsbookChange,
}: OfferedPropsEditorProps) {
  const [propType, setPropType] = useState('points');
  const [threshold, setThreshold] = useState('20');

  const handleAddProp = () => {
    const thresholdNum = parseInt(threshold);
    if (isNaN(thresholdNum) || thresholdNum < 0) return;

    const newProp: OfferedProp = {
      propType: propType.toLowerCase(),
      threshold: thresholdNum,
    };

    // Avoid duplicates
    const exists = offeredProps.some(
      (p) => p.propType === newProp.propType && p.threshold === newProp.threshold
    );

    if (!exists) {
      onOfferedPropsChange([...offeredProps, newProp]);
    }
  };

  const handleRemoveProp = (index: number) => {
    onOfferedPropsChange(offeredProps.filter((_, i) => i !== index));
  };

  const formatPropType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Sportsbook Props
        </CardTitle>
        <CardDescription>
          Add props offered by your sportsbook to filter recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sportsbook Selector */}
        <div className="space-y-2">
          <Label htmlFor="sportsbook">Sportsbook</Label>
          <Select value={sportsbook} onValueChange={onSportsbookChange}>
            <SelectTrigger id="sportsbook">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DraftKings">DraftKings</SelectItem>
              <SelectItem value="FanDuel">FanDuel</SelectItem>
              <SelectItem value="Bet365">Bet365</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Prop Form */}
        <div className="space-y-4">
          <Label>Add Offered Prop</Label>
          <div className="flex gap-2">
            <Select value={propType} onValueChange={setPropType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="rebounds">Rebounds</SelectItem>
                <SelectItem value="assists">Assists</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              placeholder="Threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-24"
            />
            <Button onClick={handleAddProp} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Offered Props List */}
        {offeredProps.length > 0 && (
          <div className="space-y-2">
            <Label>Offered Props ({offeredProps.length})</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {offeredProps.map((prop, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm font-medium">
                    {formatPropType(prop.propType)} {prop.threshold}+
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveProp(index)}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="space-y-0.5">
            <Label htmlFor="filter-toggle" className="text-base">
              Filter Recommendations
            </Label>
            <p className="text-sm text-muted-foreground">
              Only show props matching offered lines
            </p>
          </div>
          <Switch
            id="filter-toggle"
            checked={filterEnabled}
            onCheckedChange={onFilterEnabledChange}
            disabled={offeredProps.length === 0}
          />
        </div>

        {filterEnabled && offeredProps.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add at least one offered prop to enable filtering
          </p>
        )}
      </CardContent>
    </Card>
  );
}
