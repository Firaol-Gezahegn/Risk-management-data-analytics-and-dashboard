import { Badge } from "@/components/ui/badge";
import { getRiskRating } from "@shared/constants";

interface RiskRatingBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskRatingBadge({ score, showLabel = true, size = "md" }: RiskRatingBadgeProps) {
  const rating = getRiskRating(score);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <Badge 
      className={`${rating.bgClass} ${rating.textClass} ${rating.borderClass} border ${sizeClasses[size]}`}
    >
      {showLabel ? `${score.toFixed(0)} - ${rating.label}` : score.toFixed(0)}
    </Badge>
  );
}

interface RiskScoreDisplayProps {
  likelihood: number;
  impact: number;
  inherentRisk: number;
  controlEffectiveness?: number;
  residualRisk?: number;
  showFormula?: boolean;
}

export function RiskScoreDisplay({
  likelihood,
  impact,
  inherentRisk,
  controlEffectiveness,
  residualRisk,
  showFormula = false,
}: RiskScoreDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Likelihood:</span>
            <span className="text-lg font-bold">{likelihood.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Impact:</span>
            <span className="text-lg font-bold">{impact.toFixed(0)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Inherent Risk:</span>
            <RiskRatingBadge score={inherentRisk} />
          </div>
          {controlEffectiveness !== undefined && controlEffectiveness > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Control Effectiveness:</span>
                <span className="text-lg font-bold">{controlEffectiveness.toFixed(0)}%</span>
              </div>
              {residualRisk !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Residual Risk:</span>
                  <RiskRatingBadge score={residualRisk} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showFormula && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-2">
          <div className="font-medium">Calculation Formulas:</div>
          <div className="text-muted-foreground">
            <div>• Inherent Risk = (Likelihood × Impact) / 100</div>
            {controlEffectiveness !== undefined && controlEffectiveness > 0 && (
              <div>• Residual Risk = Inherent Risk × (1 - Control Effectiveness / 100)</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
