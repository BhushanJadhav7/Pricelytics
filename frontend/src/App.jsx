import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ExecutiveOverview from './components/ExecutiveOverview';
import ProductCatalog from './components/ProductCatalog';
import WhatIfSimulator from './components/WhatIfSimulator';
import BatchIngestion from './components/BatchIngestion';
import ModelHealth from './components/ModelHealth';
import ProductModal from './components/ProductModal';
import { api, WS_BASE_URL } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard Metrics & Catalog State
  const [kpis, setKpis] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState(null);
  
  // Product Catalog State
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 25, total: 0, total_pages: 1 });
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 25,
    search: '',
    category: null,
    brand: null,
    pricing_status: null,
    sort_by: 'id',
    sort_order: 'desc'
  });

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // WebSocket Live Stream State
  const [isLive, setIsLive] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  // Load Executive Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const [kpiRes, catRes, scatRes, dropRes] = await Promise.all([
        api.getOverviewKPIs(),
        api.getCategoryBreakdown(8),
        api.getPriceScatter(250),
        api.getDropdownOptions(),
      ]);
      setKpis(kpiRes);
      setCategoryData(catRes);
      setScatterData(scatRes);
      setDropdownOptions(dropRes);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Load Product Catalog Data Grid
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await api.getProducts(filters);
      setProducts(res.items);
      setPagination({
        page: res.page,
        page_size: res.page_size,
        total: res.total,
        total_pages: res.total_pages
      });
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [filters]);

  // Initial Load
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // WebSocket Real-time Live Stream Connection
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(WS_BASE_URL);

        ws.onopen = () => {
          setIsLive(true);
          console.log("[WebSocket] Connected to live pipeline feed.");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event && data.event !== 'PONG') {
              setLastEvent(data);
              // Auto-refresh analytics and products upon live server updates
              loadAnalytics();
              loadProducts();
              
              // Clear event toast after 4s
              setTimeout(() => setLastEvent(null), 4000);
            }
          } catch (e) {
            console.error("WebSocket message parse error", e);
          }
        };

        ws.onclose = () => {
          setIsLive(false);
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIsLive(false);
          ws.close();
        };
      } catch (err) {
        setIsLive(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    // Heartbeat ping
    const pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 15000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [loadAnalytics, loadProducts]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadAnalytics(), loadProducts()]);
    setIsRefreshing(false);
  };

  // CRUD Handlers
  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    if (productToEdit) {
      await api.updateProduct(productToEdit.id, productData);
    } else {
      await api.createProduct(productData);
    }
    await handleRefreshAll();
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
      await handleRefreshAll();
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* Top Enterprise Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLive={isLive}
        lastEvent={lastEvent}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            kpis={kpis}
            categoryData={categoryData}
            scatterData={scatterData}
            loading={loadingOverview}
          />
        )}

        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            pagination={pagination}
            loading={loadingProducts}
            onPageChange={(p) => setFilters({ ...filters, page: p })}
            filters={filters}
            setFilters={setFilters}
            dropdownOptions={dropdownOptions}
            onOpenCreate={handleOpenCreate}
            onOpenEdit={handleOpenEdit}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'simulator' && (
          <WhatIfSimulator dropdownOptions={dropdownOptions} />
        )}

        {activeTab === 'ingestion' && (
          <BatchIngestion onUploadSuccess={handleRefreshAll} />
        )}

        {activeTab === 'model' && (
          <ModelHealth kpis={kpis} onRetrainSuccess={handleRefreshAll} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          <strong>Pricelytics Enterprise</strong> &bull; Production PostgreSQL Pipeline &amp; Random Forest ML Engine
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>FastAPI v1.0.0</span>
          <span>&bull;</span>
          <span>Scikit-Learn Random Forest</span>
          <span>&bull;</span>
          <span>React + Tailwind</span>
        </div>
      </footer>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        dropdownOptions={dropdownOptions}
      />

    </div>
  );
}
