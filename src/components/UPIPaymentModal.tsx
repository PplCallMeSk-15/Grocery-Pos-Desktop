import React, { useState, useEffect, useRef } from 'react';
import { ShopSettings } from '../types';
import { UPIPaymentService } from '../services/paymentService';
import { 
  QrCode, 
  CheckCircle, 
  Copy, 
  Printer, 
  X, 
  AlertCircle, 
  Clock, 
  Store, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Check, 
  Loader2,
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  settings: ShopSettings;
  invoiceNumber: string;
  customerName: string;
  amount: number;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  settings,
  invoiceNumber,
  customerName,
  amount,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [upiUri, setUpiUri] = useState<string>('');
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(true);
  const [qrError, setQrError] = useState<string | null>(null);

  // Success Overlay state
  const [isProcessingSuccess, setIsProcessingSuccess] = useState<boolean>(false);
  const [successStepIndex, setSuccessStepIndex] = useState<number>(0);

  // UI state
  const [copiedField, setCopiedField] = useState<'upi' | 'amount' | null>(null);
  const [isFullscreenQr, setIsFullscreenQr] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const currency = settings.currencySymbol || '₹';

  const upiService = new UPIPaymentService(settings);
  const isUpiAvailable = upiService.isAvailable();

  // Timer for invoice elapsed time
  useEffect(() => {
    let timer: any;
    if (isOpen && !isProcessingSuccess) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isProcessingSuccess]);

  // Generate QR Code dynamically when amount/settings/invoice changes
  useEffect(() => {
    if (!isOpen) return;

    if (!isUpiAvailable) {
      setQrError('UPI ID is missing or disabled in Settings. Please configure UPI Payment Settings.');
      setIsLoadingQr(false);
      return;
    }

    setQrError(null);
    setIsLoadingQr(true);

    const paymentRequest = {
      amount,
      invoiceNumber,
      customerName,
      note: settings.defaultPaymentNote || `Payment for Invoice ${invoiceNumber}`,
      currency: 'INR',
    };

    const uri = upiService.generateUPIString(paymentRequest);
    setUpiUri(uri);

    upiService.generateQRCodeDataUrl(paymentRequest)
      .then(url => {
        setQrDataUrl(url);
        setIsLoadingQr(false);
      })
      .catch(err => {
        setQrError('Error generating offline QR Code.');
        setIsLoadingQr(false);
      });
  }, [isOpen, amount, invoiceNumber, customerName, settings]);

  if (!isOpen) return null;

  // Handle Copy
  const handleCopy = (text: string, field: 'upi' | 'amount') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Payment Received click
  const handleConfirmPaymentReceived = () => {
    setIsProcessingSuccess(true);
    setSuccessStepIndex(0);

    // Step sequence animation
    setTimeout(() => setSuccessStepIndex(1), 500);  // Saving Invoice...
    setTimeout(() => setSuccessStepIndex(2), 1000); // Updating Inventory...
    setTimeout(() => setSuccessStepIndex(3), 1500); // Printing Receipt...
    setTimeout(() => {
      setIsProcessingSuccess(false);
      onPaymentSuccess();
    }, 2000);
  };

  // Format Elapsed Time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrintQrCode = () => {
    window.print();
  };

  const merchantNameDisplay = settings.merchantName || settings.shopName || 'ABC Grocery Store';
  const upiIdDisplay = settings.upiId || 'Not Configured';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* SUCCESS OVERLAY ANIMATION */}
      {isProcessingSuccess && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-lg flex flex-col items-center justify-center text-white p-6 space-y-6 text-center animate-in zoom-in duration-200">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ✓ Payment Successful
            </h2>
            <p className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              {currency}{amount.toLocaleString()} Received
            </p>
          </div>

          {/* Sequential Progress Indicators */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 max-w-sm w-full space-y-2.5 text-xs text-left">
            <div className={`flex items-center gap-2.5 ${successStepIndex >= 0 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
              {successStepIndex >= 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
              <span>Saving Invoice ({invoiceNumber})...</span>
            </div>
            <div className={`flex items-center gap-2.5 ${successStepIndex >= 1 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
              {successStepIndex >= 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className={`w-4 h-4 ${successStepIndex >= 1 ? 'animate-spin' : 'opacity-0'}`} />}
              <span>Updating Inventory & Stock...</span>
            </div>
            <div className={`flex items-center gap-2.5 ${successStepIndex >= 2 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
              {successStepIndex >= 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className={`w-4 h-4 ${successStepIndex >= 2 ? 'animate-spin' : 'opacity-0'}`} />}
              <span>Preparing Receipt Print...</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">Please Wait...</p>
        </div>
      )}

      {/* MAIN PAYMENT POPUP CARD */}
      <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full overflow-hidden transition-all duration-300 flex flex-col ${
        isFullscreenQr ? 'max-w-4xl h-[90vh]' : 'max-w-2xl'
      }`}>
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs">
              <QrCode className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Dynamic UPI Payment
                </span>
                <span className="text-xs text-emerald-200 font-mono font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                Scan & Pay via Any UPI App
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreenQr(!isFullscreenQr)}
              className="p-2 hover:bg-white/10 rounded-xl transition text-white"
              title={isFullscreenQr ? "Standard View" : "Fullscreen View"}
            >
              {isFullscreenQr ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition text-white"
              title="Close Popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Summary Ribbon */}
        <div className="bg-slate-50 dark:bg-slate-900/80 px-5 py-3 border-b border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Invoice No.
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {invoiceNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Customer
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {customerName || 'Walk-in Customer'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Merchant Name
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {merchantNameDisplay}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
              {currency}{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">
          
          {/* Missing UPI Settings Error Warning */}
          {!isUpiAvailable ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border-2 border-dashed border-rose-300 dark:border-rose-800 rounded-3xl text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-600 dark:text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                UPI Payment Not Configured
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                Please configure your shop's UPI ID in <strong>Settings &gt; UPI Payment Settings</strong> before accepting QR payments from customers.
              </p>
            </div>
          ) : (
            <div className={`grid ${isFullscreenQr ? 'grid-cols-1 md:grid-cols-2 gap-8 items-center' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
              
              {/* Left Column: QR Code Display Card */}
              <div className="flex flex-col items-center justify-center p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl relative group">
                
                {/* Optional Merchant Logo Header */}
                {settings.merchantLogo && (
                  <div className="mb-3">
                    <img 
                      src={settings.merchantLogo} 
                      alt="Merchant Logo" 
                      className="h-10 object-contain rounded-lg max-w-[160px] bg-white p-1"
                    />
                  </div>
                )}

                <div className="text-center mb-3">
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block">
                    {merchantNameDisplay}
                  </span>
                  <div className="text-xs text-slate-300 font-mono font-medium flex items-center justify-center gap-1.5 mt-0.5">
                    <span>{upiIdDisplay}</span>
                    <button
                      onClick={() => handleCopy(upiIdDisplay, 'upi')}
                      className="text-slate-400 hover:text-white transition p-1"
                      title="Copy UPI VPA ID"
                    >
                      {copiedField === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* QR Canvas Container */}
                <div className="p-4 bg-white rounded-2xl shadow-2xl relative border-4 border-emerald-500/30 flex items-center justify-center min-h-[220px] min-w-[220px]">
                  {isLoadingQr ? (
                    <div className="flex flex-col items-center justify-center p-8 space-y-2 text-slate-600">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                      <span className="text-xs font-semibold">Generating Offline QR...</span>
                    </div>
                  ) : qrError ? (
                    <div className="p-4 text-center text-rose-600 space-y-1 text-xs font-medium">
                      <AlertCircle className="w-6 h-6 mx-auto" />
                      <span>{qrError}</span>
                    </div>
                  ) : (
                    <img 
                      src={qrDataUrl} 
                      alt="Dynamic UPI Payment QR Code" 
                      className="w-56 h-56 object-contain rounded-lg"
                    />
                  )}
                </div>

                {/* Amount Badge below QR */}
                <div className="mt-4 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Exact Amount:</span>
                  <span className="text-base font-extrabold font-mono text-emerald-400">
                    {currency}{amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleCopy(amount.toString(), 'amount')}
                    className="text-slate-400 hover:text-white transition"
                    title="Copy Amount"
                  >
                    {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Supported Apps List */}
                <div className="mt-3 flex flex-wrap justify-center items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">Google Pay</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">PhonePe</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">Paytm</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">BHIM</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">Amazon Pay</span>
                </div>

              </div>

              {/* Right Column: Status & Payment Instructions */}
              <div className="space-y-4 flex flex-col justify-between">
                
                {/* Live Waiting Animation Status Box */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span>Waiting for Customer Payment...</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    Customer should open Google Pay, PhonePe, Paytm, or BHIM, scan the QR code above, and authorize payment of <strong>{currency}{amount}</strong>.
                  </p>
                </div>

                {/* Security & Validation Notice */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Direct Merchant Settlement (Zero Fee)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Funds transfer directly into merchant account ({upiIdDisplay}) without third-party commission gateways or cloud delay.
                  </p>
                </div>

                {/* Quick Copy Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopy(upiIdDisplay, 'upi')}
                    className="py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === 'upi' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>UPI Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy UPI VPA</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(amount.toString(), 'amount')}
                    className="py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === 'amount' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Amount Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Amount</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Payment Action Confirmation Button */}
                <button
                  onClick={handleConfirmPaymentReceived}
                  disabled={!isUpiAvailable}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition cursor-pointer ${
                    !isUpiAvailable 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-[0.99]'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Payment Received (Confirm & Save Invoice)</span>
                </button>

              </div>

            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintQrCode}
              disabled={!isUpiAvailable}
              className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print QR Slip</span>
            </button>

            <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
              Note: Amount is strictly locked to billing total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 rounded-xl font-bold transition cursor-pointer"
            >
              Cancel Payment
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
