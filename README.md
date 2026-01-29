# Property Management System - Backend API

## Overview
Production-ready REST API for Property Management System built with Node.js, Express, and MySQL.

## Features
- ✅ JWT Authentication with 1-hour token lifetime
- ✅ Role-Based Access Control (Admin, Owner, Tenant)
- ✅ Rate Limiting & Security Headers
- ✅ Input Validation with Joi
- ✅ Audit Logging
- ✅ Soft Delete Pattern
- ✅ Pagination Support

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Joi
- **Logging:** Winston

## Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:
```bash
# In MySQL Workbench or CLI, run:
# src/database/migrations/full_setup.sql
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Authenticated |
| GET | `/api/auth/me` | Get current user | Authenticated |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List all users | Admin |
| POST | `/api/users` | Create user | Admin |
| GET | `/api/users/:id` | Get user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| PATCH | `/api/users/:id/deactivate` | Deactivate user | Admin |
| PATCH | `/api/users/:id/activate` | Activate user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| PUT | `/api/profile` | Update own profile | Authenticated |

### Buildings
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/buildings` | List buildings | Admin, Owner |
| POST | `/api/buildings` | Create building | Admin |
| GET | `/api/buildings/:id` | Get building | Admin, Owner |
| PUT | `/api/buildings/:id` | Update building | Admin, Owner |
| DELETE | `/api/buildings/:id` | Delete building | Admin |
| GET | `/api/buildings/:id/units` | Get building units | Admin, Owner |

### Units
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/units` | List units | Admin, Owner |
| POST | `/api/units` | Create unit | Admin |
| GET | `/api/units/:id` | Get unit | Admin, Owner |
| PUT | `/api/units/:id` | Update unit | Admin, Owner |
| DELETE | `/api/units/:id` | Delete unit | Admin |

### Tenancies
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tenancies` | List tenancies | Admin, Owner, Tenant |
| POST | `/api/tenancies` | Create tenancy | Admin |
| GET | `/api/tenancies/:id` | Get tenancy | Admin, Owner, Tenant |
| PUT | `/api/tenancies/:id` | Update tenancy | Admin |
| PATCH | `/api/tenancies/:id/end` | End tenancy | Admin |
| GET | `/api/my-tenancies` | Get my tenancies | Tenant |

## Default Admin Credentials
```
Email: admin@propertymanagement.com
Password: Admin@123
```
⚠️ **Change this password immediately after first login!**

## Project Structure
```
src/
├── config/           # Configuration files
├── middleware/       # Express middleware
├── modules/          # Feature modules
│   ├── auth/
│   ├── users/
│   ├── buildings/
│   ├── units/
│   └── tenancies/
├── shared/           # Shared utilities
│   ├── constants/
│   ├── errors/
│   └── utils/
├── database/         # SQL migrations
├── app.js            # Express app setup
└── server.js         # Server entry point
```

## Scripts
```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
npm run lint   # Run ESLint
npm run format # Format code with Prettier
```

## License
ISC
