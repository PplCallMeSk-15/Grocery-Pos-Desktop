# Changelog

All notable changes to the **Grocery POS & Inventory System** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-31

### Added
- **100% Offline POS Billing Engine**: Fast barcode scanner integration (USB wedge + Webcam scanner backup) with sub-100ms item lookup and instant cart calculations.
- **Dynamic UPI QR Payment Generator**: Generates instant standard UPI QR codes with custom merchant VPA and amount without third-party commission gateways.
- **SQLite Local Database**: Embedded browser storage engine using IndexedDB/LocalStorage for full offline durability and zero network dependency.
- **AI-Powered Inventory Intelligence**: Powered by Google Gemini API for smart stock reordering predictions, waste reduction insights, and supplier procurement recommendations.
- **Comprehensive Grocery Modules**:
  - Customer Accounts & Ledger Management
  - Supplier Directory & Automated Purchase Orders
  - Expense Management & Daily P&L Cash Flow Reports
  - Employee Attendance & Security PIN Access Control
  - Custom Thermal Receipt & Barcode Label Designer
  - Data Backup, Restore & Recycle Bin Recovery
- **Electron Desktop Packaging**: Built-in configuration to build standalone Windows `.exe` installers via `electron-builder`.
