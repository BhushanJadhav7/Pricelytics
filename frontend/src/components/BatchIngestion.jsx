import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  Zap,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';
import { api } from '../api';

export default function BatchIngestion({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        alert("Please upload a valid .csv file.");
        return;
      }
      setFile(selected);
      setUploadResult(null);
      addLog(`Selected file: ${selected.name} (${(selected.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(15);
    addLog(`Initiating multipart upload for ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(40);
      addLog(`Parsing CSV data structures and extracting schema features...`);

      setProgress(65);
      addLog(`Streaming records through Scikit-Learn Random Forest Regressor Pipeline...`);

      const res = await api.uploadBatchCSV(formData);

      setProgress(90);
      addLog(`Persisting ${res.total_processed} dynamic priced records into PostgreSQL database...`);

      setProgress(100);
      addLog(`✓ Batch execution completed successfully (Batch ID: #${res.batch_id})`);
      setUploadResult(res);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message;
      addLog(`✕ Ingestion failed: ${errMsg}`);
      alert("Upload failed: " + errMsg);
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleContent = 
`Product,Product_Brand,Item_Category,Subcategory_1,Subcategory_2,Item_Rating,Date,Selling_Price
P-9001,B-659,bags wallets belts,bags,hand bags,4.3,01-01-2024,320
P-9002,B-3078,clothing,women s clothing,western wear,4.1,01-01-2024,950
P-9003,B-1810,home decor festive needs,showpieces,ethnic,3.8,01-01-2024,810
P-9004,B-1347,computers,computer components,processors,4.6,01-01-2024,2890
P-9005,B-2830,kitchen dining,cookware,pots pans,3.5,01-01-2024,990`;

    const blob = new Blob([sampleContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "pricelytics_batch_template.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Automated Data Pipeline Ingestion
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Bulk Ingestion & Real-Time Pipeline Processing</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Upload batch product catalogs in CSV format. Each item automatically streams through the Random Forest ML pipeline for dynamic valuation before committing to PostgreSQL.
          </p>
        </div>

        <button
          onClick={downloadSampleCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Dropzone (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-brand-400" />
            Upload Product Batch
          </h3>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              file
                ? 'border-emerald-500/60 bg-emerald-950/20'
                : 'border-slate-700 hover:border-brand-500 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                <FileSpreadsheet className={`w-7 h-7 ${file ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-bold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB ready for ingestion</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">Click or drag & drop CSV file to upload</p>
                  <p className="text-xs text-slate-500 mt-1">Supports standard Train.csv format with Product, Brand, Category, Rating, Price</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar when uploading */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Streaming through Random Forest ML pipeline...</span>
                <span className="font-semibold text-brand-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Result Banner */}
          {uploadResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white text-sm block">Ingestion Successful!</strong>
                {uploadResult.message}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            {file && (
              <button
                type="button"
                onClick={() => { setFile(null); setUploadResult(null); }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Real-Time Ingestion...</span>
                </>
              ) : (
                <>
                  <span>Execute Real-Time Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Pipeline Telemetry Terminal (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pipeline Ingestion Telemetry
              </h3>
              <span className="text-[10px] font-mono text-slate-500">FastAPI &bull; ML Engine</span>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-850 font-mono text-[11px] text-slate-300 space-y-1.5 h-[260px] overflow-y-auto">
              <div className="text-slate-500">// Pipeline event stream initialized...</div>
              <div className="text-slate-500">// PostgreSQL transaction manager ready.</div>
              {logs.map((log, index) => (
                <div key={index} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400">Database</div>
                <div className="font-semibold text-white">PostgreSQL ACID</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-brand-400" />
              <div>
                <div className="text-[10px] text-slate-400">Model Pipeline</div>
                <div className="font-semibold text-white">Random Forest (100)</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
