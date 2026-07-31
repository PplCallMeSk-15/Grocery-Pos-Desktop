/**
 * Types for Offline Grocery Shop Management Software (Enterprise POS)
 */

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  address: string;
  phone: string;
  gstNumber?: string;
  invoicePrefix: string;
  currencySymbol: string;
  defaultTaxPercent: number; // e.g. 0, 5, 12, 18
  lowStockThreshold: number; // e.g. 10
  receiptType: 'thermal' | 'a4';
  receiptSize?: '58mm' | '80mm' | 'a4';
  receiptTemplate?: 'thermal' | 'a4' | 'compact' | 'modern' | 'minimal';
  footerMessage?: string;
  returnPolicyText?: string;
  qrCodeText?: string;
  decimalPrecision?: number; // 2, 3
  dateFormat?: string; // YYYY-MM-DD, DD/MM/YYYY
  timeFormat?: '12h' | '24h';
  language?: string;
  selectedPrinter?: string;
  enableCameraScanner: boolean;
  theme: 'light' | 'dark';
  isSetupCompleted: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  lastBackupDate?: string;
  requireManagerPinForDiscount?: boolean;
  discountThresholdPercent?: number;
  enableLoyalty?: boolean;
  loyaltyPointRatio?: number; // 1 point per X currency spent
  activeBranchId?: string;
  pinnedProductIds?: string[];
  pinnedReportIds?: string[];

  // UPI Payment Settings
  enableUpiPayments?: boolean;
  merchantName?: string;
  upiId?: string;
  defaultPaymentNote?: string;
  upiReceiptFooter?: string;
  merchantLogo?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isPrimary?: boolean;
}

export interface ProductBatch {
  id: string;
  batchNumber: string;
  mfgDate?: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice?: number;
  supplierBatchRef?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "1kg", "5kg", "500ml", "1L"
  barcode: string;
  sellingPrice: number;
  purchasePrice: number;
  quantity: number;
}

export interface ComboItem {
  productId: string;
  productName: string;
  qty: number;
}

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  parentCategoryId?: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  distributorPrice?: number;
  vipPrice?: number;
  quantity: number;
  supplierName: string;
  expiryDate?: string; // YYYY-MM-DD
  mfgDate?: string;
  batchNumber?: string;
  batches?: ProductBatch[];
  unit?: string; // kg, g, l, ml, pcs, packet, box, bag, sack
  minStockLevel?: number;
  maxStockLevel?: number;
  shelfLocation?: string; // e.g. "Rack A - Row 2"
  imageUrl?: string;
  isCombo?: boolean;
  comboItems?: ComboItem[];
  variants?: ProductVariant[];
  branchId?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  unitSellingPrice: number;
  totalPrice: number;
  selectedVariant?: ProductVariant;
  selectedBatchId?: string;
  batchNumber?: string;
  selectedUnit?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  unitPurchasePrice: number;
  unitSellingPrice: number;
  quantity: number;
  totalPrice: number;
  variantName?: string;
  batchNumber?: string;
  unit?: string;
}

export interface SplitPayment {
  mode: 'Cash' | 'UPI' | 'Card' | 'Wallet' | 'Gift Voucher' | 'Store Credit';
  amount: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  dateTime: string; // ISO string
  branchId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  taxPercent: number;
  discountAmount: number;
  discountType?: 'flat' | 'percent' | 'loyalty' | 'coupon' | 'wholesale';
  totalAmount: number;
  receivedAmount: number;
  changeAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit' | 'Split';
  splitPayments?: SplitPayment[];
  totalProfit: number;
  status: 'Completed' | 'Cancelled' | 'Refunded' | 'Partially Refunded';
  notes?: string;
  cashierName?: string;
  merchantUpiId?: string;
  paymentNote?: string;
  paymentStatus?: 'Paid' | 'Pending';
}

