# WorkoutZone Backend Boilerplate

This is a boilerplate for a FastAPI application with SQLAlchemy and PostgreSQL.

## Prerequisites

- Python 3.9+
- PostgreSQL database

## Setup

1. **Clone the repository** (if applicable).
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment variables**:
   Update `.env` with your database credentials:
   ```
   DATABASE_URL=postgresql://user:password@localhost/dbname
   ```
5. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

## Structure

- `app/main.py`: Entry point and API routes.
- `app/database.py`: SQLAlchemy database connection.
- `app/models.py`: Database models.
- `app/schemas.py`: Pydantic data schemas.
- `.env`: Sensitive configuration.
- `requirements.txt`: Python packages.
