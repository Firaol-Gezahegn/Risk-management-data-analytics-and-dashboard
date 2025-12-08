#Risk Management Dashboard

A comprehensive enterprise risk management system built for Awash Bank with role-based access control, 5×5 risk matrix scoring, and advanced analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
# Copy .env file and update with your database credentials
DATABASE_URL=postgresql://user:password@localhost:5432/awash_risk
JWT_SECRET=your-secret-key
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Start the application:**
```bash
npm run dev    # Development mode
npm start      # Production mode
```

5. **Access the application:**
- URL: http://localhost:5000
- Admin: admin@awashbank.com / admin123

## 📋 Features

### Risk Management
- **5×5 Risk Matrix** - Industry-standard risk scoring
- **Risk Levels**: Very High, High, Medium, Low, Very Low
- **Inherent & Residual Risk** calculation
- **Control Effectiveness** tracking
- **RCSA Assessments** integration

### Dashboard
- 6 color-coded risk level cards
- Control effectiveness monitoring
- Risk trend analysis (12 months)
- Risk distribution charts
- Status and category breakdowns
- Top risks identification

### Role-Based Access Control
- **Superadmin** - Full system access
- **Risk Admin** - Risk management operations
- **Risk Team Full** - Complete risk operations
- **Chief Office** - Department-level access (16 departments)
- **Business User** - View and create risks
- **Reviewer** - Review and approve
- **Auditor** - Read-only audit access

### 16 Chief Offices/Departments
1. Wholesale Banking
2. Retail Banking
3. International Banking
4. Treasury and Investment
5. Finance
6. Risk Management
7. Compliance
8. Internal Audit
9. Human Resources
10. Information Technology
11. Operations
12. Legal
13. Marketing and Corporate Communications
14. Strategy and Business Development
15. Credit
16. Branch Network

### Excel Import/Export
- Bulk risk import with validation
- Template generation
- Error reporting
- Data mapping

### Advanced Features
- Risk collaborators management
- Audit logging
- Email notifications
- Active Directory integration (optional)
- Dark/Light theme support

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Charts**: Recharts
- **Authentication**: JWT + bcrypt

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and helpers
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   ├── access-control.ts # RBAC logic
│   └── excel-import.ts  # Excel processing
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Database schema
│   ├── constants.ts     # App constants
│   └── risk-scoring.ts  # Risk calculation logic
├── migrations/          # Database migrations
└── docs/               # Documentation
```

## 📊 Risk Scoring

### 5×5 Matrix
Risks are scored using a 5×5 matrix based on:
- **Likelihood** (0-100): Probability of occurrence
- **Impact** (0-100): Severity of consequences

### Risk Levels
- **Very High**: 83.33-100 (Matrix 20-24) - Immediate action required
- **High**: 62.5-83.33 (Matrix 15-19) - Priority attention needed
- **Medium**: 37.5-62.5 (Matrix 9-14) - Monitor and manage
- **Low**: 16.67-37.5 (Matrix 4-8) - Routine monitoring
- **Very Low**: 0-16.67 (Matrix 0-3) - Minimal concern

### Calculations
```
Inherent Risk = Matrix[Likelihood Index][Impact Index]
Residual Risk = Inherent Risk × (1 - Control Effectiveness / 100)
```

## 🔐 Default Users

### Admin Account
- Email: admin@awashbank.com
- Password: admin123
- Role: superadmin

### Department Chiefs
- Email: [department]@awashbank.com
- Password: password123
- Role: chief_office
- Example: wholesalebanking@awashbank.com

## 🛠️ Utility Scripts

### Database Management
```bash
# Create department users
node create-department-users.js

# Reset risk database
node reset-risks-database.js
```

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run migrate      # Run database migrations
```

## 📖 Documentation

- **[Setup Guide](docs/SETUP_GUIDE.md)** - Detailed installation instructions
- **[Migration Guide](docs/MIGRATION_GUIDE.md)** - Database migration guide
- **[Quick Start](docs/QUICK_START.md)** - Get started quickly
- **[Excel Import Guide](EXCEL_IMPORT_GUIDE.md)** - Excel import instructions
- **[Technical Overview](docs/technical-overview.md)** - System architecture
- **[Design Guidelines](docs/design_guidelines.md)** - UI/UX guidelines

## 🔄 Recent Updates

### Latest Release
- ✅ Enhanced dashboard with 6 risk level cards
- ✅ Control effectiveness monitoring
- ✅ Fixed risk calculation using 5×5 matrix
- ✅ Created 16 department chief users
- ✅ Database reset and cleanup
- ✅ Business unit changed to text input
- ✅ Impact field calculation fixed

See [SYSTEM_RESET_SUMMARY.md](SYSTEM_RESET_SUMMARY.md) for complete details.

## 🤝 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the setup guides
3. Contact the development team

## 📝 License

Proprietary - Awash Bank Internal Use Only

---

**Built with ❤️ for Awash Bank**
