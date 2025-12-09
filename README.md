# RoadRobos - Bike Rental Management System

A full-stack bike rental platform with React frontend and Node.js backend, integrated with MySQL database.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## 📁 Project Structure

```
roadrobos4/
├── src/                    # React source files (TypeScript)
├── components/             # React components
├── server/                 # Node.js backend (CommonJS)
├── database/              # Database models, config, and SQL scripts
├── dist/                  # Production build (created after npm run build)
├── public/                # Static assets
├── node_modules/          # Dependencies
├── .env                   # Environment variables (UPDATE for production!)
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── jsconfig.json          # JavaScript configuration
```

## 📚 Documentation

- **`DEPLOY_NOW.md`** - Complete deployment guide for cPanel
- **`DEPLOYMENT_GUIDE.md`** - Detailed deployment instructions
- **`MYSQL_AUTH_DEPLOYMENT.md`** - MySQL authentication setup guide

## 🗄️ Database Setup

SQL script located at: `database/schema_update.sql`

Run this in your MySQL database to create all necessary tables.

## ⚙️ Configuration

Update `.env` file with your credentials:
- Database connection (MySQL)
- JWT secret
- Razorpay API keys

## 🚢 Deployment

See `DEPLOY_NOW.md` for step-by-step cPanel deployment instructions.

## 📦 Essential Files for Deployment

When deploying, you need:
- `dist/` folder (run `npm run build` first)
- `server/` folder (without node_modules)
- `database/` folder
- `package.json`
- `.env` (with production values)
- `.htaccess` file

## 🔗 Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Payment**: Razorpay
- **Authentication**: JWT with bcrypt

---

**Ready to deploy?** Open `DEPLOY_NOW.md` for complete instructions!