export interface HeldBill {
  id: string;
  customerName: string;
  customerPhone: string;
  cartItems: CartItem[];
  timestamp: string;
  note?: string;
  cashierName?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'SaleCredit' | 'PaymentReceived' | 'Adjustment';
  referenceNo: string;
  debit: number;
  credit: number;
  balance: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  birthday?: string;
  notes?: string;
  totalSpent: number;
  loyaltyPoints: number;
  storeCredit: number;
  outstandingDues: number;
  creditLimit?: number;
  dueDate?: string;
  tag: 'VIP' | 'Regular' | 'Wholesale' | 'Distributor';
  branchId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  paymentTerms?: string;
  outstandingBalance: number;
  leadTimeDays?: number;
  createdAt: string;
}

export interface POItem {
  productId: string;
  productName: string;
  qty: number;
  purchasePrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  receivedDate?: string;
  status: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
  items: POItem[];
  totalAmount: number;
  notes?: string;
  branchId?: string;
}

export type ExpenseCategory = 
  | 'Rent' 
  | 'Electricity' 
  | 'Salary' 
  | 'Internet' 
  | 'Transport' 
  | 'Miscellaneous';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMode: 'Cash' | 'UPI' | 'Bank' | 'Card';
  notes?: string;
  branchId?: string;
  createdAt: string;
}

export type EmployeeRole = 'Owner' | 'Cashier' | 'Inventory Staff' | 'Accountant' | 'Manager';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  address: string;
  salary: number;
  joiningDate: string;
  role: EmployeeRole;
  pin: string; // 4-digit security PIN
  photoUrl?: string;
  status: 'Active' | 'Inactive';
  branchId?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM AM/PM
  checkOutTime?: string;
  workingHours?: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
}

export interface SaleReturn {
  id: string;
  returnInvoiceNumber: string;
  originalInvoiceNumber: string;
  saleId: string;
  date: string;
  customerName: string;
  refundAmount: number;
  reason: 'Defective' | 'Expired' | 'Wrong Item' | 'Customer Changed Mind';
  items: {
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface IncomingStockLog {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantityAdded: number;
  previousQuantity: number;
  newQuantity: number;
  purchasePrice: number;
  supplierName: string;
  dateTime: string;
}

export interface CashRegisterShift {
  id: string;
  cashierName: string;
  startTime: string; // ISO
  endTime?: string;  // ISO
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  cashDifference?: number;
  cashInTotal: number;
  cashOutTotal: number;
  safeDepositTotal: number;
  status: 'Open' | 'Closed';
  notes?: string;
}

export interface CashTransaction {
  id: string;
  shiftId: string;
  timestamp: string;
  type: 'CashIn' | 'CashOut' | 'SafeDeposit';
  amount: number;
  reason: string;
  cashierName: string;
}

export interface PriceHistoryRecord {
  id: string;
  productId: string;
  productName: string;
  oldPurchasePrice: number;
  newPurchasePrice: number;
  oldSellingPrice: number;
  newSellingPrice: number;
  dateChanged: string;
  changedBy: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
}

export interface RecycleBinItem {
  id: string;
  type: 'Product' | 'Customer' | 'Supplier' | 'Sale' | 'Expense';
  originalId: string;
  title: string;
  data: any;
  deletedAt: string;
  deletedBy: string;
}

export interface UpdatePackage {
  version: string;
  releaseDate: string;
  releaseNotes: string[];
  isApplied: boolean;
}

export type TabType = 
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'stock_in'
  | 'customers'
  | 'suppliers'
  | 'purchase_orders'
  | 'expenses'
  | 'employees'
  | 'attendance'
  | 'cash_register'
  | 'calendar'
  | 'reorder_engine'
  | 'smart_reorder'
  | 'price_history'
  | 'branches'
  | 'sales_history'
  | 'returns'
  | 'inventory_intel'
  | 'reports'
  | 'barcodes'
  | 'label_designer'
  | 'backup'
  | 'audit_logs'
  | 'recycle_bin'
  | 'health_monitor'
  | 'updates'
  | 'settings';

export interface DashboardMetrics {
  todaySalesAmount: number;
  todaySalesCount: number;
  todayProfit: number;
  todayExpenses: number;
  netProfitToday: number;
  totalProductsCount: number;
  totalAvailableStock: number;
  lowStockCount: number;
  expiringCount: number;
  totalProfitAllTime: number;
  totalCustomerDues: number;
  heldBillsCount: number;
}

