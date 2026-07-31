import QRCode from 'qrcode';
import { ShopSettings } from '../types';

export interface UPIPaymentConfig {
  enableUpiPayments: boolean;
  merchantName: string;
  upiId: string;
  defaultPaymentNote?: string;
  currency?: string;
  receiptFooter?: string;
  merchantLogo?: string;
}

export interface PaymentRequest {
  amount: number;
  invoiceNumber: string;
  customerName?: string;
  note?: string;
  currency?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  generateUPIString(request: PaymentRequest): string;
  generateQRCodeDataUrl(request: PaymentRequest): Promise<string>;
}

export class UPIPaymentService implements PaymentProvider {
  public id = 'dynamic-upi-offline';
  public name = 'Dynamic UPI (Offline NPCI Specification)';
  private settings: ShopSettings;

  constructor(settings: ShopSettings) {
    this.settings = settings;
  }

  public updateSettings(settings: ShopSettings): void {
    this.settings = settings;
  }

  /**
   * Check if UPI payments are configured and enabled
   */
  public isAvailable(): boolean {
    const isEnabled = this.settings.enableUpiPayments !== false;
    const hasUpiId = Boolean(this.settings.upiId && this.settings.upiId.trim().length > 3 && this.settings.upiId.includes('@'));
    return isEnabled && hasUpiId;
  }

  /**
   * Validate UPI ID format (standard VPA format: username@bank)
   */
  public static validateUPIId(upiId: string): { valid: boolean; error?: string } {
    if (!upiId || !upiId.trim()) {
      return { valid: false, error: 'UPI ID cannot be empty.' };
    }
    const trimmed = upiId.trim();
    if (!trimmed.includes('@')) {
      return { valid: false, error: 'UPI ID must contain "@" (e.g., shopname@okaxis).' };
    }
    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { valid: false, error: 'Invalid UPI VPA format. Example: name@bank' };
    }
    return { valid: true };
  }

  /**
   * Build standard NPCI compliant UPI payment URI string
   * Format: upi://pay?pa={UPI_ID}&pn={NAME}&am={AMOUNT}&cu=INR&tn={NOTE}
   */
  public generateUPIString(request: PaymentRequest): string {
    const upiId = (this.settings.upiId || '').trim();
    const merchantName = (this.settings.merchantName || this.settings.shopName || 'Grocery Store').trim();
    const currency = request.currency || 'INR';
    const amountStr = request.amount.toFixed(2);
    
    const rawNote = request.note || this.settings.defaultPaymentNote || `Invoice ${request.invoiceNumber}`;
    const cleanNote = rawNote.replace(/[^\w\s-]/gi, '').substring(0, 50);

    const params = new URLSearchParams();
    params.set('pa', upiId);
    params.set('pn', merchantName);
    params.set('am', amountStr);
    params.set('cu', currency);
    params.set('tn', cleanNote);

    return `upi://pay?${params.toString()}`;
  }

  /**
   * Generate high-quality offline Data URL QR code
   */
  public async generateQRCodeDataUrl(request: PaymentRequest): Promise<string> {
    const upiUri = this.generateUPIString(request);
    try {
      const dataUrl = await QRCode.toDataURL(upiUri, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 360,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return dataUrl;
    } catch (err) {
      console.error('Offline QR Code generation error:', err);
      throw new Error('Failed to render offline QR Code');
    }
  }
}

/**
 * Factory for Payment Services (Future-ready architecture for PhonePe, Razorpay, Cashfree, BharatPe)
 */
export class PaymentServiceFactory {
  public static getUPIProvider(settings: ShopSettings): UPIPaymentService {
    return new UPIPaymentService(settings);
  }
}
