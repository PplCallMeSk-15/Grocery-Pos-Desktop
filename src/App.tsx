/**
 * Main Application Shell for Offline Grocery Shop Management Software (Desktop POS)
 */

import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  ShopSettings, 
  Product, 
  Sale, 
  IncomingStockLog, 
  CartItem,
  DashboardMetrics 
} from './types';
import { sqliteDB } from './db/sqliteStorage';

// Components
import { NavbarHeader } from './components/NavbarHeader';
import { Sidebar } from './components/Sidebar';
import { FirstTimeSetupModal } from './components/FirstTimeSetupModal';
import { DashboardView } from './components/DashboardView';
import { POSBillingView } from './components/POSBillingView';
import { ProductManagementView } from './components/ProductManagementView';
import { IncomingStockView } from './components/IncomingStockView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ReportsView } from './components/ReportsView';
import { BarcodeGeneratorView } from './components/BarcodeGeneratorView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { InvoiceModal } from './components/InvoiceModal';
import { CameraScannerModal } from './components/CameraScannerModal';

// Enterprise Commercial Modules
import { CustomerManagementView } from './components/CustomerManagementView';
import { SupplierManagementView } from './components/SupplierManagementView';
import { PurchaseOrderView } from './components/PurchaseOrderView';
import { ExpenseManagementView } from './components/ExpenseManagementView';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { AttendanceView } from './components/AttendanceView';
import { InventoryIntelligenceView } from './components/InventoryIntelligenceView';
import { ReturnsExchangesView } from './components/ReturnsExchangesView';
import { AuditLogsView } from './components/AuditLogsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PinLockModal } from './components/PinLockModal';
import { LabelDesignerModal } from './components/LabelDesignerModal';

// Modules 28-50 Advanced Enterprise Views
import { CashRegisterView } from './components/CashRegisterView';
import { SmartReorderView } from './components/SmartReorderView';
import { BranchManagementView } from './components/BranchManagementView';
import { RecycleBinView } from './components/RecycleBinView';
import { HealthMonitorView } from './components/HealthMonitorView';
import { PriceHistoryView } from './components/PriceHistoryView';
import { UpiSettingsSection } from './components/UpiSettingsSection';

