# Parfumello

A perfume discovery and review platform. Browse fragrances, filter by notes or brand, leave reviews, and save your favorites. (WORK IN PROGRESS)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend        | React + Vite + Tailwind CSS    |
| Backend         | Django + Django REST Framework |
| Authentication  | JWT (SimpleJWT)                |
| Database        | SQLite (dev)                   |
| Version Control | GitHub                         |

## Features

- Browse and search perfumes (filter by brand, notes, gender)
- Perfume detail page with notes, ratings, and reviews
- User registration and JWT-based login
- Leave and rate reviews (1–5 stars)
- Save favorite perfumes to your profile

## Project Structure

```
parfumello-app/
├── config/                  # Django project settings & URLs
├── parfumello/              # Main Django app
│   ├── models.py            # Perfume, Brand, Note, Profile, UserReview
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API views
│   ├── api_urls.py          # API routes
│   └── migrations/          # Database migrations
└── parfumello-frontend/     # React + Vite frontend
    └── src/
        ├── pages/           # HomePage, PerfumeDetail
        └── components/      # Navbar, Footer, PerfumeCard, PerfumeGrid
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/`      | Create a new account |
| POST | `/api/auth/token/`         | Login — returns access + refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Perfumes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/perfumes/`      | List all perfumes (supports filtering & search) |
| GET | `/api/perfumes/{id}/` | Perfume detail with notes and reviews |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| GET  | `/api/reviews/` | List all reviews |
| POST | `/api/reviews/` | Submit a review (auth required) |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/`                  | Get your profile (auth required) |
| POST | `/api/profile/add_favorite/`    | Add a perfume to favorites |
| POST | `/api/profile/remove_favorite/` | Remove a perfume from favorites |

## Getting Started

### Backend

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend

```bash
cd parfumello-frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://127.0.0.1:8000`.

## Authentication

Authenticated requests require a Bearer token in the header:

```
Authorization: Bearer <access_token>
```

Obtain a token via `POST /api/auth/token/` with `username` and `password`.
