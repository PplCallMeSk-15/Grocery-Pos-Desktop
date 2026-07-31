import React, { useState } from 'react';
import { PurchaseOrder, Supplier, Product, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  FileCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Building2, 
  Printer, 
  ChevronRight,
  PackageCheck
} from 'lucide-react';

interface PurchaseOrderViewProps {
  settings: ShopSettings;
}

export const PurchaseOrderView: React.FC<PurchaseOrderViewProps> = ({ settings }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => sqliteDB.getPurchaseOrders());
  const suppliers = sqliteDB.getSuppliers();
  const products = sqliteDB.getProducts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPOForPrint, setSelectedPOForPrint] = useState<PurchaseOrder | null>(null);

  // Form state for creating PO
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ productId: string; productName: string; qty: number; purchasePrice: number }[]>([]);
  const [notes, setNotes] = useState('');

  const refreshPOs = () => {
    setPurchaseOrders(sqliteDB.getPurchaseOrders());
  };

  const handleAddItemToPO = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setPoItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: prod.id, productName: prod.name, qty: 1, purchasePrice: prod.purchasePrice }];
    });
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || poItems.length === 0) return;

    const supplier = suppliers.find(s => s.id === supplierId);
    const totalAmount = poItems.reduce((acc, item) => acc + (item.qty * item.purchasePrice), 0);

    sqliteDB.savePurchaseOrder({
      supplierId,
      supplierName: supplier?.companyName || supplier?.name || 'Distributor',
      status: 'Ordered',
      items: poItems,
      totalAmount,
      notes,
    });

    setShowCreateModal(false);
    setPoItems([]);
    setNotes('');
    refreshPOs();
  };

  const handleMarkReceived = (poId: string) => {
    sqliteDB.markPOAsReceived(poId);
    refreshPOs();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            Purchase Orders & Wholesale Restocking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create vendor purchase orders. When received, inventory stock quantities increase automatically!
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* PO List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">PO Details</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4 text-right">Total Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No purchase orders recorded yet. Create one to manage stock reordering.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                      {po.poNumber}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {po.orderDate}
                    </td>
                    <td className="py-3 px-4">
                      {po.items.length} product(s)
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {settings.currencySymbol}{po.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        po.status === 'Received' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        po.status === 'Ordered' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {po.status === 'Received' && <PackageCheck className="w-3 h-3" />}
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {po.status !== 'Received' && (
                          <button
                            onClick={() => handleMarkReceived(po.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Received</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPOForPrint(po)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                          title="Print PO Voucher"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">New Purchase Order Voucher</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Select Distributor / Supplier</label>
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.companyName} ({s.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Add Product to Order</label>
                <select
                  onChange={e => {
                    if (e.target.value) {
                      handleAddItemToPO(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Cur Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>

              {/* Added PO Items Table */}
              {poItems.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                      <tr>
                        <th className="p-2">Item Name</th>
                        <th className="p-2 text-center">Order Qty</th>
                        <th className="p-2 text-right">Cost ({settings.currencySymbol})</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {poItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={e => {
                                const newQty = Number(e.target.value);
                                setPoItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: newQty } : it));
                              }}
                              className="w-16 p-1 border rounded text-center"
                            />
                          </td>
                          <td className="p-2 text-right">{item.purchasePrice}</td>
                          <td className="p-2 text-right font-bold">{settings.currencySymbol}{item.qty * item.purchasePrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-sm">
                  Total Order Amount: {settings.currencySymbol}{poItems.reduce((acc, i) => acc + (i.qty * i.purchasePrice), 0).toLocaleString()}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={poItems.length === 0}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                  >
                    Issue Purchase Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable PO Voucher Modal */}
      {selectedPOForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">{settings.shopName}</h3>
                <p className="text-xs text-slate-500">Purchase Order Voucher #{selectedPOForPrint.poNumber}</p>
              </div>
              <button onClick={() => setSelectedPOForPrint(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p>Supplier: <span className="font-bold">{selectedPOForPrint.supplierName}</span></p>
              <p>Date: {selectedPOForPrint.orderDate}</p>
              <p>Status: <span className="font-bold text-emerald-600">{selectedPOForPrint.status}</span></p>
            </div>

            <div className="border rounded-xl p-3 text-xs space-y-2">
              <div className="font-bold border-b pb-1 flex justify-between">
                <span>Product Name</span>
                <span>Qty x Rate = Total</span>
              </div>
              {selectedPOForPrint.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.productName}</span>
                  <span>{it.qty} x {settings.currencySymbol}{it.purchasePrice} = {settings.currencySymbol}{it.qty * it.purchasePrice}</span>
                </div>
              ))}
              <div className="border-t pt-2 font-bold text-sm flex justify-between">
                <span>Total Amount</span>
                <span>{settings.currencySymbol}{selectedPOForPrint.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print PO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
