# System Configuration Guide

Customize your store settings, invoice templates, UPI payment credentials, and hardware options.

## 🏪 Shop Profile & Invoice Settings

Navigate to **Shop Settings** in the left sidebar menu:

* **Shop Name**: Appears on bill headers and receipts.
* **Owner Name**: Used for system logs and store manager profile.
* **GSTIN Number**: Tax identification number displayed on tax invoices.
* **Shop Address & Contact**: Printed on thermal receipts.
* **Low Stock Limit Warning**: Minimum quantity trigger for stock alerts (default: `10` units).
* **Default Tax Rate (%)**: Default GST rate applied to items.

---

## 💳 Dynamic UPI Payment Configuration

To enable instant QR payment generation on cashier screens:

1. Go to **Shop Settings** -> **Dynamic UPI Payment Settings**.
2. Check **Enable Dynamic UPI Payments**.
3. Enter **Merchant UPI ID (VPA)** (e.g. `yourshop@okaxis` or `9876500000@ybl`).
4. Enter **Receipt Footer Note** (e.g. *Thank you for shopping at Example Supermarket*).
5. Click **Save UPI Settings**.

---

## 🔌 Hardware Setup (USB Barcode Reader)

1. Plug any standard USB Barcode Scanner into your PC.
2. Ensure the barcode reader operates in **HID Keyboard Wedge Mode** (default factory setting for 99% of scanners).
3. Open the **POS Billing Terminal** (`F2` or click POS Billing).
4. Point and scan any product barcode. The scanner will automatically input the barcode and add the item to the bill instantly.
