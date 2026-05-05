# 🪑 Furniture Web - Professional Billing & Inventory Management System

A comprehensive, multi-user furniture business management application with professional invoice generation, inventory management, and analytics dashboard.

## ✨ Features

### 🏢 Multi-User Business Management
- **Complete Business Profile**: Store business name, tagline, contact details, address, GST, PAN, bank details
- **Multi-tenant Architecture**: Each business owner has their own isolated data
- **Professional Branding**: Customize invoices with your business information

### 📄 Advanced Billing System
- **Professional Invoice Generation**: Generate PDF invoices with complete business and tax information
- **Auto Invoice Numbering**: Automatic sequential invoice numbers (INV-YYYYMM-0001)
- **Tax Calculations**: Automatic GST/tax calculations with configurable rates
- **Discount Management**: Apply discounts to invoices
- **Payment Tracking**: Track payment status (Paid, Pending, Partial)
- **Customer Management**: Save and reuse customer information

### 📦 Product Catalog
- **47+ Pre-loaded Furniture Items**: Comprehensive catalog including:
  - Living Room Furniture (Sofas, TV Units, Coffee Tables, etc.)
  - Bedroom Furniture (Beds, Wardrobes, Dressing Tables, etc.)
  - Kitchen Furniture (Modular Kitchen, Islands, Pantry Units, etc.)
  - Dining Furniture (Tables, Chairs, Crockery Units, etc.)
  - Office Furniture (Desks, Chairs, Filing Cabinets, etc.)
  - Kids Room Furniture
  - Storage Solutions
- **HSN Codes**: Pre-configured HSN codes for tax compliance
- **Custom Products**: Add your own custom products
- **Category-wise Organization**: Easy browsing by furniture category

### 👥 Customer Management
- **Customer Database**: Store customer details (name, phone, email, address, GST)
- **Quick Selection**: Reuse customer information for new invoices
- **Customer Analytics**: Track customer purchase history

### 📊 Analytics Dashboard
- **Revenue Tracking**: Total revenue, paid amount, pending amount
- **Bill Statistics**: Total bills, paid bills, pending bills, partial payments
- **Monthly Reports**: Last 12 months revenue and bill count
- **Key Metrics**: Collection rate, average bill value, monthly trends

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Sidebar Navigation**: Easy access to all features
- **Clean Interface**: Modern, professional design
- **Dark Mode Ready**: CSS variables for easy theming

### 🔐 Security
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: MySQL-based session storage
- **Password Hashing**: bcrypt password encryption
- **HTTP-only Cookies**: Secure cookie handling

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with connection pooling
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-session** with MySQL store
- **CORS** enabled for frontend communication

### Frontend
- **React** 18 with Hooks
- **React Router** for navigation
- **Axios** for API calls
- **jsPDF** & **jspdf-autotable** for PDF generation
- **Lucide React** for icons
- **Vite** for fast development

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd furniture-web
```

### 2. Database Setup

Start your MySQL server and the application will automatically:
- Create the `furniture_web` database
- Create all required tables (users, customers, products, bills, bill_items, sessions)
- Seed 47+ furniture products

**MySQL Connection Details:**
- Host: 127.0.0.1
- Port: 3306
- User: root
- Password: (empty)
- Database: furniture_web (auto-created)

### 3. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📱 Usage Guide

### First Time Setup

1. **Sign Up**: Create your account with business details
   - Personal information (name, email, password)
   - Business information (name, phone, address, GST, PAN)

2. **Complete Profile**: Go to Settings to add:
   - Bank details for invoices
   - Terms & conditions
   - Additional business information

3. **Review Products**: Check the Products page to see pre-loaded furniture items

### Creating an Invoice

1. **Navigate to Dashboard** or **Bills** page
2. Click **"New Bill"** button
3. **Select or Add Customer**:
   - Choose existing customer from dropdown
   - Or select "New Customer" and enter details
4. **Add Items**:
   - Select product from catalog
   - Enter dimensions (length × width in inches)
   - System automatically calculates area and amount
   - Tax is calculated automatically
5. **Apply Discount** (optional)
6. **Save & Download**: Generates professional PDF invoice

### Managing Customers

1. Go to **Customers** page
2. Click **"Add Customer"**
3. Fill in customer details
4. Customers are now available for quick selection in invoices

### Viewing Analytics

1. Go to **Analytics** page
2. View:
   - Total revenue and pending amounts
   - Bill statistics by payment status
   - Monthly revenue trends
   - Key business metrics

## 📊 Database Schema

### Users Table
- Personal details (name, email, password)
- Business information (name, tagline, contact)
- Address details
- Tax information (GST, PAN)
- Bank details
- Terms & conditions

### Products Table
- Product name and description
- Category
- Rate per square foot
- HSN code
- Tax rate
- Active status

### Customers Table
- Customer details
- Contact information
- Address
- GST number

### Bills Table
- Invoice number (auto-generated)
- Customer information
- Financial details (subtotal, tax, discount, total)
- Payment status and tracking
- Dates (bill date, due date)

### Bill Items Table
- Product details
- Dimensions and area
- Rate and amount
- Tax calculations
- HSN code

## 🎯 Key Features Explained

### Professional Invoice PDF
- **Header**: Company logo area, business name, tagline, contact details
- **Invoice Details**: Invoice number, date
- **Bill To**: Customer information
- **Items Table**: Detailed breakdown with dimensions, area, rate, tax
- **Summary**: Subtotal, tax, discount, grand total
- **Bank Details**: For payment reference
- **Terms & Conditions**: Customizable terms
- **Footer**: Thank you message and generation date

### Multi-User Support
- Each business owner has isolated data
- Secure authentication and authorization
- Session management for security
- No data mixing between users

### Responsive Design
- **Desktop**: Full sidebar navigation, multi-column layouts
- **Tablet**: Collapsible sidebar, optimized layouts
- **Mobile**: Drawer navigation, single-column layouts, touch-friendly

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your_secret_key_here
```

### Database Connection
Edit `backend/config/database.js` if you need to change MySQL credentials:
```javascript
host: '127.0.0.1',
port: 3306,
user: 'root',
password: '',
database: 'furniture_web'
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/categories` - Get categories
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create custom product

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Bills
- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get single bill
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill
- `GET /api/bills/stats/dashboard` - Get statistics

## 🎨 Customization

### Adding More Products
Edit `backend/config/seedProducts.js` to add more furniture items.

### Changing Theme Colors
Edit CSS variables in `frontend/src/App.css`:
```css
:root {
  --primary: #4f46e5;
  --secondary: #10b981;
  --danger: #ef4444;
  /* ... more colors */
}
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check credentials in `backend/config/database.js`
- Verify port 3306 is not blocked

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Change port in `vite.config.js`

### PDF Generation Issues
- Ensure jsPDF and jspdf-autotable are installed
- Check browser console for errors

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ for furniture business owners

## 🙏 Acknowledgments

- React team for the amazing framework
- jsPDF for PDF generation
- Lucide for beautiful icons
- MySQL for reliable database

---

**Note**: This is a production-ready application designed for real-world furniture business management. All features are fully functional and tested.