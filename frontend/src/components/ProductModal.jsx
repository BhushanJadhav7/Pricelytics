import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../api';

export default function ProductModal({ isOpen, onClose, onSave, productToEdit, dropdownOptions }) {
  const [formData, setFormData] = useState({
    product_code: '',
    product_brand: '',
    item_category: '',
    subcategory_1: '',
    subcategory_2: '',
    item_rating: 4.0,
    listing_date: '01-01-2024',
    selling_price: 500,
  });

  const [predictionPreview, setPredictionPreview] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        product_code: productToEdit.product_code || '',
        product_brand: productToEdit.product_brand || '',
        item_category: productToEdit.item_category || '',
        subcategory_1: productToEdit.subcategory_1 || '',
        subcategory_2: productToEdit.subcategory_2 || '',
        item_rating: productToEdit.item_rating || 4.0,
        listing_date: productToEdit.listing_date || '01-01-2024',
        selling_price: productToEdit.selling_price || 500,
      });
    } else {
      setFormData({
        product_code: `P-${Math.floor(1000 + Math.random() * 9000)}`,
        product_brand: dropdownOptions?.brands?.[0] || 'B-659',
        item_category: dropdownOptions?.categories?.[0] || 'clothing',
        subcategory_1: dropdownOptions?.subcategories_1?.[0] || 'women s clothing',
        subcategory_2: dropdownOptions?.subcategories_2?.[0] || 'western wear',
        item_rating: 4.2,
        listing_date: '01-01-2024',
        selling_price: 750,
      });
    }
  }, [productToEdit, dropdownOptions, isOpen]);

  // Debounced real-time Random Forest prediction preview
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      if (formData.item_category && formData.product_brand && formData.selling_price > 0) {
        setIsPredicting(true);
        try {
          const res = await api.predictRealtime({
            product_code: formData.product_code,
            product_brand: formData.product_brand,
            item_category: formData.item_category,
            subcategory_1: formData.subcategory_1 || 'unknown',
            subcategory_2: formData.subcategory_2 || 'unknown',
            item_rating: parseFloat(formData.item_rating) || 3.0,
            listing_date: formData.listing_date,
            selling_price: parseFloat(formData.selling_price) || 0,
          });
          setPredictionPreview(res);
        } catch (err) {
          console.error("Preview failed", err);
        } finally {
          setIsPredicting(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        item_rating: parseFloat(formData.item_rating),
        selling_price: parseFloat(formData.selling_price),
      });
      onClose();
    } catch (err) {
      alert("Failed to save product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              {productToEdit ? 'Modify Product & Dynamic Price' : 'Add New Inventory SKU (Live RF Pipeline)'}
            </h3>
            <p className="text-xs text-slate-400">
              PostgreSQL CRUD with automated real-time price regression calculation.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Product Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Product Code / SKU</label>
              <input
                type="text"
                required
                value={formData.product_code}
                onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. P-4521"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Product Brand</label>
              <input
                type="text"
                required
                list="brands-list"
                value={formData.product_brand}
                onChange={(e) => setFormData({ ...formData, product_brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. B-3078"
              />
              <datalist id="brands-list">
                {dropdownOptions?.brands?.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
              <input
                type="text"
                required
                list="cat-list"
                value={formData.item_category}
                onChange={(e) => setFormData({ ...formData, item_category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. clothing"
              />
              <datalist id="cat-list">
                {dropdownOptions?.categories?.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Subcategory 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subcategory 1</label>
              <input
                type="text"
                list="sub1-list"
                value={formData.subcategory_1}
                onChange={(e) => setFormData({ ...formData, subcategory_1: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. women s clothing"
              />
              <datalist id="sub1-list">
                {dropdownOptions?.subcategories_1?.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Customer Rating: <span className="text-brand-400 font-bold">{formData.item_rating} ★</span>
              </label>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={formData.item_rating}
                onChange={(e) => setFormData({ ...formData, item_rating: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Actual Selling Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Base Selling Price ($)</label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="500"
              />
            </div>

          </div>

          {/* Real-time Random Forest Prediction Preview Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-brand-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Live Random Forest Dynamic Price Preview:
              </span>
              {isPredicting && (
                <span className="text-[11px] text-brand-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Ingesting features...
                </span>
              )}
            </div>

            {predictionPreview ? (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Predicted Optimal Price</div>
                  <div className="text-base font-bold text-emerald-400">${predictionPreview.predicted_price}</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Margin Gap / Uplift</div>
                  <div className={`text-base font-bold ${predictionPreview.margin_uplift >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {predictionPreview.margin_uplift >= 0 ? `+$${predictionPreview.margin_uplift}` : `-$${Math.abs(predictionPreview.margin_uplift)}`} 
                    <span className="text-xs font-normal text-slate-400"> ({predictionPreview.margin_uplift_pct}%)</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Pricing Status</div>
                  <div className="text-sm font-semibold text-brand-300">{predictionPreview.pricing_status}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Fill in product attributes to trigger real-time AI valuation.</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing to PostgreSQL...</span>
                </>
              ) : (
                <>
                  <span>{productToEdit ? 'Save Changes' : 'Create & Ingest SKU'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
