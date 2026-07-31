import React, { useState, useRef } from 'react';
import { Sale, ShopSettings } from '../types';
import { Printer, Download, X, CheckCircle, FileText, ShoppingBag, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface InvoiceModalProps {
  sale: Sale | null;
  settings: ShopSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  sale,
  settings,
  isOpen,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>(settings.receiptType || 'thermal');
  const [printError, setPrintError] = useState<string | null>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const currency = settings.currencySymbol || '₹';

  // Native window printing trigger with full debugging, ref check, and fallback
  const handlePrint = () => {
    setPrintError(null);
    console.log('[InvoicePrint] Step 1: Print Receipt button clicked.');

    // 1. Verify invoice data exists
    if (!sale) {
      const msg = 'Print Error: Invoice sale data is missing or null.';
      console.error('[InvoicePrint]', msg);
      setPrintError(msg);
      return;
    }

    console.log('[InvoicePrint] Step 2: Sale data verified.', {
      invoiceNumber: sale.invoiceNumber,
      itemsCount: sale.items?.length,
      totalAmount: sale.totalAmount,
      customer: sale.customerName,
    });

    // 2. Verify invoice reference (ref) and DOM rendering
    const elem = printableAreaRef.current || document.querySelector('.printable-area');
    if (!elem) {
      const msg = 'Print Error: Invoice DOM element reference (ref) is missing or not rendered.';
      console.error('[InvoicePrint]', msg);
      setPrintError(msg);
      return;
    }

    console.log('[InvoicePrint] Step 3: Printable DOM element reference verified.', elem);

    // 3. Ensure HTML content exists
    if (!elem.innerHTML || elem.innerHTML.trim().length === 0) {
      const msg = 'Print Error: Invoice rendered HTML content is empty.';
      console.error('[InvoicePrint]', msg);
      setPrintError(msg);
      return;
    }

    console.log('[InvoicePrint] Step 4: Initiating window.print()...');

    try {
      window.focus();
      window.print();
      console.log('[InvoicePrint] Step 5: window.print() invoked successfully.');
    } catch (primaryErr: any) {
      console.warn('[InvoicePrint] Standard window.print() failed, attempting iframe popup print fallback:', primaryErr);

      try {
        let printFrame = document.getElementById('invoice-print-frame') as HTMLIFrameElement;
        if (!printFrame) {
          printFrame = document.createElement('iframe');
          printFrame.id = 'invoice-print-frame';
          printFrame.style.position = 'fixed';
          printFrame.style.right = '0';
          printFrame.style.bottom = '0';
          printFrame.style.width = '0';
          printFrame.style.height = '0';
          printFrame.style.border = '0';
          document.body.appendChild(printFrame);
        }

        const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
        if (frameDoc) {
          frameDoc.open();
          frameDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Invoice - ${sale.invoiceNumber}</title>
                <style>
                  body { font-family: monospace, sans-serif; margin: 15px; color: #000; background: #fff; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { padding: 4px; text-align: left; }
                  .text-right { text-align: right; }
                  .text-center { text-align: center; }
                  .font-bold { font-weight: bold; }
                  .no-print { display: none !important; }
                </style>
              </head>
              <body>
                ${elem.innerHTML}
              </body>
            </html>
          `);
          frameDoc.close();

          setTimeout(() => {
            try {
              printFrame.contentWindow?.focus();
              printFrame.contentWindow?.print();
              console.log('[InvoicePrint] Step 5: Fallback iframe print triggered successfully.');
            } catch (fallbackErr: any) {
              console.error('[InvoicePrint] Fallback print failed:', fallbackErr);
              setPrintError(`Print operation blocked by browser sandbox: ${fallbackErr?.message || 'Unknown error'}`);
            }
          }, 300);
        } else {
          throw new Error('Unable to write to fallback print document frame.');
        }
      } catch (err: any) {
        console.error('[InvoicePrint] All print execution paths failed:', err);
        setPrintError(`Printing failed: ${err?.message || 'Browser prevented print execution.'}`);
      }
    }
  };

  // PDF Download using jsPDF with error handling and console logging
  const handleDownloadPDF = () => {
    setPrintError(null);
    console.log('[InvoicePDF] Step 1: Save PDF button clicked.');

    if (!sale) {
      const msg = 'PDF Error: Sale data is missing.';
      console.error('[InvoicePDF]', msg);
      setPrintError(msg);
      return;
    }

    console.log('[InvoicePDF] Step 2: Building PDF for invoice:', sale.invoiceNumber);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: printFormat === 'thermal' ? [80, 220] : 'a4',
      });

    const font = 'helvetica';
    let y = 10;

    if (printFormat === 'thermal') {
      doc.setFont(font, 'bold');
      doc.setFontSize(12);
      doc.text(settings.shopName, 40, y, { align: 'center' });
      y += 5;

      doc.setFont(font, 'normal');
      doc.setFontSize(8);
      if (settings.address) {
        const addrLines = doc.splitTextToSize(settings.address, 70);
        doc.text(addrLines, 40, y, { align: 'center' });
        y += addrLines.length * 3.5;
      }
      if (settings.phone) {
        doc.text(`Ph: ${settings.phone}`, 40, y, { align: 'center' });
        y += 4;
      }
      if (settings.gstNumber) {
        doc.text(`GSTIN: ${settings.gstNumber}`, 40, y, { align: 'center' });
        y += 4;
      }

      doc.line(5, y, 75, y);
      y += 5;

      doc.setFont(font, 'bold');
      doc.text(`Invoice: ${sale.invoiceNumber}`, 5, y);
      doc.setFont(font, 'normal');
      doc.text(new Date(sale.dateTime).toLocaleString(), 75, y, { align: 'right' });
      y += 4;

      if (sale.customerName) {
        doc.text(`Customer: ${sale.customerName} (${sale.customerPhone || 'N/A'})`, 5, y);
        y += 4;
      }

      doc.line(5, y, 75, y);
      y += 4;

      // Table Header
      doc.setFont(font, 'bold');
      doc.text('Item', 5, y);
      doc.text('Qty x Rate', 45, y);
      doc.text('Amt', 75, y, { align: 'right' });
      y += 4;

      doc.setFont(font, 'normal');
      sale.items.forEach(item => {
        const nameText = item.productName.length > 20 ? item.productName.substring(0, 18) + '..' : item.productName;
        doc.text(nameText, 5, y);
        doc.text(`${item.quantity} x ${currency}${item.unitSellingPrice}`, 45, y);
        doc.text(`${currency}${item.totalPrice}`, 75, y, { align: 'right' });
        y += 4;
      });

      doc.line(5, y, 75, y);
      y += 4;

      doc.text(`Subtotal:`, 45, y);
      doc.text(`${currency}${sale.subtotal}`, 75, y, { align: 'right' });
      y += 4;

      if (sale.discountAmount > 0) {
        doc.text(`Discount:`, 45, y);
        doc.text(`-${currency}${sale.discountAmount}`, 75, y, { align: 'right' });
        y += 4;
      }

      if (sale.taxAmount > 0) {
        doc.text(`Tax (${sale.taxPercent}%):`, 45, y);
        doc.text(`${currency}${sale.taxAmount.toFixed(2)}`, 75, y, { align: 'right' });
        y += 4;
      }

      doc.setFont(font, 'bold');
      doc.setFontSize(10);
      doc.text(`TOTAL:`, 45, y);
      doc.text(`${currency}${sale.totalAmount}`, 75, y, { align: 'right' });
      y += 5;

      doc.setFontSize(8);
      doc.setFont(font, 'normal');
      doc.text(`Paid via ${sale.paymentMode}`, 5, y);
      if (sale.paymentMode === 'Cash' && sale.receivedAmount) {
        doc.text(`Received: ${currency}${sale.receivedAmount} | Change: ${currency}${sale.changeAmount}`, 75, y, { align: 'right' });
      }
      y += 6;

      doc.text('Thank you! Visit again.', 40, y, { align: 'center' });
    } else {
      // A4 Format
      doc.setFont(font, 'bold');
      doc.setFontSize(20);
      doc.text(settings.shopName, 15, y);
      y += 7;

      doc.setFontSize(9);
      doc.setFont(font, 'normal');
      if (settings.address) doc.text(settings.address, 15, y), y += 4;
      if (settings.phone) doc.text(`Phone: ${settings.phone}`, 15, y), y += 4;
      if (settings.gstNumber) doc.text(`GSTIN: ${settings.gstNumber}`, 15, y), y += 4;

      doc.setFont(font, 'bold');
      doc.setFontSize(16);
      doc.text('TAX INVOICE', 195, 15, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont(font, 'normal');
      doc.text(`Invoice No: ${sale.invoiceNumber}`, 195, 22, { align: 'right' });
      doc.text(`Date: ${new Date(sale.dateTime).toLocaleString()}`, 195, 27, { align: 'right' });

      y += 5;
      doc.line(15, y, 195, y);
      y += 8;

      if (sale.customerName) {
        doc.setFont(font, 'bold');
        doc.text('Customer Details:', 15, y);
        y += 4;
        doc.setFont(font, 'normal');
        doc.text(`Name: ${sale.customerName}`, 15, y);
        if (sale.customerPhone) doc.text(`Phone: ${sale.customerPhone}`, 100, y);
        y += 8;
      }

      // Table Header
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, 180, 8, 'F');
      doc.setFont(font, 'bold');
      doc.text('#', 18, y + 5.5);
      doc.text('Product Name', 30, y + 5.5);
      doc.text('Barcode', 100, y + 5.5);
      doc.text('Unit Price', 130, y + 5.5);
      doc.text('Qty', 160, y + 5.5);
      doc.text('Total', 190, y + 5.5, { align: 'right' });
      y += 10;

      doc.setFont(font, 'normal');
      sale.items.forEach((item, idx) => {
        doc.text(`${idx + 1}`, 18, y);
        doc.text(item.productName.substring(0, 35), 30, y);
        doc.text(item.barcode, 100, y);
        doc.text(`${currency}${item.unitSellingPrice}`, 130, y);
        doc.text(`${item.quantity}`, 160, y);
        doc.text(`${currency}${item.totalPrice}`, 190, y, { align: 'right' });
        y += 6;
      });

      y += 4;
      doc.line(15, y, 195, y);
      y += 8;

      doc.text(`Subtotal:`, 140, y);
      doc.text(`${currency}${sale.subtotal}`, 190, y, { align: 'right' });
      y += 5;

      if (sale.discountAmount > 0) {
        doc.text(`Discount:`, 140, y);
        doc.text(`-${currency}${sale.discountAmount}`, 190, y, { align: 'right' });
        y += 5;
      }

      if (sale.taxAmount > 0) {
        doc.text(`Tax (${sale.taxPercent}%):`, 140, y);
        doc.text(`${currency}${sale.taxAmount.toFixed(2)}`, 190, y, { align: 'right' });
        y += 5;
      }

      doc.setFont(font, 'bold');
      doc.setFontSize(12);
      doc.text(`Grand Total:`, 140, y);
      doc.text(`${currency}${sale.totalAmount}`, 190, y, { align: 'right' });
      y += 10;

      doc.setFontSize(9);
      doc.setFont(font, 'normal');
      doc.text(`Payment Method: ${sale.paymentMode}`, 15, y);
      if (sale.paymentMode === 'Cash' && sale.receivedAmount) {
        doc.text(`Amount Paid: ${currency}${sale.receivedAmount} | Change Returned: ${currency}${sale.changeAmount}`, 15, y + 4);
      }

      doc.text('Authorized Signatory / Stamp', 195, y + 15, { align: 'right' });
    }

    doc.save(`${sale.invoiceNumber}.pdf`);
    console.log('[InvoicePDF] Step 3: PDF generated and saved successfully:', `${sale.invoiceNumber}.pdf`);
  } catch (pdfErr: any) {
    console.error('[InvoicePDF] PDF generation error:', pdfErr);
    setPrintError(`PDF Generation Failed: ${pdfErr?.message || 'An error occurred while building the PDF file.'}`);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        
        {/* Modal Top Toolbar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                Invoice {sale.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transaction Completed • {new Date(sale.dateTime).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Receipt format toggle */}
            <div className="bg-slate-200 dark:bg-slate-700 p-0.5 rounded-xl flex text-xs font-medium">
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  printFormat === 'thermal'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  printFormat === 'a4'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                A4 Standard
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-50 dark:bg-slate-900/50">
          <div
            ref={printableAreaRef}
            className={`printable-area mx-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 ${
              printFormat === 'thermal' ? 'max-w-[340px] text-xs font-mono' : 'max-w-xl text-sm font-sans'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-600">
              <div className="flex justify-center items-center gap-2 mb-1">
                <ShoppingBag className="w-5 h-5 text-emerald-600 no-print" />
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {settings.shopName}
                </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{settings.address}</p>
              {settings.phone && <p className="text-slate-500 dark:text-slate-400 text-xs">Phone: {settings.phone}</p>}
              {settings.gstNumber && <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">GSTIN: {settings.gstNumber}</p>}
            </div>

            {/* Bill Meta */}
            <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-600 flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
              <div>
                <p><span className="font-semibold text-slate-800 dark:text-slate-200">Invoice:</span> {sale.invoiceNumber}</p>
                {sale.customerName && (
                  <p><span className="font-semibold text-slate-800 dark:text-slate-200">Customer:</span> {sale.customerName} ({sale.customerPhone || 'N/A'})</p>
                )}
              </div>
              <div className="text-right">
                <p>{new Date(sale.dateTime).toLocaleDateString()}</p>
                <p>{new Date(sale.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-600">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                    <th className="pb-1 font-semibold">Item</th>
                    <th className="pb-1 text-center font-semibold">Qty</th>
                    <th className="pb-1 text-right font-semibold">Price</th>
                    <th className="pb-1 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {sale.items.map((item, i) => (
                    <tr key={i} className="text-xs">
                      <td className="py-1.5 pr-1 font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                        {item.productName}
                      </td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">{currency}{item.unitSellingPrice}</td>
                      <td className="py-1.5 text-right font-semibold">{currency}{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Totals */}
            <div className="py-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency}{sale.subtotal}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-{currency}{sale.discountAmount}</span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST / Tax ({sale.taxPercent}%)</span>
                  <span>{currency}{sale.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount</span>
                <span>{currency}{sale.totalAmount}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-xs flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Mode: <strong>{sale.paymentMode}</strong></span>
              {sale.paymentMode === 'Cash' && sale.receivedAmount > 0 && (
                <span>Recv: {currency}{sale.receivedAmount} | Change: <strong>{currency}{sale.changeAmount}</strong></span>
              )}
              {sale.paymentMode === 'UPI' && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  ✓ PAID via Dynamic UPI
                </span>
              )}
            </div>

            {sale.paymentMode === 'UPI' && (
              <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] space-y-0.5 text-emerald-900 dark:text-emerald-200">
                <div className="flex justify-between font-semibold">
                  <span>Merchant: {settings.merchantName || settings.shopName}</span>
                  <span>Status: PAID</span>
                </div>
                {settings.upiId && <div className="font-mono">VPA: {settings.upiId}</div>}
                <div className="italic text-[9px] text-emerald-700 dark:text-emerald-400">
                  {settings.upiReceiptFooter || 'QR Payment Completed via Dynamic UPI'}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <p>*** Thank You For Shopping With Us! ***</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Powered by Offline POS System</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="no-print p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Invoice automatically stored in local SQLite database.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-medium text-sm flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              Save PDF
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
          </div>
        </div>

      </div>

      {/* Printing / PDF Failure Error Dialog */}
      {printError && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-rose-300 dark:border-rose-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <h4 className="text-base font-bold">Print Operation Notice</h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {printError}
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-xl text-[11px] text-slate-500 font-mono leading-normal">
              Tip: You can use the "Save PDF" button to save or print the receipt file directly.
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPrintError(null)}
                className="px-4 py-2 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-700 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
