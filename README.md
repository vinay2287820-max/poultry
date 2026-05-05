
# 🐔 Poultry Feed Management Software

## 📌 Overview
This system is a complete digital solution for managing poultry feed orders, payments, production, and delivery logistics. It includes multiple roles and modules to ensure smooth coordination from order placement to final delivery and payment.

Unlike typical B2C platforms, **salesmen act on behalf of customers** to place and manage orders through the system.

---

## 🧑‍💻 Modules & Roles
- **Salesman (Customer Proxy)** – Places orders, collects payments, and manages customer accounts.
- **Sales Manager** – Validates and forwards new orders.
- **Sales Authorizer** – Approves orders and assigns warehouses.
- **Admin** – Manages products, employees, reports, and approvals.
- **Plant Head** – Manages production and dispatch.
- **Accountant** – Generates and verifies final invoices.

---

## 🔄 Full Workflow (End-to-End Process)

```mermaid
graph TD
  A[Salesman places order on behalf of customer] --> B[Sales Manager reviews & validates]
  B --> C[Sales Manager forwards to Sales Authorizer]
  C --> D[Sales Authorizer approves order]
  D --> E[Sales Authorizer assigns warehouse]
  E --> F[Admin approves warehouse assignment]
  F --> G[Order sent to Plant Head]
  G --> H[Plant Head initiates production]
  H --> I[Plant Head dispatches order]
  I --> J[Transport details entered]
  J --> K[Accountant generates final invoice]
  K --> L[Salesman collects due payment]
  L --> M[System marks order as fully paid & completed]
````

---

## 🧑‍🏫 Role-Based Flow Summary

### 1. **Salesman (Customer Role Proxy)**

* Places feed order (selects product, quantity, customer).
* Pays advance amount or logs it.
* Collects due payment after delivery.
* Downloads invoice for customer.

### 2. **Sales Manager**

* Reviews new orders submitted by salesmen.
* Validates and forwards to sales authorizer.
* Orders are locked after forwarding.

### 3. **Sales Authorizer**

* Reviews forwarded orders.
* Approves or rejects.
* Assigns warehouse for order fulfillment.

### 4. **Admin**

* Approves warehouse assignments.
* Manages product rate charts and employee data.
* Reviews and exports reports and analytics.

### 5. **Plant Head**

* Records daily production.
* Prepares and dispatches feed orders.
* Enters transport details and vehicle information.

### 6. **Accountant**

* Views dispatched orders.
* Generates final invoices for due balances.
* Updates payment status and shares invoice.

---

## 📈 Reports & Dashboards

* Track sales, dispatch status, and pending dues.
* Compare advance vs due collections.
* Visualize production vs dispatch trends.
* Personal dashboards per role (e.g. Salesman, Admin).

---

## 🔔 Notifications & Alerts

* New Order Placed by Salesman
* Advance Payment Recorded
* Due Payment Reminders
* Dispatch Confirmation
* Invoice Generation
* Rate Changes or Employee Inactivity

---

## 💡 Tech Stack Suggestions

* **Frontend**: React / React Native (for mobile dashboard), Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **Authentication**: OTP login (mobile-based), or Admin-controlled credentials
* **File Storage**: AWS S3 / Cloudinary (for invoices, transport photos)

---

## ✅ Validations

* Quantity must be > 0
* Advance ≤ Total
* Due date required before proceeding
* Mandatory fields must be filled before continuing

---

## 📝 Prepared By

**Ansh Infotech**
📅 Date: 09-07-2025

---
