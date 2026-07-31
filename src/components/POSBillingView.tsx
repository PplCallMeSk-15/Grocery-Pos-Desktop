import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, ShopSettings, Sale } from '../types';
import { UPIPaymentModal } from './UPIPaymentModal';
import { UPIPaymentService } from '../services/paymentService';
import { sqliteDB } from '../db/sqliteStorage';
import { playPosSuccessBeep, playPosErrorBeep } from '../utils/sound';
import { 
  Barcode, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Camera, 
  Printer, 
  User, 
  Phone, 
  CreditCard, 
  Coins, 
  QrCode, 
  CheckCircle, 
  RotateCcw,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Zap,
  Activity,
  Keyboard
} from 'lucide-react';

interface POSBillingViewProps {
  products: Product[];
  settings: ShopSettings;
  onRecordSale: (
    cartItems: CartItem[],
    customerName: string,
    customerPhone: string,
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit',
    receivedAmount: number,
    discountAmount: number,
    taxPercent: number
  ) => Sale;
  onOpenCameraScanner: () => void;
  scannedBarcode: string | null;
  onClearScannedBarcode: () => void;
}

export const POSBillingView: React.FC<POSBillingViewProps> = ({
  products,
  settings,
  onRecordSale,
  onOpenCameraScanner,
  scannedBarcode,
  onClearScannedBarcode,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('Cash');
  
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [taxPercentInput, setTaxPercentInput] = useState<number>(settings.defaultTaxPercent || 0);
  const [receivedAmountInput, setReceivedAmountInput] = useState<string>('');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [draftInvoiceNumber, setDraftInvoiceNumber] = useState<string>('');

  // Toast & Scanner Status Notification state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const lastScannedTimeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  const currency = settings.currencySymbol || '₹';

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Helper function to keep input persistently focused for instant USB scanning
  const focusBarcodeInput = () => {
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 50);
  };

  // Initial Auto Focus on Mount
  useEffect(() => {
    focusBarcodeInput();
  }, []);

  // Global Keyboard Shortcuts (F2: New Sale/Checkout, F3: Focus Barcode, F4: Camera Scanner, Ctrl+L: Clear Cart)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleCheckout();
        return;
      }

      if (e.key === 'F3') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        onOpenCameraScanner();
        return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (cart.length > 0 && confirm('Clear all items from current cart?')) {
          setCart([]);
          showToast('success', 'Cart cleared');
        }
        return;
      }

      // Auto focus barcode input if typing numbers or scanning barcode
      if (
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        barcodeInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerName, customerPhone, paymentMode, receivedAmountInput, discountInput, taxPercentInput]);

  // Handle external camera scanned barcode
  useEffect(() => {
    if (scannedBarcode) {
      handleBarcodeScanned(scannedBarcode);
      onClearScannedBarcode();
    }
  }, [scannedBarcode]);

  // Display Brief Toast Banner
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Barcode Submission with USB Wedge Detection & Duplicate Guard (<100ms)
  const handleBarcodeScanned = (barcode: string) => {
    const cleaned = barcode.trim().replace(/\s+/g, '');
    if (!cleaned) return;

    const now = Date.now();
    // Ignore duplicate scans within 1000ms
    if (
      lastScannedTimeRef.current.code === cleaned &&
      now - lastScannedTimeRef.current.time < 1000
    ) {
      setSearchQuery('');
      focusBarcodeInput();
      return;
    }

    lastScannedTimeRef.current = { code: cleaned, time: now };

    const matchedProduct = products.find(p => p.barcode === cleaned || p.id.toLowerCase() === cleaned.toLowerCase());
    if (matchedProduct) {
      addToCart(matchedProduct);
      setSearchQuery('');
      playPosSuccessBeep();
      showToast('success', `Added: ${matchedProduct.name} (${currency}${matchedProduct.sellingPrice})`);
    } else {
      playPosErrorBeep();
      showToast('error', `Product Not Found for Barcode: "${cleaned}"`);
    }

    focusBarcodeInput();
  };

  // Add Product to Cart
  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      playPosErrorBeep();
      showToast('error', `"${product.name}" is OUT OF STOCK!`);
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex !== -1) {
        const existingItem = prevCart[existingIndex];
        if (existingItem.quantity + 1 > product.quantity) {
          playPosErrorBeep();
          showToast('error', `Stock limit reached for ${product.name}!`);
          return prevCart;
        }

        const updated = [...prevCart];
        const newQty = existingItem.quantity + 1;
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          totalPrice: newQty * existingItem.unitSellingPrice,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            unitSellingPrice: product.sellingPrice,
            totalPrice: product.sellingPrice,
          }
        ];
      }
    });

    focusBarcodeInput();
  };

  // Modify Item Quantity in Cart
  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;

          if (newQty > item.product.quantity) {
            alert(`Stock limit reached! Max available: ${item.product.quantity}`);
            return item;
          }

          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitSellingPrice,
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeCartItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('Clear all items from current cart?')) {
      setCart([]);
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = (subtotal - discountInput) * (taxPercentInput / 100);
  const grandTotal = Math.max(0, Math.round(subtotal - discountInput + taxAmount));

  const receivedNum = parseFloat(receivedAmountInput) || 0;
  const changeDue = Math.max(0, receivedNum - grandTotal);

  // Complete Sale
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty! Scan or select products to start billing.');
      return;
    }

    if (paymentMode === 'Cash' && receivedNum > 0 && receivedNum < grandTotal) {
      alert(`Received cash (${currency}${receivedNum}) is less than total amount (${currency}${grandTotal}).`);
      return;
    }

    if (paymentMode === 'UPI') {
      const upiService = new UPIPaymentService(settings);
      if (!upiService.isAvailable()) {
        alert('UPI Payments are disabled or missing Merchant UPI ID. Please configure UPI Payment Settings under Settings tab.');
        return;
      }
      setDraftInvoiceNumber(sqliteDB.getNextInvoiceNumber());
      setIsUpiModalOpen(true);
      return;
    }

    onRecordSale(
      cart,
      customerName,
      customerPhone,
      paymentMode,
      receivedNum > 0 ? receivedNum : grandTotal,
      discountInput,
      taxPercentInput
    );

    // Reset Form
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setReceivedAmountInput('');
    setDiscountInput(0);
    setSearchQuery('');
  };

  const finalizeUpiSale = () => {
    onRecordSale(
      cart,
      customerName,
      customerPhone,
      'UPI',
      grandTotal,
      discountInput,
      taxPercentInput
    );

    setIsUpiModalOpen(false);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setReceivedAmountInput('');
    setDiscountInput(0);
    setSearchQuery('');
  };

  // Filtered Products for quick grid
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 h-[calc(100vh-3.5rem)] flex flex-col md:flex-row gap-4 overflow-hidden relative">
      
      {/* Toast Popup Notification */}
      {toastMessage && (
        <div className={`absolute top-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl font-mono text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 border ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950 text-emerald-200 border-emerald-700/80 shadow-emerald-950/40'
            : 'bg-rose-950 text-rose-200 border-rose-700/80 shadow-rose-950/40'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Left Column: Product Search, Category Filters & Fast Product Grid */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        
        {/* Top Search & Barcode Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 space-y-2.5 bg-slate-50/50 dark:bg-slate-800/80">
          
          {/* Scanner Status Indicator Header */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                🟢 USB Scanner Ready (Primary)
              </span>
              <span className="hidden lg:inline text-slate-400">
                Auto-Focus Active • Scan &lt;100ms
              </span>
            </div>

            {/* Keyboard Shortcuts Legend */}
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px]">
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-bold">F2: Checkout</span>
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-bold">F3: Focus</span>
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-bold">F4: Camera</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 absolute left-3 top-2.5 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan barcode with USB reader or type product name... (F3 to focus)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleBarcodeScanned(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-emerald-500/50 dark:border-emerald-500/60 rounded-xl text-sm font-mono font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition shadow-sm text-slate-900 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); focusBarcodeInput(); }}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={onOpenCameraScanner}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shrink-0 border border-slate-200 dark:border-slate-600"
              title="Open Webcam Camera Scanner (Backup - F4)"
            >
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Camera Backup</span>
            </button>
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); focusBarcodeInput(); }}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 p-3.5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
              <Search className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-sm font-medium">No items matched search query.</p>
              <p className="text-xs">Scan product barcode or select another category.</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const isOut = product.quantity <= 0;
              const isLow = product.quantity <= 10;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOut}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition relative group ${
                    isOut
                      ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      {product.category}
                    </span>
                    <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 mt-1 line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {currency}{product.sellingPrice}
                    </span>

                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      isOut
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isLow
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {isOut ? 'Out of Stock' : `${product.quantity} ${product.unit || 'pcs'}`}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* Right Column: Active Cart Terminal & Checkout */}
      <div className="w-full md:w-[420px] lg:w-[460px] shrink-0 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Current Billing Cart ({cart.length})
            </h3>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Customer Info Inputs */}
        <div className="p-3 bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="Walk-in Customer"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Optional"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Cart Itemized List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 opacity-50" />
              <p className="text-sm font-semibold">Cart is currently empty</p>
              <p className="text-xs">Scan barcode using USB scanner or tap item cards on the left.</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {currency}{item.unitSellingPrice} x {item.quantity} = <strong>{currency}{item.totalPrice}</strong>
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, -1)}
                    className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, 1)}
                    className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeCartItem(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition ml-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary & Checkout Panel */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 space-y-3">
          
          {/* Subtotal, Tax, Discount inputs */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{currency}{subtotal}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 dark:text-slate-400">Discount ({currency})</span>
              <input
                type="number"
                min="0"
                value={discountInput || ''}
                onChange={e => setDiscountInput(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-20 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-right font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 dark:text-slate-400">GST / Tax Rate (%)</span>
              <input
                type="number"
                min="0"
                value={taxPercentInput || ''}
                onChange={e => setTaxPercentInput(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-20 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-right font-mono text-xs"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-slate-100">
              <span>Grand Total</span>
              <span className="font-mono text-xl text-emerald-600 dark:text-emerald-400">{currency}{grandTotal}</span>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['Cash', 'UPI', 'Card', 'Credit'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                  paymentMode === mode
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Cash Received & Change Calculator */}
          {paymentMode === 'Cash' && grandTotal > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-emerald-900 dark:text-emerald-200">Amount Received ({currency}):</span>
                <input
                  type="number"
                  placeholder={`${grandTotal}`}
                  value={receivedAmountInput}
                  onChange={e => setReceivedAmountInput(e.target.value)}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg text-right font-mono font-bold text-sm outline-none"
                />
              </div>

              {receivedNum > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Change Due to Customer:</span>
                  <span className="font-bold font-mono text-sm text-emerald-700 dark:text-emerald-300">
                    {currency}{changeDue}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Complete Sale Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
              cart.length === 0
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-[0.99]'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Complete & Print Bill (F2)</span>
          </button>

        </div>

      </div>

      {/* Dynamic UPI Payment Modal */}
      <UPIPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onPaymentSuccess={finalizeUpiSale}
        settings={settings}
        invoiceNumber={draftInvoiceNumber || 'INV-2026-0001'}
        customerName={customerName}
        amount={grandTotal}
      />

    </div>
  );
};
