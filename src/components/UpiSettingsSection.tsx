import React, { useState, useEffect } from 'react';
import { ShopSettings } from '../types';
import { UPIPaymentService } from '../services/paymentService';
import { 
  QrCode, 
  CheckCircle, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Building, 
  Smartphone, 
  FileText, 
  Check, 
  Image, 
  Info,
  DollarSign
} from 'lucide-react';

interface UpiSettingsSectionProps {
  settings: ShopSettings;
  onUpdateSettings: (newSettings: Partial<ShopSettings>) => void;
}

export const UpiSettingsSection: React.FC<UpiSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState({
    enableUpiPayments: settings.enableUpiPayments !== false,
    merchantName: settings.merchantName || settings.shopName || '',
    upiId: settings.upiId || '',
    defaultPaymentNote: settings.defaultPaymentNote || 'Thank you for shopping at Green Grocery!',
    upiReceiptFooter: settings.upiReceiptFooter || 'QR Payment Completed via Dynamic UPI',
    merchantLogo: settings.merchantLogo || '',
  });

  const [testAmount, setTestAmount] = useState<number>(100);
  const [testQrDataUrl, setTestQrDataUrl] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedSuccessToast, setSavedSuccessToast] = useState<boolean>(false);

  // Sync state when props update
  useEffect(() => {
    setFormData({
      enableUpiPayments: settings.enableUpiPayments !== false,
      merchantName: settings.merchantName || settings.shopName || '',
      upiId: settings.upiId || '',
      defaultPaymentNote: settings.defaultPaymentNote || 'Thank you for shopping at Green Grocery!',
      upiReceiptFooter: settings.upiReceiptFooter || 'QR Payment Completed via Dynamic UPI',
      merchantLogo: settings.merchantLogo || '',
    });
  }, [settings]);

  // Generate live interactive test QR code for preview
  useEffect(() => {
    const upiValidation = UPIPaymentService.validateUPIId(formData.upiId);
    if (!upiValidation.valid) {
      setValidationError(upiValidation.error || 'Invalid UPI ID format');
      setTestQrDataUrl('');
      return;
    }

    setValidationError(null);

    const tempSettings: ShopSettings = {
      ...settings,
      ...formData,
    };

    const upiService = new UPIPaymentService(tempSettings);
    upiService.generateQRCodeDataUrl({
      amount: testAmount || 1,
      invoiceNumber: 'TEST-0001',
      note: formData.defaultPaymentNote,
      currency: 'INR',
    })
      .then(url => setTestQrDataUrl(url))
      .catch(err => console.error('Test QR code error', err));

  }, [formData, testAmount, settings]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.enableUpiPayments) {
      const upiValidation = UPIPaymentService.validateUPIId(formData.upiId);
      if (!upiValidation.valid) {
        setValidationError(upiValidation.error || 'Invalid UPI ID');
        return;
      }
    }

    onUpdateSettings(formData);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Dynamic UPI Payment Module Settings</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure offline NPCI-compliant UPI merchant profile, VPA address, and receipt footers.
          </p>
        </div>

        {/* Enable / Disable Toggle */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer bg-slate-100 dark:bg-slate-700/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
          <input
            type="checkbox"
            checked={formData.enableUpiPayments}
            onChange={e => handleChange('enableUpiPayments', e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {formData.enableUpiPayments ? 'UPI Enabled' : 'UPI Disabled'}
          </span>
        </label>
      </div>

      {savedSuccessToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>UPI Settings successfully updated in local database.</span>
        </div>
      )}

      {/* Main Settings & Interactive Test QR Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Form Fields */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Merchant Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Merchant / Shop Name
              </label>
              <input
                type="text"
                placeholder="e.g. Green Grocery & Supermarket"
                value={formData.merchantName}
                onChange={e => handleChange('merchantName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-medium outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Appears on customer's UPI app screen</p>
            </div>

            {/* UPI ID (VPA) */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Merchant UPI ID (VPA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. merchant@upi, shopname@paytm"
                value={formData.upiId}
                onChange={e => handleChange('upiId', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono font-semibold outline-none focus:border-emerald-500 ${
                  validationError ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {validationError ? (
                <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationError}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">Standard VPA e.g. name@bank, phone@paytm</p>
              )}
            </div>

            {/* Default Payment Note */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Note Template
              </label>
              <input
                type="text"
                placeholder="e.g. Thank you for shopping at Green Grocery!"
                value={formData.defaultPaymentNote}
                onChange={e => handleChange('defaultPaymentNote', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-medium outline-none"
              />
            </div>

            {/* Receipt Footer Message */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Footer Text
              </label>
              <input
                type="text"
                placeholder="e.g. QR Payment Completed via Dynamic UPI"
                value={formData.upiReceiptFooter}
                onChange={e => handleChange('upiReceiptFooter', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-medium outline-none"
              />
            </div>

            {/* Merchant Logo URL */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Merchant Logo (Optional image URL or base64)
              </label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={formData.merchantLogo}
                onChange={e => handleChange('merchantLogo', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-medium outline-none"
              />
            </div>

          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save UPI Settings</span>
            </button>
          </div>

        </form>

        {/* Right Column: Live Interactive QR Preview */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-between text-center space-y-4">
          
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Live QR Preview & Scanner Test
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] rounded font-mono">
                Offline Test
              </span>
            </div>

            {/* Test Amount Input */}
            <div className="mb-3 text-left">
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Simulate Test Invoice Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                value={testAmount || ''}
                onChange={e => setTestAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold text-sm outline-none"
              />
            </div>

            {/* QR Render Area */}
            <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-emerald-500/30 inline-block my-1">
              {testQrDataUrl ? (
                <img 
                  src={testQrDataUrl} 
                  alt="Live Test UPI QR Code" 
                  className="w-40 h-40 object-contain mx-auto"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs font-medium p-2">
                  Enter valid UPI VPA ID to generate QR preview
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-300 font-mono mt-2">
              Amount: <strong className="text-emerald-400 font-extrabold">₹{testAmount}</strong>
            </div>

            <div className="text-[10px] text-slate-400 mt-2 leading-tight">
              Scan this QR with Google Pay or PhonePe on your smartphone to test merchant VPA validation.
            </div>
          </div>

          <div className="w-full p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400 flex items-center gap-2 text-left">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Works 100% offline without internet or server gateways!</span>
          </div>

        </div>

      </div>

    </div>
  );
};