import { Store, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<ShopSettings>(() => sqliteDB.getSettings());
  const [products, setProducts] = useState<Product[]>(() => sqliteDB.getProducts());
  const [sales, setSales] = useState<Sale[]>(() => sqliteDB.getSales());
  const [stockLogs, setStockLogs] = useState<IncomingStockLog[]>(() => sqliteDB.getStockLogs());
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Sale | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [productForBarcodeLabel, setProductForBarcodeLabel] = useState<Product | null>(null);

  // Enterprise Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [isLabelDesignerOpen, setIsLabelDesignerOpen] = useState(false);
  const [settingsResetModal, setSettingsResetModal] = useState<'clear' | 'sample' | null>(null);
  const [settingsToast, setSettingsToast] = useState<string | null>(null);

  // Keyboard Shortcuts (Ctrl+K for Search, F2 for POS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enforce light theme always, independent of OS settings
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Refresh local memory state from SQLite storage
  const refreshAllState = () => {
    setSettings(sqliteDB.getSettings());
    setProducts(sqliteDB.getProducts());
    setSales(sqliteDB.getSales());
    setStockLogs(sqliteDB.getStockLogs());
  };

  // --- Handlers ---
  const handleUpdateSettings = (newSettings: Partial<ShopSettings>) => {
    const updated = sqliteDB.saveSettings(newSettings);
    setSettings(updated);
  };

  const handleSaveProduct = (productData: Partial<Product> & { name: string; barcode: string; purchasePrice: number; sellingPrice: number; quantity: number }) => {
    sqliteDB.saveProduct(productData);
    refreshAllState();
  };

  const handleDeleteProduct = (id: string) => {
    sqliteDB.deleteProduct(id);
    refreshAllState();
  };

  const handleAddExistingStock = (
    productId: string, 
    qtyToAdd: number, 
    newPurchasePrice?: number, 
    newSellingPrice?: number, 
    supplierName?: string
  ) => {
    sqliteDB.addStock(productId, qtyToAdd, newPurchasePrice, newSellingPrice, supplierName);
    refreshAllState();
  };

  const handleRecordSale = (
    cartItems: CartItem[],
    customerName: string,
    customerPhone: string,
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit',
    receivedAmount: number,
    discountAmount: number,
    taxPercent: number
  ): Sale => {
    const sale = sqliteDB.recordSale(
      cartItems,
      customerName,
      customerPhone,
      paymentMode,
      receivedAmount,
      discountAmount,
      taxPercent
    );

    refreshAllState();

    // Automatically trigger Invoice Print Modal
    setSelectedInvoiceForModal(sale);
    setIsInvoiceModalOpen(true);

    return sale;
  };

  const handleCancelSale = (saleId: string) => {
    sqliteDB.cancelSale(saleId);
    refreshAllState();
  };

  const handleExportBackup = () => {
    try {
      const backupJsonStr = sqliteDB.exportBackupJSON();
      const blob = new Blob([backupJsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `grocery_pos_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 500);
    } catch (err) {
      console.error('Backup export failed:', err);
    }
  };

  const handleImportBackup = (jsonContent: string): boolean => {
    const ok = sqliteDB.importBackupJSON(jsonContent);
    if (ok) {
      refreshAllState();
    }
    return ok;
  };

  const handleResetToSampleData = () => {
    sqliteDB.resetToSampleData();
    refreshAllState();
  };

  const handleClearAllDataForFreshStart = (customSettings?: Partial<ShopSettings>) => {
    sqliteDB.clearAllDataForFreshStart(customSettings);
    refreshAllState();
  };

  const handleViewInvoice = (sale: Sale) => {
    setSelectedInvoiceForModal(sale);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenBarcodeGeneratorForProduct = (product: Product) => {
    setProductForBarcodeLabel(product);
    setActiveTab('barcodes');
  };

  const metrics: DashboardMetrics = sqliteDB.getMetrics();
  const lowStockProducts = products.filter(p => p.quantity <= (p.minStockLevel || settings.lowStockThreshold));

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* Top Application Navbar Titlebar */}
      <NavbarHeader
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onNavigate={setActiveTab}
        activeTab={activeTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLockTerminal={() => setIsTerminalLocked(true)}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          lowStockCount={metrics.lowStockCount}
        />

        {/* Main Content Workspace View */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              recentSales={sales}
              lowStockProducts={lowStockProducts}
              settings={settings}
              onNavigate={setActiveTab}
              onViewInvoice={handleViewInvoice}
              onQuickAddProduct={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'pos' && (
            <POSBillingView
              products={products}
              settings={settings}
              onRecordSale={handleRecordSale}
              onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
              scannedBarcode={scannedBarcode}
              onClearScannedBarcode={() => setScannedBarcode(null)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagementView
              settings={settings}
              onSelectCustomerForPOS={(cust) => {
                setActiveTab('pos');
              }}
            />
          )}

          {activeTab === 'cash_register' && (
            <CashRegisterView />
          )}

          {activeTab === 'smart_reorder' && (
            <SmartReorderView />
          )}

          {activeTab === 'branches' && (
            <BranchManagementView />
          )}

          {activeTab === 'recycle_bin' && (
            <RecycleBinView />
          )}

          {activeTab === 'health_monitor' && (
            <HealthMonitorView />
          )}

          {activeTab === 'price_history' && (
            <PriceHistoryView />
          )}

          {activeTab === 'suppliers' && (
            <SupplierManagementView
              settings={settings}
            />
          )}

          {activeTab === 'purchase_orders' && (
            <PurchaseOrderView
              settings={settings}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManagementView
              settings={settings}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeManagementView
              settings={settings}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              settings={settings}
            />
          )}

          {activeTab === 'inventory_intel' && (
            <InventoryIntelligenceView
              settings={settings}
            />
          )}

          {activeTab === 'returns' && (
            <ReturnsExchangesView
              settings={settings}
              onViewInvoice={handleViewInvoice}
              onReturnProcessed={refreshAllState}
            />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogsView
              settings={settings}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagementView
              products={products}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenBarcodeGenerator={handleOpenBarcodeGeneratorForProduct}
            />
          )}

          {activeTab === 'stock_in' && (
            <IncomingStockView
              products={products}
              settings={settings}
              onAddExistingStock={handleAddExistingStock}
              onSaveNewProduct={handleSaveProduct}
              stockLogs={stockLogs}
              onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
              scannedBarcode={scannedBarcode}
              onClearScannedBarcode={() => setScannedBarcode(null)}
            />
          )}

          {activeTab === 'sales_history' && (
            <SalesHistoryView
              sales={sales}
              settings={settings}
              onViewInvoice={handleViewInvoice}
              onCancelSale={handleCancelSale}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              sales={sales}
              products={products}
              settings={settings}
            />
          )}

          {activeTab === 'barcodes' && (
            <BarcodeGeneratorView
              products={products}
              selectedProductForLabel={productForBarcodeLabel}
              settings={settings}
            />
          )}

          {activeTab === 'backup' && (
            <BackupRestoreView
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetToSampleData={handleResetToSampleData}
              onClearAllData={handleClearAllDataForFreshStart}
            />
          )}

          {activeTab === 'settings' && (
            <div className="p-6 max-w-3xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">
                  Shop Profile & Invoice Settings
                </h2>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Shop Name</label>
                    <input
                      type="text"
                      value={settings.shopName}
                      onChange={e => handleUpdateSettings({ shopName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={settings.ownerName}
                      onChange={e => handleUpdateSettings({ ownerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={e => handleUpdateSettings({ phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={settings.gstNumber || ''}
                      onChange={e => handleUpdateSettings({ gstNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Shop Address</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={e => handleUpdateSettings({ address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Low Stock Limit Warning</label>
                    <input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={e => handleUpdateSettings({ lowStockThreshold: parseInt(e.target.value) || 10 })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Default Tax / GST (%)</label>
                    <input
                      type="number"
                      value={settings.defaultTaxPercent}
                      onChange={e => handleUpdateSettings({ defaultTaxPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Settings automatically saved into local SQLite database.</span>
                </div>
              </div>

              {/* Dynamic UPI Payment Settings Card */}
              <UpiSettingsSection
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />

              {/* Fresh Start Store Deployment Card */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  Store Data Reset & Fresh Start
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  If you are deploying this software for a brand new shop owner, click below to wipe all demo sample data (products, sales history, demo customers) so they can start entering real inventory from scratch.
                </p>

                {settingsToast && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
                    {settingsToast}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettingsResetModal('clear')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Wipe Demo Data & Start Fresh
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsResetModal('sample')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Load Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Reset Confirmation Modal */}
          {settingsResetModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl animate-fadeIn">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {settingsResetModal === 'clear' ? 'Wipe All Demo Data & Start Fresh?' : 'Reload Sample Grocery Dataset?'}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {settingsResetModal === 'clear'
                    ? 'Are you sure you want to wipe all demo sample data? All sample products, sales history, customers, and expenses will be cleared so you can enter your real store data from scratch.'
                    : 'Are you sure you want to reload the initial sample grocery dataset (Atta, Sunflower Oil, Tata Salt, etc.)?'}
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSettingsResetModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (settingsResetModal === 'clear') {
                        handleClearAllDataForFreshStart();
                        setSettingsToast('All demo data wiped! You now have a 100% clean slate to enter real store data.');
                      } else {
                        handleResetToSampleData();
                        setSettingsToast('Sample grocery dataset loaded into local database.');
                      }
                      setSettingsResetModal(null);
                      setTimeout(() => setSettingsToast(null), 4000);
                    }}
                    className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer ${
                      settingsResetModal === 'clear' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    {settingsResetModal === 'clear' ? 'Yes, Wipe & Start Fresh' : 'Yes, Load Demo Data'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearchModal
          settings={settings}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Terminal PIN Lock Screen */}
      {isTerminalLocked && (
        <PinLockModal
          onUnlock={() => setIsTerminalLocked(false)}
        />
      )}

      {/* First Time Setup Wizard Modal */}
      <FirstTimeSetupModal
        isOpen={!settings.isSetupCompleted}
        onSave={handleUpdateSettings}
        onClearAllData={handleClearAllDataForFreshStart}
        initialSettings={settings}
      />

      {/* Invoice Modal for Thermal / A4 Print */}
      <InvoiceModal
        sale={selectedInvoiceForModal}
        settings={settings}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      {/* Webcam Camera Barcode Reader Modal */}
      <CameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={(barcode) => {
          setScannedBarcode(barcode);
        }}
      />

    </div>
  );
}
