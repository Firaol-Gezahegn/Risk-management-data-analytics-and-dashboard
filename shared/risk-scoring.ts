// 5×5 Risk Scoring Matrix and Utilities
// This module provides risk scoring calculations based on a 5×5 matrix

// 5×5 Rating Matrix
// Rows represent Likelihood levels (0-4)
// Columns represent Impact levels (0-4)
// Values range from 0 (Very Low) to 24 (Very High)
export const ratingMatrix = [
  [0, 1, 2, 3, 4],      // Very Low Likelihood
  [5, 6, 7, 8, 9],      // Low Likelihood
  [10, 11, 12, 13, 14], // Medium Likelihood
  [15, 16, 17, 18, 19], // High Likelihood
  [20, 21, 22, 23, 24], // Very High Likelihood
];

// Risk rating labels
export type RiskRating = "Very Low" | "Low" | "Medium" | "High" | "Very High";

// Convert numeric score (0-100) to matrix index (0-4)
export function scoreToMatrixIndex(score: number): number {
  if (score <= 20) return 0; // Very Low
  if (score <= 40) return 1; // Low
  if (score <= 60) return 2; // Medium
  if (score <= 80) return 3; // High
  return 4; // Very High
}

// Convert matrix index (0-4) to risk rating label
export function matrixIndexToRating(index: number): RiskRating {
  const ratings: RiskRating[] = ["Very Low", "Low", "Medium", "High", "Very High"];
  return ratings[Math.max(0, Math.min(4, index))];
}

// Convert matrix value (0-24) to risk rating label
export function matrixValueToRating(value: number): RiskRating {
  if (value <= 4) return "Very Low";
  if (value <= 9) return "Low";
  if (value <= 14) return "Medium";
  if (value <= 19) return "High";
  return "Very High";
}

// Calculate inherent risk score using 5×5 matrix
export function calculateInherentRisk(likelihood: number, impact: number): {
  score: number;
  matrixValue: number;
  rating: RiskRating;
} {
  const likelihoodIndex = scoreToMatrixIndex(likelihood);
  const impactIndex = scoreToMatrixIndex(impact);
  const matrixValue = ratingMatrix[likelihoodIndex][impactIndex];
  
  // Convert matrix value (0-24) back to 0-100 scale for consistency
  const score = (matrixValue / 24) * 100;
  const rating = matrixValueToRating(matrixValue);
  
  return { score, matrixValue, rating };
}

// Calculate residual risk based on inherent risk and control effectiveness
export function calculateResidualRisk(
  inherentRiskScore: number,
  controlEffectiveness: number
): {
  score: number;
  rating: RiskRating;
} {
  // Residual Risk = Inherent Risk × (1 - Control Effectiveness/100)
  // Control effectiveness reduces the inherent risk
  const effectivenessReduction = controlEffectiveness / 100;
  const score = inherentRiskScore * (1 - effectivenessReduction);
  
  const rating = matrixIndexToRating(scoreToMatrixIndex(score));
  
  return { score, rating };
}

// Get risk color for UI display
export function getRiskColor(rating: RiskRating): {
  bg: string;
  text: string;
  border: string;
} {
  const colors = {
    "Very Low": {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-300",
      border: "border-green-300 dark:border-green-700",
    },
    "Low": {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-blue-300 dark:border-blue-700",
    },
    "Medium": {
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      text: "text-yellow-800 dark:text-yellow-300",
      border: "border-yellow-300 dark:border-yellow-700",
    },
    "High": {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      text: "text-orange-800 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-700",
    },
    "Very High": {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-300",
      border: "border-red-300 dark:border-red-700",
    },
  };
  
  return colors[rating];
}

// Compute all risk scores for a risk record
export interface RiskScoreComputation {
  inherentRisk: {
    score: number;
    matrixValue: number;
    rating: RiskRating;
  };
  residualRisk?: {
    score: number;
    rating: RiskRating;
  };
  riskScore: number; // Final computed score
}

export function computeRiskScores(
  likelihood: number,
  impact: number,
  controlEffectiveness?: number
): RiskScoreComputation {
  const inherentRisk = calculateInherentRisk(likelihood, impact);
  
  let residualRisk;
  if (controlEffectiveness !== undefined && controlEffectiveness !== null) {
    residualRisk = calculateResidualRisk(inherentRisk.score, controlEffectiveness);
  }
  
  // Final risk score is residual if available, otherwise inherent
  const riskScore = residualRisk?.score ?? inherentRisk.score;
  
  return {
    inherentRisk,
    residualRisk,
    riskScore,
  };
}
