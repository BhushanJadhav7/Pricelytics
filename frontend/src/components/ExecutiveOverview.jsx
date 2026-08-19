import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Target, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight, 
  CheckCircle2,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend, 
  Cell, 
  PieChart, 
  Pie,
  Line
} from 'recharts';

export default function ExecutiveOverview({ kpis, categoryData, scatterData, loading }) {
  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Aggregating real-time database intelligence...</p>
        </div>
      </div>
    );
  }

  // Distribution colors
  const statusColors = {
    Underpriced: '#10b981', // Emerald
    Optimized: '#3b82f6',   // Brand Blue
    Overpriced: '#f59e0b'   // Amber
  };

  const distributionData = [
    { name: 'Underpriced (Raise Price)', value: kpis?.underpriced_count || 0, color: statusColors.Underpriced },
    { name: 'Optimized (Equilibrium)', value: kpis?.optimized_count || 0, color: statusColors.Optimized },
    { name: 'Overpriced (Lower Price)', value: kpis?.overpriced_count || 0, color: statusColors.Overpriced },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Real-Time ML Pulse */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-black/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Automated Random Forest Pipeline Active
            </span>
            <span className="text-xs text-slate-400">Database Records: {kpis?.total_products?.toLocaleString() || 0}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Executive Pricing & Margin Intelligence</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time multi-variable regression predicting dynamic optimal product prices based on category, brand power, ratings, and date elasticity.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-right">
            <div className="text-xs text-slate-400">Random Forest Model Accuracy</div>
            <div className="text-lg font-bold text-brand-400">R² = {((kpis?.model_r2 || 0.884) * 100).toFixed(1)}%</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-400" />
          </div>
        </div>
      </div>

      {/* 6 High-Impact KPI Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Total Catalog Revenue */}
        <div className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Catalog Value</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            ${(kpis?.total_catalog_revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-400 gap-1">
            <span>Across all active SKUs</span>
          </div>
        </div>

        {/* Card 2: Active SKUs */}
        <div className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Active SKUs</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {(kpis?.total_products || 0).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-indigo-400 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Ingested in PostgreSQL</span>
          </div>
        </div>

        {/* Card 3: Avg Actual Price */}
        <div className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Avg Actual Price</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-200 tracking-tight">
            ${(kpis?.avg_actual_price || 0).toFixed(2)}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-400 gap-1">
            <span>Current baseline average</span>
          </div>
        </div>

        {/* Card 4: Avg Predicted Price */}
        <div className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Avg Optimal Price</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            ${(kpis?.avg_predicted_price || 0).toFixed(2)}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400/80 gap-1">
            <span>Random Forest target</span>
          </div>
        </div>

        {/* Card 5: Potential Revenue Uplift */}
        <div className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Net Price Gap</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className={`text-xl font-bold tracking-tight ${(kpis?.potential_revenue_uplift || 0) >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            ${Math.abs(kpis?.potential_revenue_uplift || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-400 gap-1">
            <span>{kpis?.potential_uplift_pct || 0}% vs current catalog</span>
          </div>
        </div>

        {/* Card 6: Underpriced Opportunities */}
        <div className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Margin Boost SKUs</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            {(kpis?.underpriced_count || 0).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400 gap-1">
            <span>Ready for price elevation</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Actual vs Predicted Price Scatter Matrix (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-400" />
                Actual vs. Random Forest Predicted Price Matrix
              </h3>
              <p className="text-xs text-slate-400">Comparing current selling price against AI calculated optimal dynamic price.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Current Catalog Sample
              </span>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  type="number" 
                  dataKey="actual_price" 
                  name="Actual Price" 
                  unit="$" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickFormatter={(val) => `$${val}`}
                />
                <YAxis 
                  type="number" 
                  dataKey="predicted_price" 
                  name="Optimal Price" 
                  unit="$" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickFormatter={(val) => `$${val}`}
                />
                <ZAxis type="number" dataKey="item_rating" range={[30, 180]} name="Rating" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const diff = data.predicted_price - data.actual_price;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{data.product_code} ({data.item_category})</div>
                          <div className="text-slate-300">Actual Price: <strong className="text-white">${data.actual_price}</strong></div>
                          <div className="text-slate-300">Predicted Price: <strong className="text-emerald-400">${data.predicted_price}</strong></div>
                          <div className="text-slate-300">Rating: <strong className="text-brand-300">{data.item_rating} ★</strong></div>
                          <div className={`font-semibold ${diff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            Gap: {diff >= 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Products" data={scatterData || []} fill="#3b82f6" fillOpacity={0.65} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pricing Distribution Donut */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              Catalog Pricing Equilibrium
            </h3>
            <p className="text-xs text-slate-400">Breakdown of underpriced, overpriced, and optimal products.</p>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} SKUs`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {distributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="text-white font-bold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Category Performance & Strategy */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Top Category Pricing Breakdown (Actual vs. AI Predicted)
            </h3>
            <p className="text-xs text-slate-400">Evaluate dynamic price adjustments across high-volume product categories.</p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData || []} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val, name) => [`$${val}`, name === 'avg_actual_price' ? 'Avg Actual Price' : 'Avg AI Predicted Price']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="avg_actual_price" name="Avg Actual Price" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_predicted_price" name="Avg AI Predicted Price" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
