# GymDashboard (WorkoutZone)

A full-stack dashboard for gym owners to manage members, plans, trainers, and finances — with Google OAuth login, a multi-gym admin flow, and a responsive (desktop + mobile) React frontend.

- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (`wzBackend/`)
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Recharts (`wzFrontend/`)

## Features

- **Google OAuth login** (Authlib + FastAPI sessions), with a gym-selection step for owners of multiple gyms
- **Member management** — add, edit, and remove members, track plans and billing dates
- **Membership plans** — per-gym plans with pricing and duration, seeded with default tiers (monthly/quarterly/half-yearly/yearly)
- **Trainers & trainer plans** — manage trainers per gym and the personal-training packages they offer
- **Finance tracking** — payment recording, outstanding balances, expense logging, CSV/data export, and automatic billing renewal
- **Analytics dashboard** — charts (via Recharts) summarizing gym performance
- **Mobile-optimized views** — dedicated mobile components mirroring the desktop dashboard, finance, member list, and analytics views

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Axios, Recharts |
| Backend   | FastAPI, SQLAlchemy (2.0 mapped-column style), Pydantic, Authlib (Google OAuth), Uvicorn |
| Database  | PostgreSQL |
| Auth      | Google OAuth 2.0 + server-side session cookies |

## Project Structure

```
GymDashboard/
├── wzBackend/
│   ├── main.py                 # FastAPI app entry point, middleware, router registration
│   ├── authService.py          # Google OAuth client configuration
│   ├── requirements.txt
│   ├── database/
│   │   └── models.py           # SQLAlchemy models (User, Gym, Member, Plan, Trainer, Transactions, Expense, ...)
│   ├── schemas/                # Pydantic request/response schemas
│   └── Routes/
│       ├── authRoutes.py       # /auth  - login, callback, logout, session user
│       ├── userRoutes.py       # /users
│       ├── gymRoutes.py        # /gyms
│       ├── memberRoutes.py     # /members
│       ├── planRoutes.py       # /plans
│       ├── trainerRoutes.py    # /trainers
│       └── financeRoutes.py    # /finances - payments, expenses, outstanding, export
└── wzFrontend/
    ├── src/
    │   ├── api.ts               # Axios instance (base URL, credentials)
    │   ├── App.tsx               # Route definitions
    │   ├── contexts/             # GymContext (selected gym state)
    │   ├── pages/                # LoginPage, SelectGym, Dashboard, AdminDashboard, LoginError
    │   └── components/           # Sidebar, MemberListView, FinanceView, AnalyticsView, PlansAndTrainersView, ...
    │       └── mobile/           # Mobile-specific equivalents of the above views
    └── vite.config.ts
```

## Data Model

Core entities: **User** (gym owner, Google-authenticated) → **Gym** → **Member** (linked via a `member_gyms` join table carrying plan, billing, and trainer assignment) → **Plan** / **Trainer** / **TrainerPlan** → **Transactions** / **Expense** for finance tracking.

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL database
- A Google OAuth 2.0 Client ID/Secret (for login)

### Backend setup

```bash
cd wzBackend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `wzBackend/` with:

```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback
FRONTEND_URL=http://localhost:5173
```

Run the API:

```bash
python main.py
# or: uvicorn main:app --reload --port 8080
```

The API will be available at `http://localhost:8080`.

### Frontend setup

```bash
cd wzFrontend
npm install
```

Optionally set the backend URL in a `.env` file (defaults to `http://localhost:8080`):

```
VITE_API_URL=http://localhost:8080
```

Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts (Frontend)

| Command           | Description                     |
|-------------------|----------------------------------|
| `npm run dev`     | Start the Vite dev server        |
| `npm run build`   | Type-check and build for production |
| `npm run lint`    | Run ESLint                       |
| `npm run preview` | Preview the production build     |

## API Overview

| Prefix       | Purpose                                              |
|--------------|-------------------------------------------------------|
| `/auth`      | Google OAuth login/callback/logout, current session user |
| `/users`     | User records |
| `/gyms`      | Create/list gyms, transfer ownership |
| `/members`   | CRUD for gym members |
| `/plans`     | CRUD for gym membership plans |
| `/trainers`  | CRUD for trainers and their training plans |
| `/finances`  | Payments, outstanding balances, expenses, summaries, export, billing renewal |

## License

No license file is currently included in this repository. Add one (e.g., MIT) if you intend to share or open-source this project.
