export interface GameStatsInput {
  points: number;
  rebounds: number;
  assists: number;
  threesMade: number;
}

export interface OfferedProp {
  propType: string;
  threshold: number;
}

export interface PropRecommendation {
  propType: string;
  threshold: number;
  hits: number;
  total: number;
}
