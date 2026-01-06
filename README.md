# Leave Tracker

A full-stack leave management application built with React (Vite) and Spring Boot.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Ant Design |
| Backend | Java 17, Spring Boot 3, Spring Security, H2 Database |
| Auth | JWT-based authentication |

## Project Structure

```
leave-tracker/
├── src/                  # React frontend
│   ├── components/       # Shared UI components
│   ├── features/         # Feature modules (auth, dashboard, employees, etc.)
│   ├── services/         # API layer
│   └── types/            # TypeScript types
├── backend/              # Spring Boot backend
│   ├── src/main/java/    # Java source code
│   └── data/persistence/ # JSON data files
├── data/seeds/           # Seed data files (holidays, etc.)
└── scripts/              # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

### Backend Setup

```bash
cd backend

# Run Spring Boot application
mvn spring-boot:run
```

Backend API runs at: http://localhost:3001

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| lohitg | password123 | Manager |
| adityap | password123 | Employee |

## API Endpoints

Base URL: `http://localhost:3001/api/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User authentication |
| `/employees` | GET | List all employees |
| `/leaves` | GET/POST | Leave management |
| `/dashboard/*` | GET | Dashboard statistics |
| `/org-chart` | GET | Organization hierarchy |

## Features

- ✅ JWT Authentication with 15-min inactivity logout
- ✅ Role-based access control (Manager vs Employee)
- ✅ Interactive Org Chart with search
- ✅ Leave Request Management
- ✅ Dashboard with statistics
- ✅ Dynamic Holiday Calendar (imported from Excel)
- ✅ Dark Mode support

## Scripts

```bash
# Import holidays from Excel
node scripts/import_holidays.cjs
```

## License

© 2025 HSBC. All rights reserved.
