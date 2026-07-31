import React, { useState } from 'react';
import { Product, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  Barcode, 
  Printer, 
  Settings2, 
  Check, 
  X, 
  Sliders 
} from 'lucide-react';

interface LabelDesignerModalProps {
  settings: ShopSettings;
  onClose: () => void;
}

export const LabelDesignerModal: React.FC<LabelDesignerModalProps> = ({ settings, onClose }) => {
  const products = sqliteDB.getProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  
  // Customization options
  const [stickerWidth, setStickerWidth] = useState<number>(50); // mm
  const [stickerHeight, setStickerHeight] = useState<number>(30); // mm
  const [showShopName, setShowShopName] = useState(true);
  const [showSellingPrice, setShowSellingPrice] = useState(true);
  const [showMRP, setShowMRP] = useState(true);
  const [showShelfLocation, setShowShelfLocation] = useState(true);
  const [showExpiry, setShowExpiry] = useState(false);
  const [copies, setCopies] = useState<number>(10);

  const product = products.find(p => p.id === selectedProductId) || products[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
            <Barcode className="w-5 h-5 text-emerald-600" />
            Barcode Sticker & Shelf Label Studio Designer
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Options Panel */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Select Product</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none font-bold"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({settings.currencySymbol}{p.sellingPrice})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sticker Width (mm)</label>
                <input
                  type="number"
                  value={stickerWidth}
                  onChange={e => setStickerWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sticker Height (mm)</label>
                <input
                  type="number"
                  value={stickerHeight}
                  onChange={e => setStickerHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-700 dark:text-slate-300">Fields to Include on Sticker:</p>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showShopName} onChange={e => setShowShopName(e.target.checked)} className="rounded text-emerald-600" />
                <span>Show Shop Name ({settings.shopName})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showSellingPrice} onChange={e => setShowSellingPrice(e.target.checked)} className="rounded text-emerald-600" />
                <span>Show Selling Price ({settings.currencySymbol}{product?.sellingPrice})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showShelfLocation} onChange={e => setShowShelfLocation(e.target.checked)} className="rounded text-emerald-600" />
                <span>Show Shelf Location ({product?.shelfLocation || 'A-1'})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showExpiry} onChange={e => setShowExpiry(e.target.checked)} className="rounded text-emerald-600" />
                <span>Show Expiry Date ({product?.expiryDate || 'N/A'})</span>
              </label>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Labels to Print</label>
              <input
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={e => setCopies(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>
          </div>

          {/* Live Sticker Preview Box */}
          <div className="bg-slate-100 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Sticker Print Preview</p>

            {/* Sticker Mock */}
            <div 
              style={{ width: `${stickerWidth * 4}px`, minHeight: `${stickerHeight * 4}px` }} 
              className="bg-white border-2 border-slate-900 text-slate-900 p-3 rounded-lg flex flex-col items-center justify-between text-center shadow-lg select-none space-y-1"
            >
              {showShopName && <div className="text-[10px] font-bold uppercase border-b w-full pb-0.5">{settings.shopName}</div>}
              <div className="font-bold text-[11px] leading-tight line-clamp-2">{product?.name}</div>
              
              {/* Simulated Barcode Lines */}
              <div className="my-1 flex items-center justify-center gap-0.5">
                {[2,1,3,1,2,4,1,2,1,3,2,1,2,3,1,2,1,3,2].map((w, i) => (
                  <div key={i} style={{ width: `${w}px` }} className="h-7 bg-black" />
                ))}
              </div>
              <div className="font-mono text-[9px] font-bold tracking-widest">{product?.barcode}</div>

              <div className="flex items-center justify-between w-full pt-1 border-t text-[10px] font-bold">
                {showSellingPrice && <span>Price: {settings.currencySymbol}{product?.sellingPrice}</span>}
                {showShelfLocation && <span className="text-[9px] text-slate-600">Loc: {product?.shelfLocation || 'Shelf'}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-md text-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print {copies} Labels</span>
          </button>
        </div>
      </div>
    </div>
  );
};
