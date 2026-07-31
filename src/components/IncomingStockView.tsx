import React, { useState, useEffect, useRef } from 'react';
import { Product, ShopSettings, IncomingStockLog } from '../types';
import { 
  PackagePlus, 
  Barcode, 
  Camera, 
  Search, 
  Check, 
  Plus, 
  History, 
  ArrowRight, 
  AlertCircle,
  Truck,
  Sparkles
} from 'lucide-react';

interface IncomingStockViewProps {
  products: Product[];
  settings: ShopSettings;
  onAddExistingStock: (
    productId: string, 
    qtyToAdd: number, 
    newPurchasePrice?: number, 
    newSellingPrice?: number, 
    supplierName?: string
  ) => void;
  onSaveNewProduct: (productData: Partial<Product> & { name: string; barcode: string; purchasePrice: number; sellingPrice: number; quantity: number }) => void;
  stockLogs: IncomingStockLog[];
  onOpenCameraScanner: () => void;
  scannedBarcode: string | null;
  onClearScannedBarcode: () => void;
}

export const IncomingStockView: React.FC<IncomingStockViewProps> = ({
  products,
  settings,
  onAddExistingStock,
  onSaveNewProduct,
  stockLogs,
  onOpenCameraScanner,
  scannedBarcode,
  onClearScannedBarcode,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Form state for existing product update
  const [addQty, setAddQty] = useState<string>('10');
  const [newPurchasePrice, setNewPurchasePrice] = useState<string>('');
  const [newSellingPrice, setNewSellingPrice] = useState<string>('');
  const [supplierNameInput, setSupplierNameInput] = useState<string>('');

  // Form state for brand new product creation
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Grains & Atta');
  const [newProdQty, setNewProdQty] = useState('20');
  const [newProdPurchasePrice, setNewProdPurchasePrice] = useState('100');
  const [newProdSellingPrice, setNewProdSellingPrice] = useState('125');
  const [newProdSupplier, setNewProdSupplier] = useState('');

  const barcodeRef = useRef<HTMLInputElement | null>(null);
  const currency = settings.currencySymbol || '₹';

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scannedBarcode) {
      setBarcodeInput(scannedBarcode);
      lookupBarcode(scannedBarcode);
      onClearScannedBarcode();
    }
  }, [scannedBarcode]);

  const lookupBarcode = (codeToLookup: string) => {
    const code = codeToLookup.trim();
    if (!code) return;

    const found = products.find(p => p.barcode === code || p.id.toLowerCase() === code.toLowerCase());
    setHasSearched(true);
    if (found) {
      setScannedProduct(found);
      setNewPurchasePrice(found.purchasePrice.toString());
      setNewSellingPrice(found.sellingPrice.toString());
      setSupplierNameInput(found.supplierName || '');
    } else {
      setScannedProduct(null);
    }
  };

  const handleUpdateStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedProduct) return;

    const qty = parseInt(addQty);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid stock quantity to add.');
      return;
    }

    onAddExistingStock(
      scannedProduct.id,
      qty,
      newPurchasePrice ? parseFloat(newPurchasePrice) : undefined,
      newSellingPrice ? parseFloat(newSellingPrice) : undefined,
      supplierNameInput
    );

    alert(`Successfully added ${qty} units to "${scannedProduct.name}"!`);

    // Reset lookup form
    setScannedProduct(null);
    setHasSearched(false);
    setBarcodeInput('');
    setAddQty('10');
  };

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPurchasePrice || !newProdSellingPrice || !newProdQty) {
      alert('Please fill in all required product fields.');
      return;
    }

    onSaveNewProduct({
      name: newProdName,
      category: newProdCategory,
      barcode: barcodeInput.trim(),
      purchasePrice: parseFloat(newProdPurchasePrice),
      sellingPrice: parseFloat(newProdSellingPrice),
      quantity: parseInt(newProdQty),
      supplierName: newProdSupplier,
    });

    alert(`Successfully registered & added stock for "${newProdName}"!`);

    // Reset form
    setScannedProduct(null);
    setHasSearched(false);
    setBarcodeInput('');
    setNewProdName('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Incoming Stock Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scan supplier packages to quickly increase stock levels or add new arrivals to inventory.
          </p>
        </div>

        <button
          onClick={onOpenCameraScanner}
          className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-xl font-semibold text-xs flex items-center gap-2 transition"
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Open Camera Scanner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step 1 & 2: Barcode Lookup Section (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Step 1: Scan or Type Product Barcode
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  ref={barcodeRef}
                  type="text"
                  placeholder="Scan USB barcode or enter barcode digits..."
                  value={barcodeInput}
                  onChange={e => {
                    setBarcodeInput(e.target.value);
                    setHasSearched(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      lookupBarcode(barcodeInput);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => lookupBarcode(barcodeInput)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shrink-0"
              >
                Search Item
              </button>
            </div>
          </div>

          {/* Result Case A: Product EXISTS in Inventory */}
          {hasSearched && scannedProduct && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-emerald-200/80 dark:border-emerald-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                    Product Found in Local DB
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {scannedProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Barcode: {scannedProduct.barcode} | Category: {scannedProduct.category}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Current Stock</div>
                  <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                    {scannedProduct.quantity} {scannedProduct.unit || 'pcs'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Add Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={addQty}
                      onChange={e => setAddQty(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fortune Wholesalers"
                      value={supplierNameInput}
                      onChange={e => setSupplierNameInput(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Purchase Cost ({currency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPurchasePrice}
                      onChange={e => setNewPurchasePrice(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Selling Price ({currency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newSellingPrice}
                      onChange={e => setNewSellingPrice(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Confirm & Update Stock (+{addQty} Units)
                </button>
              </form>
            </div>
          )}

          {/* Result Case B: Product DOES NOT EXIST -> Show New Item Form */}
          {hasSearched && !scannedProduct && barcodeInput && (
            <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Product Not Found in Local Database</h4>
                  <p className="text-xs opacity-90">Barcode: <strong className="font-mono">{barcodeInput}</strong> is new. Enter details below to add to inventory.</p>
                </div>
              </div>

              <form onSubmit={handleAddNewProductSubmit} className="space-y-3 pt-2 border-t border-amber-200 dark:border-amber-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Britannia Good Day Biscuits 100g"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdQty}
                      onChange={e => setNewProdQty(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Purchase Cost ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProdPurchasePrice}
                      onChange={e => setNewProdPurchasePrice(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Selling Price ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProdSellingPrice}
                      onChange={e => setNewProdSellingPrice(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition text-xs"
                >
                  Save New Item to Local SQLite Database
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Incoming Stock History Logs (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Stock Addition Audit History
              </h3>
            </div>

            {stockLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
                <Truck className="w-10 h-10 mx-auto stroke-1" />
                <p className="text-sm font-medium">No stock logs recorded yet.</p>
                <p className="text-xs">Incoming stock entries from suppliers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {stockLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span className="truncate max-w-[200px]">{log.productName}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        +{log.quantityAdded} units
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Stock: {log.previousQuantity} &rarr; <strong>{log.newQuantity}</strong></span>
                      <span>Supplier: {log.supplierName || 'General'}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 text-right pt-0.5">
                      {new Date(log.dateTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
