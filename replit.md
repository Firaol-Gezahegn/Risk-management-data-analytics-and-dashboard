# Risk Management Dashboard - Awash Bank

## Overview

A comprehensive enterprise risk management dashboard built for Awash Bank. The application provides role-based access control, risk record management, file ingestion capabilities, audit logging, and analytics. Built with a modern full-stack architecture using React, TypeScript, Express, and PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (avoiding heavier solutions like React Router)

**UI Component System**
- shadcn/ui components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles adapted for corporate banking environment
- Dual theme support (light/dark) with CSS variables for seamless theme switching

**State Management**
- TanStack React Query (v5) for server state management, caching, and data synchronization
- React Context API for authentication state and theme preferences
- Local component state with React hooks for UI interactions

**Design System**
- Primary brand color: `#10047a` (deep blue for trust and authority)
- Secondary brand color: `#F7923A` (warm orange for actions and highlights)
- Responsive mobile-first design with breakpoint-based layouts
- Custom Tailwind configuration with extended color palette and spacing system

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for REST API endpoints
- ESM module system for modern JavaScript imports
- Custom middleware for request logging and error handling

**Authentication & Authorization**
- JWT-based authentication with Bearer token scheme
- Role-Based Access Control (RBAC) with five roles:
  - `superadmin`: Full system access
  - `risk_admin`: Risk management and user oversight
  - `business_user`: Create and view risk records
  - `reviewer`: Review and analyze risks
  - `auditor`: Read-only access with audit capabilities
- Department-based data filtering for multi-tenant isolation
- Password hashing with bcrypt (cost factor 10)
- MFA support infrastructure (TOTP-ready)

**API Design**
- RESTful endpoints under `/api` prefix
- JWT middleware (`authMiddleware`) for protected routes
- Role-based middleware (`requireRole`) for fine-grained permissions
- JSON request/response format with automatic validation

**Database Layer**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database operations and migrations
- Schema-first design with automatic TypeScript type generation

### Data Storage Solutions

**Database Schema**

**Users Table** (`users`)
- UUID primary keys for distributed system compatibility
- Email-based authentication with unique constraint
- Role and department fields for RBAC
- MFA enablement flag for security enhancement
- Timestamps for audit trails

**Risk Records Table** (`risk_records`)
- Serial primary key for sequential identification
- Categorization fields: risk type, category, business unit, department
- Quantitative fields: likelihood, impact, inherent/residual risk, automated risk score
- Ownership via foreign key to users table
- Status tracking (Open, Mitigating, Closed)
- Mitigation plan text field for remediation strategies

**Ingestion Staging Table** (`ingestion_staging`)
- Temporary storage for uploaded CSV/XLSX data
- JSONB storage for flexible raw data and mapping metadata
- Error tracking for validation failures
- Source file tracking and uploader attribution

**Audit Logs Table** (`audit_logs`)
- Comprehensive activity tracking for compliance
- User attribution and action timestamping

**Email Reports Table** (`email_reports`)
- Scheduled report generation and delivery tracking

**ORM Configuration**
- Drizzle Kit for schema migrations with PostgreSQL dialect
- Automatic migration generation from schema changes
- Type-safe query builder with IntelliSense support

### Authentication and Authorization Mechanisms

**Token Management**
- JWT signing with configurable secret (environment variable `JWT_SECRET`)
- Token payload includes: `userId`, `role`, `department`
- Client-side token storage in localStorage
- Authorization header format: `Bearer <token>`

**Password Security**
- Bcrypt hashing with salt rounds (10)
- Password validation schema via Zod
- Secure password storage (never logged or transmitted in responses)

**Session Management**
- `/api/auth/login` for credential validation and token issuance
- `/api/auth/me` for token verification and user data retrieval
- Client-side auth check on application mount
- Automatic logout on 401 responses

**Role-Based Permissions**
- Navigation menu items filtered by user role
- API endpoints protected by role middleware
- Department-scoped data queries for business users
- Superadmin override for cross-department access

### External Dependencies

**Third-Party Libraries**

**Frontend**
- `@tanstack/react-query`: Server state management and caching
- `recharts`: Data visualization for dashboards and analytics
- `react-hook-form` + `@hookform/resolvers`: Form validation with Zod integration
- `papaparse`: CSV parsing for file uploads
- `xlsx`: Excel file parsing
- `react-dropzone`: Drag-and-drop file upload UI
- `lucide-react`: Icon library for consistent iconography

**Backend**
- `@neondatabase/serverless`: PostgreSQL driver optimized for serverless environments
- `drizzle-orm`: Type-safe ORM with schema management
- `jsonwebtoken`: JWT creation and verification
- `bcryptjs`: Password hashing and comparison
- `multer`: Multipart form data handling for file uploads
- `ws`: WebSocket support for Neon database connections

**Development Tools**
- `tsx`: TypeScript execution for development server
- `esbuild`: Fast bundling for production server
- `vite`: Frontend build tool with HMR
- `@replit/vite-plugin-*`: Replit-specific development enhancements

**Database Service**
- Neon serverless PostgreSQL (or compatible PostgreSQL provider)
- Connection via `DATABASE_URL` environment variable
- WebSocket-based connection pooling for serverless efficiency

**External APIs**
- No third-party API integrations currently implemented
- OAuth2-ready hooks mentioned for future SSO integration
- Email service integration prepared (SMTP/SendGrid/etc.) for report delivery