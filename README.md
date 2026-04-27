# 🧵 Textile Admin - Complete Business Management System

A **production-ready MERN stack** web application designed specifically for textile/garment businesses. This comprehensive admin-only system features advanced stock management, professional PDF billing, party management, payment tracking, and automated reminders.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-v20.14.0-brightgreen)
![Business](https://img.shields.io/badge/Business-Khodal%20Creation-orange)

---

## ✨ Key Features

### 📦 **Stock Management**
- Track **total available stock** with real-time updates
- **Stock Inward (Aavyo)** and **Outward (Gayo)** entries
- Detailed entries with design image, fabric type, color, and quantity
- Automatic stock calculation and validation
- Stock history and movement tracking

### 🎨 **Design Module**
- Upload design images with fabric details
- Set price per piece with GST support
- **Auto-generated unique design numbers** (e.g., DESIGN-0001)
- Color variants and fabric type management
- Design-wise stock tracking

### 👥 **Party Management**
- Complete party profiles with contact details
- Full address with optional **map location** integration
- GST number and payment terms (number of days)
- Reference source tracking (who referred the party)
- Visual payment status indicators:
  - ✅ **Completed payments**
  - ⏳ **Pending payments**
  - 🟡 **Partial payments** (e.g., 50% advance)
  - 📝 **Check-based transactions**

### 💰 **Payment Module**
- Complete transaction breakdown:
  - Total received
  - Total pending
  - Method-wise classification (Cash, Bank Transfer, Check, UPI)
- Additional fields: Check number, Transaction ID
- Payment history with party-wise ledger
- Advance payment tracking with percentage

### 📄 **Professional PDF Billing**
- **Premium invoice design** using PDFKit
- Custom business logo at the top
- Complete business details (name, address, contact, GST)
- Invoice metadata (number, date, party details)
- Clean tabular format with:
  - Design number and optional thumbnail
  - Fabric type and quantity (nang)
  - Price per unit and total amount per design
  - Subtotal, GST breakdown, and grand total
- Professional typography, spacing, and borders
- **Dynamic branding** - upload/change logo and business details
- Payment history section in PDF
- Terms & conditions footer

### 💼 **Commission System**
- Add commission for referred parties
- Calculated internally before final billing
- **Never displayed in PDF invoice** (admin-only visibility)
- Percentage or fixed amount commission
- Commission tracking per bill

### 🧾 **GST Support**
- Toggle GST on/off per invoice
- Separate GST records maintenance
- Item-wise GST rate configuration
- GST summary in reports

### ⏰ **Automated Reminders**
- Dashboard alerts for upcoming payments
- **5 days before payment due date** notifications
- Calculated based on bill date and party payment terms
- Background scheduler using **node-cron**
- Optional email notifications

### 📊 **Dashboard & Analytics**
- Summary cards (total revenue, pending payments, stock overview)
- Monthly revenue vs collections chart
- Payment method breakdown (Doughnut chart)
- Recent bills and top parties
- Bill status overview (pending, partial, paid, overdue)

### 📈 **Reports & Export**
- Sales reports with date range filtering
- Stock reports with design-wise breakdown
- Export to **CSV** (bills, payments, stock)
- Party-wise ledger reports

---

## 🛠️ Tech Stack

### **Backend**
- **Node.js** v20.14.0
- **Express.js** - REST API framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **PDFKit** - Professional PDF generation
- **Multer** & **Sharp** - Image upload and processing
- **Node-cron** - Automated reminders
- **Winston** - Logging
- **Helmet** - Security
- **Express Rate Limit** - API protection

### **Frontend**
- **React.js** 18.3.1 with Vite
- **Redux Toolkit** - State management
- **React Router** v6 - Navigation
- **Tailwind CSS** - Modern UI styling
- **Chart.js** & **React-Chartjs-2** - Data visualization
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Axios** - HTTP client

---

## 📁 Project Structure

```
textile-admin/
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, upload, error handling
│   │   ├── utils/             # Helpers, PDF generator, logger, cron
│   │   └── index.js           # Server entry point
│   ├── uploads/               # File storage
│   ├── logs/                  # Application logs
│   ├── .env                   # Environment variables
│   └── package.json
│
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout/        # Sidebar, Header
│   │   │   └── UI/            # Table, Modal, Badge, etc.
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store and slices
│   │   ├── services/          # API service (Axios)
│   │   ├── utils/             # Helper functions
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js v20+ and npm
- MongoDB (local or cloud)

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd textile-admin
```

### **2. Backend Setup**

```bash
cd server
npm install
```

Create `.env` file (or use the existing one):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/textile_admin
JWT_SECRET=textile_admin_super_secret_jwt_key_2024_production_ready
JWT_EXPIRE=7d
NODE_ENV=development

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=admin@textile.com
EMAIL_PASS=your_app_password

ADMIN_EMAIL=admin@textile.com
ADMIN_PASSWORD=Admin@123

MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

**Seed the database:**
```bash
npm run seed
```

**Start the server:**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### **3. Frontend Setup**

```bash
cd client
npm install
```

**Start the development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🔐 Default Login Credentials

After running `npm run seed`, use these credentials:

- **Email:** `admin@textile.com`
- **Password:** `Admin@123`

*(Change these in production!)*

---

## 📸 Features Walkthrough

### **1. Dashboard**
- Real-time business metrics
- Revenue charts and payment breakdowns
- Recent bills and top parties
- Payment reminders with bell icon notifications

### **2. Designs**
- Grid view with design images
- Add/Edit designs with image upload
- Auto-generated design numbers (DESIGN-0001, DESIGN-0002...)
- Stock tracking per design

### **3. Parties**
- Complete party database
- Contact details, GST, address with map
- Payment terms and commission settings
- Party-wise ledger and bill history

### **4. Stock**
- Inward (Aavyo) and Outward (Gayo) entries
- Design-wise stock summary
- Stock value calculation
- Movement history

### **5. Bills & Invoices**
- Create professional bills
- Item-wise breakdown with design images
- GST toggle and calculation
- Commission tracking (admin-only)
- Download PDF invoices
- Payment status tracking

### **6. Payments**
- Record payments with multiple methods
- Check status tracking (pending/cleared/bounced)
- Payment history per bill
- Method-wise summary

### **7. Reports**
- Sales reports with date filtering
- Stock reports with valuation
- Export to CSV for external analysis

### **8. Settings**
- Business information and logo upload
- Invoice configuration
- GST settings
- Payment terms defaults
- Password change

---

## 🎨 UI/UX Highlights

- **Clean & Modern Design** with Tailwind CSS
- **Responsive Layout** - works on desktop, tablet, and mobile
- **Professional Color Scheme** - Deep indigo primary with clean whites
- **Smooth Animations** - Page transitions and hover effects
- **Interactive Tables** - Search, filter, sort, and pagination
- **Toast Notifications** - Real-time feedback
- **Loading States** - Spinners and skeleton screens
- **Badge System** - Visual status indicators
- **Modal Dialogs** - Clean forms and confirmations

---

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcryptjs
- **Helmet.js** for HTTP headers security
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **File Upload Restrictions** (size, type)
- **CORS Configuration**
- **Error Handling** with proper logging

---

## 📦 API Endpoints

### **Authentication**
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### **Designs**
- `GET /api/designs` - List designs (with pagination, search)
- `GET /api/designs/:id` - Get design details
- `POST /api/designs` - Create design (with image upload)
- `PUT /api/designs/:id` - Update design
- `DELETE /api/designs/:id` - Deactivate design

### **Parties**
- `GET /api/parties` - List parties
- `GET /api/parties/:id` - Get party details with ledger
- `POST /api/parties` - Create party
- `PUT /api/parties/:id` - Update party
- `DELETE /api/parties/:id` - Deactivate party

### **Stock**
- `GET /api/stock` - List stock entries
- `GET /api/stock/summary` - Design-wise stock summary
- `POST /api/stock` - Add stock entry
- `DELETE /api/stock/:id` - Delete entry

### **Bills**
- `GET /api/bills` - List bills
- `GET /api/bills/:id` - Get bill details
- `GET /api/bills/:id/pdf` - Download PDF invoice
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `PATCH /api/bills/:id/cancel` - Cancel bill

### **Payments**
- `GET /api/payments` - List payments
- `GET /api/payments/summary` - Payment summary
- `POST /api/payments` - Record payment
- `PATCH /api/payments/:id/cheque-status` - Update cheque status

### **Dashboard**
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/reminders` - Payment reminders
- `PATCH /api/dashboard/reminders/:id/read` - Mark reminder as read

### **Reports**
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/stock` - Stock report
- `GET /api/reports/export` - Export CSV

### **Settings**
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/logo` - Upload logo

---

## 🧪 Testing

The system is production-ready with:
- Proper error handling
- Input validation
- Database indexing for performance
- Optimized queries
- File upload validation
- Security middleware

---

## 🚢 Deployment

### **Backend Deployment**
1. Set `NODE_ENV=production` in `.env`
2. Update `MONGODB_URI` to production database
3. Change `JWT_SECRET` to a strong secret
4. Configure email settings for reminders
5. Deploy to services like:
   - **Heroku**
   - **Railway**
   - **DigitalOcean**
   - **AWS EC2**

### **Frontend Deployment**
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to:
   - **Vercel**
   - **Netlify**
   - **AWS S3 + CloudFront**

---

## 📝 Environment Variables

### **Server (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/textile_admin
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@textile.com
ADMIN_PASSWORD=Admin@123
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Textile Admin System**  
Built with ❤️ using MERN Stack

---

## 🙏 Acknowledgments

- **PDFKit** for professional PDF generation
- **Tailwind CSS** for beautiful UI
- **Chart.js** for data visualization
- **MongoDB** for flexible data storage
- **React** ecosystem for modern frontend

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Happy Coding! 🚀**
