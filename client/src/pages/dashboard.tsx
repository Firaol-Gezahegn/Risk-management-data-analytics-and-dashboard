import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Shield, AlertTriangle, CheckCircle, Activity, AlertOctagon, ShieldCheck, Target } from "lucide-react";
import { ScatterChart, Scatter, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { RiskStatistics } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Control Maturity Levels
const getMaturityLevel = (score: number): { level: string; color: string; description: string } => {
  if (score >= 80) return { level: "Risk Enabled", color: "bg-green-500", description: "Proactive risk management" };
  if (score >= 60) return { level: "Risk Managed", color: "bg-blue-500", description: "Systematic risk management" };
  if (score >= 40) return { level: "Risk Defined", color: "bg-yellow-500", description: "Documented processes" };
  if (score >= 20) return { level: "Risk Aware", color: "bg-orange-500", description: "Basic awareness" };
  return { level: "Risk Naive", color: "bg-red-500", description: "Minimal controls" };
};

const getControlColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<RiskStatistics>({
    queryKey: ["/api/risks/statistics"],
  });

  const { data: dashboardData, isLoading: dataLoading } = useQuery<any>({
    queryKey: ["/api/risks/dashboard-data"],
  });

  const isLoading = statsLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Risk Dashboard</h1>
          <p className="text-muted-foreground mt-2">Operational Risk Management Analytics</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const risks = dashboardData?.risks || [];
  const departmentControls = dashboardData?.departmentControls || [];
  const statusData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Risk Dashboard</h1>
        <p className="text-muted-foreground mt-2">Operational Risk Management Analytics</p>
      </div>

      {/* Risk Level Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard title="Total Risks" value={stats?.total || 0} icon={Shield} />
        <StatCard title="Very High" value={stats?.veryHigh || 0} icon={AlertOctagon} className="border-red-500/30 bg-red-50 dark:bg-red-950/20" />
        <StatCard title="High Risk" value={stats?.high || 0} icon={AlertTriangle} className="border-orange-500/30 bg-orange-50 dark:bg-orange-950/20" />
        <StatCard title="Medium" value={stats?.medium || 0} icon={Activity} className="border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20" />
        <StatCard title="Low Risk" value={stats?.low || 0} icon={CheckCircle} className="border-blue-500/30 bg-blue-50 dark:bg-blue-950/20" />
        <StatCard title="Very Low" value={stats?.veryLow || 0} icon={ShieldCheck} className="border-green-500/30 bg-green-50 dark:bg-green-950/20" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Residual vs Inherent Risk Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Residual vs Inherent Risk</CardTitle>
            <CardDescription>Control effectiveness - points below diagonal = effective controls</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="inherentRisk" name="Inherent" domain={[0, 100]} label={{ value: 'Inherent Risk', position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" dataKey="residualRisk" name="Residual" domain={[0, 100]} label={{ value: 'Residual Risk', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
                        <p className="font-semibold">{data.riskId}: {data.riskTitle}</p>
                        <p>Inherent: {data.inherentRisk?.toFixed(1)}</p>
                        <p>Residual: {data.residualRisk?.toFixed(1) || 'N/A'}</p>
                        <p>Control: {data.controlEffectiveness?.toFixed(0) || 'N/A'}%</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#666" strokeWidth={2} />
                <Scatter name="Risks" data={risks.filter((r: any) => r.residualRisk !== null)}>
                  {risks.filter((r: any) => r.residualRisk !== null).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getControlColor(entry.controlEffectiveness || 0)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Control Effectiveness by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Control Effectiveness by Department</CardTitle>
            <CardDescription>Control maturity across chief offices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentControls} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={60} interval={0} style={{ fontSize: '8px' }} />
                <YAxis domain={[0, 100]} label={{ value: 'Control (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload;
                    const maturity = getMaturityLevel(data.avgControlEffectiveness);
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
                        <p className="font-semibold">{data.department}</p>
                        <p>Control: {data.avgControlEffectiveness.toFixed(1)}%</p>
                        <p>Maturity: {maturity.level}</p>
                        <p>Risks: {data.riskCount}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="avgControlEffectiveness" radius={[8, 8, 0, 0]}>
                  {departmentControls.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getControlColor(entry.avgControlEffectiveness)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Control vs Likelihood Priority Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Control vs Likelihood Priority</CardTitle>
            <CardDescription>Bottom-right = URGENT (high likelihood, low controls)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="likelihood" name="Likelihood" domain={[0, 100]} label={{ value: 'Likelihood', position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" dataKey="controlEffectiveness" name="Control" domain={[0, 100]} label={{ value: 'Control (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
                        <p className="font-semibold">{data.riskId}: {data.riskTitle}</p>
                        <p>Likelihood: {data.likelihood?.toFixed(0)}</p>
                        <p>Control: {data.controlEffectiveness?.toFixed(0) || 'N/A'}%</p>
                        <p>Impact: {data.impact?.toFixed(0)}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <ReferenceLine y={50} stroke="#999" strokeDasharray="3 3" />
                <ReferenceLine x={50} stroke="#999" strokeDasharray="3 3" />
                <Scatter name="Risks" data={risks.filter((r: any) => r.controlEffectiveness !== null)}>
                  {risks.filter((r: any) => r.controlEffectiveness !== null).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getControlColor(entry.controlEffectiveness || 0)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Control Maturity Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Control Maturity Level
            </CardTitle>
            <CardDescription>Risk management maturity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const maturity = getMaturityLevel(stats?.controlEffectiveness?.average || 0);
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Maturity</span>
                      <Badge className={`${maturity.color} text-white`}>{maturity.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{maturity.description}</p>
                    <div className="space-y-2 pt-4 border-t">
                      <div className="text-xs font-medium text-muted-foreground">Maturity Levels:</div>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { level: "Risk Naive", color: "bg-red-500", range: "0-20%" },
                          { level: "Risk Aware", color: "bg-orange-500", range: "20-40%" },
                          { level: "Risk Defined", color: "bg-yellow-500", range: "40-60%" },
                          { level: "Risk Managed", color: "bg-blue-500", range: "60-80%" },
                          { level: "Risk Enabled", color: "bg-green-500", range: "80-100%" },
                        ].map((item, idx) => (
                          <div key={idx} className="text-center">
                            <div className={`h-2 ${item.color} rounded mb-1`}></div>
                            <div className="text-[10px] font-medium">{item.level.split(' ')[1]}</div>
                            <div className="text-[9px] text-muted-foreground">{item.range}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* 5. Risk Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Trend (Last 12 Months)</CardTitle>
            <CardDescription>Monthly risk identification patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. Risk by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Risk by Status</CardTitle>
            <CardDescription>Current status of identified risks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
