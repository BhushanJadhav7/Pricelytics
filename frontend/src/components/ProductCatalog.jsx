import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export default function ProductCatalog({ 
  products, 
  pagination, 
  loading, 
  onPageChange, 
  filters, 
  setFilters, 
  dropdownOptions,
  onOpenCreate,
  onOpenEdit,
  onDeleteProduct
}) {
  const [selectedSort, setSelectedSort] = useState({ by: 'id', order: 'desc' });

  const handleSort = (field) => {
    const isAsc = selectedSort.by === field && selectedSort.order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setSelectedSort({ by: field, order: newOrder });
    setFilters({ ...filters, sort_by: field, sort_order: newOrder });
  };

  const exportToCSV = () => {
    if (!products || products.length === 0) return;
    const headers = ['ID,Product_Code,Product_Brand,Item_Category,Subcategory_1,Subcategory_2,Item_Rating,Actual_Price,Predicted_Price,Margin_Uplift_Pct,Status\n'];
    const rows = products.map(p => 
      `${p.id},"${p.product_code}","${p.product_brand}","${p.item_category}","${p.subcategory_1}","${p.subcategory_2}",${p.item_rating},${p.selling_price},${p.predicted_price},${p.margin_uplift_pct},"${p.pricing_status}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricelytics_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      
      {/* Control Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Search SKU, Brand, or Category..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product SKU</span>
            </button>
          </div>

        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>

          {['all', 'Underpriced', 'Optimized', 'Overpriced'].map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ ...filters, pricing_status: status === 'all' ? null : status, page: 1 })}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                (filters.pricing_status === status || (!filters.pricing_status && status === 'all'))
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status === 'all' ? 'All Catalog' : status}
            </button>
          ))}

          {/* Category Filter */}
          <select
            value={filters.category || 'all'}
            onChange={(e) => setFilters({ ...filters, category: e.target.value === 'all' ? null : e.target.value, page: 1 })}
            className="ml-auto px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Categories</option>
            {dropdownOptions?.categories?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Data Grid */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('product_code')}>
                  <div className="flex items-center gap-1">
                    <span>SKU / Product</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('product_brand')}>
                  <div className="flex items-center gap-1">
                    <span>Brand</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Category & Subcategory</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('item_rating')}>
                  <div className="flex items-center gap-1">
                    <span>Rating</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('selling_price')}>
                  <div className="flex items-center gap-1">
                    <span>Actual Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('predicted_price')}>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span>AI Optimal Price</span>
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Margin Gap</th>
                <th className="py-3 px-4">Pricing Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Streaming PostgreSQL records...</span>
                    </div>
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((item) => {
                  const uplift = item.margin_uplift_pct || 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-850/60 transition-colors group">
                      <td className="py-3 px-4 font-mono font-medium text-white">
                        {item.product_code}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {item.product_brand}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <div className="font-medium text-slate-200">{item.item_category}</div>
                        <div className="text-[10px] text-slate-500">{item.subcategory_1} &bull; {item.subcategory_2}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-brand-300">
                        {item.item_rating} ★
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        ${item.selling_price?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ${item.predicted_price?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <span className={uplift >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {uplift >= 0 ? `+${uplift.toFixed(1)}%` : `${uplift.toFixed(1)}%`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.pricing_status === 'Underpriced'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.pricing_status === 'Overpriced'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                        }`}>
                          {item.pricing_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => onOpenEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-brand-400 transition-colors"
                          title="Edit & Recalculate"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product ${item.product_code}?`)) {
                              onDeleteProduct(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    No products found matching active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.total_pages > 1 && (
          <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <strong className="text-white">{((pagination.page - 1) * pagination.page_size) + 1}</strong> to <strong className="text-white">{Math.min(pagination.page * pagination.page_size, pagination.total)}</strong> of <strong className="text-white">{pagination.total.toLocaleString()}</strong> items
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold">
                {pagination.page} / {pagination.total_pages}
              </span>

              <button
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => onPageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
