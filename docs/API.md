# API Documentation

The **Grocery POS & Inventory System** operates on an offline-first architecture using a client-side SQLite storage engine layer (`src/db/sqliteStorage.ts`). Below is the internal API method specification for interacting with local data models.

## 💾 Storage Engine (`sqliteDB`)

### 1. Products API

#### `getProducts(): Product[]`
Returns all active inventory items.

#### `addProduct(product: Omit<Product, 'id'>): Product`
Creates a new product record with generated ID and timestamp.

#### `updateProduct(id: string, updates: Partial<Product>): void`
Updates existing product details (price, stock quantity, min stock level).

#### `deleteProduct(id: string): void`
Moves product to the local Recycle Bin.

---

### 2. POS Sales & Billing API

#### `saveSaleTransaction(sale: SaleTransaction): void`
Persists a completed billing invoice, updates stock levels, updates customer ledger balance if credit, and logs audit entries.

#### `getSalesHistory(): SaleTransaction[]`
Returns historic invoices sorted chronologically.

---

### 3. Dynamic UPI Payment Service (`UPIPaymentService`)

#### `generateUPIString(request: { amount: number; transactionNote?: string }): string`
Generates standard UPI deep-link URI:
```
upi://pay?pa=YOUR_VPA&pn=SHOP_NAME&am=AMOUNT&cu=INR&tn=NOTE
```

#### `generateQRCodeDataURL(request: { amount: number; transactionNote?: string }): Promise<string>`
Returns a Base64 PNG QR Code data URL for immediate rendering on cashier screens or customer displays.
