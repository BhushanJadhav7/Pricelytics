import React from 'react';
import { Activity, Database, Cpu, RefreshCw, Zap, Layers, BarChart3, UploadCloud, Sliders, ShieldCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isLive, lastEvent, onRefresh, isRefreshing }) {
  const tabs = [
    { id: 'overview', label: 'Executive Pulse', icon: BarChart3 },
    { id: 'catalog', label: 'Inventory & Live CRUD', icon: Layers },
    { id: 'simulator', label: 'Price Simulator', icon: Sliders },
    { id: 'ingestion', label: 'Batch Ingestion', icon: UploadCloud },
    { id: 'model', label: 'ML & DB Health', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Pricelytics
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">PostgreSQL + Real-Time Random Forest Engine</p>
            </div>
          </div>

          {/* Mobile Live Badge */}
          <div className="flex md:hidden items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-medium text-slate-300">{isLive ? 'Live Stream' : 'Connecting'}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Telemetry Badges & Refresh */}
        <div className="hidden md:flex items-center gap-3">
          {/* DB Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL: <strong className="text-white font-medium">Active</strong></span>
          </div>

          {/* Model Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>RF Pipeline: <strong className="text-white font-medium">Online</strong></span>
          </div>

          {/* WebSocket Pulse */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{isLive ? 'Real-Time Sync' : 'Reconnecting...'}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title="Refresh Catalog and Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Real-time event toast bar if event fired recently */}
      {lastEvent && (
        <div className="mt-2 text-center text-xs py-1 px-3 rounded-md bg-brand-950/50 border border-brand-500/20 text-brand-300 animate-fadeIn">
          ⚡ <strong>Live Stream Event:</strong> {lastEvent.event} &bull; {lastEvent.message || `Product ID ${lastEvent.product_id || ''} processed in real-time.`}
        </div>
      )}
    </header>
  );
}
