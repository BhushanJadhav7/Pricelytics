import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Info, 
  ArrowRight,
  RefreshCw,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { api } from '../api';

export default function WhatIfSimulator({ dropdownOptions }) {
  const [params, setParams] = useState({
    product_code: 'P-SIM-001',
    product_brand: 'B-659',
    item_category: 'clothing',
    subcategory_1: 'women s clothing',
    subcategory_2: 'western wear',
    item_rating: 4.2,
    listing_date: '01-01-2024',
    selling_price: 850,
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [sensitivityCurve, setSensitivityCurve] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dropdownOptions?.categories?.length > 0 && !params.item_category) {
      setParams(p => ({
        ...p,
        item_category: dropdownOptions.categories[0],
        product_brand: dropdownOptions.brands[0] || 'B-659',
      }));
    }
  }, [dropdownOptions]);

  // Run dynamic simulation whenever parameters change
  useEffect(() => {
    const runSimulation = async () => {
      setLoading(true);
      try {
        const res = await api.predictRealtime({
          product_code: params.product_code,
          product_brand: params.product_brand,
          item_category: params.item_category,
          subcategory_1: params.subcategory_1,
          subcategory_2: params.subcategory_2,
          item_rating: params.item_rating,
          listing_date: params.listing_date,
          selling_price: params.selling_price,
        });
        setSimulationResult(res);

        // Generate rating sensitivity curve (1.0 to 5.0)
        const ratings = [1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0];
        const curvePromises = ratings.map(r => 
          api.predictRealtime({
            ...params,
            item_rating: r
          }).then(rRes => ({
            rating: `${r} ★`,
            optimalPrice: rRes.predicted_price,
            actualPrice: params.selling_price
          }))
        );
        const curveResults = await Promise.all(curvePromises);
        setSensitivityCurve(curveResults);

      } catch (err) {
        console.error("Simulation error", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(runSimulation, 250);
    return () => clearTimeout(debounceTimer);
  }, [params]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Dynamic Price Elasticity Playground
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">"What-If" Dynamic Pricing Scenario Simulator</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Simulate market demand and calculate optimal pricing strategies before launching new SKUs or adjusting promotional campaigns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              Simulated Product Parameters
            </h3>
            {loading && <RefreshCw className="w-3.5 h-3.5 text-brand-400 animate-spin" />}
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Category Select */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Product Category</label>
              <select
                value={params.item_category}
                onChange={(e) => setParams({ ...params, item_category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-brand-500"
              >
                {dropdownOptions?.categories?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Brand Select */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Brand Power / Tier</label>
              <select
                value={params.product_brand}
                onChange={(e) => setParams({ ...params, product_brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-brand-500"
              >
                {dropdownOptions?.brands?.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Subcategory 1</label>
                <select
                  value={params.subcategory_1}
                  onChange={(e) => setParams({ ...params, subcategory_1: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-brand-500"
                >
                  {dropdownOptions?.subcategories_1?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Subcategory 2</label>
                <select
                  value={params.subcategory_2}
                  onChange={(e) => setParams({ ...params, subcategory_2: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-brand-500"
                >
                  {dropdownOptions?.subcategories_2?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating Slider */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Customer Rating</span>
                <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-400 font-bold">{params.item_rating} ★</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={params.item_rating}
                onChange={(e) => setParams({ ...params, item_rating: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.0 (Poor)</span>
                <span>2.5 (Average)</span>
                <span>5.0 (Flawless)</span>
              </div>
            </div>

            {/* Base Selling Price Input */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
              <label className="block font-semibold text-slate-300">Planned Selling Price ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={params.selling_price}
                  onChange={(e) => setParams({ ...params, selling_price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-700/60 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Results & Visual Sensitivity Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Pricing Output Box */}
          <div className="p-5 rounded-2xl glass-panel border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Optimal Price Recommendation</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                simulationResult?.pricing_status === 'Underpriced'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : simulationResult?.pricing_status === 'Overpriced'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              }`}>
                {simulationResult?.pricing_status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Random Forest Target</div>
                <div className="text-2xl font-black text-emerald-400 tracking-tight mt-1">
                  ${simulationResult?.predicted_price || 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Dynamic equilibrium</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Baseline Selling Price</div>
                <div className="text-2xl font-bold text-slate-200 tracking-tight mt-1">
                  ${simulationResult?.actual_price || 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Your input price</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Margin Uplift Opportunity</div>
                <div className={`text-2xl font-black tracking-tight mt-1 ${
                  (simulationResult?.margin_uplift || 0) >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {(simulationResult?.margin_uplift || 0) >= 0 ? `+$${simulationResult?.margin_uplift}` : `-$${Math.abs(simulationResult?.margin_uplift || 0)}`}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {simulationResult?.margin_uplift_pct}% margin impact
                </div>
              </div>
            </div>

            {/* Strategic Recommendation */}
            <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-500/20 text-xs text-slate-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-brand-300 font-semibold">Strategic Guidance: </strong>
                {simulationResult?.recommendation}
              </div>
            </div>
          </div>

          {/* Rating Sensitivity Curve Chart */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <LineIcon className="w-4 h-4 text-emerald-400" />
                  Price Elasticity vs. Customer Rating Curve
                </h4>
                <p className="text-xs text-slate-400">How dynamic optimal price scales with customer reviews.</p>
              </div>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityCurve} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="rating" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val, name) => [`$${val}`, name === 'optimalPrice' ? 'AI Optimal Dynamic Price' : 'Your Fixed Price']}
                  />
                  <Line type="monotone" dataKey="optimalPrice" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                  <Line type="monotone" dataKey="actualPrice" stroke="#64748b" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
