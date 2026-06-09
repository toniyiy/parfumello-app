# Parfumello

A perfume discovery and e-commerce platform. Browse fragrances, filter by notes or brand, get AI-powered recommendations, check fragrance compatibility, and purchase your favorites. (WORK IN PROGRESS)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Django + Django REST Framework |
| Authentication | JWT (SimpleJWT) |
| Database | SQLite (dev) |
| Payments | Stripe |
| ML / AI | Keras / ONNX + scikit-learn |
| Version Control | GitHub |

## Features

- Browse and search perfumes (filter by brand, notes, gender)
- Perfume detail page with notes, ratings, and reviews
- User registration and JWT-based login
- Leave and rate reviews (1–5 stars)
- Save favorite perfumes to your profile
- Shopping cart and Stripe-powered checkout
- Order history
- **ML-powered fragrance compatibility scoring** between two perfumes
- **ML-powered similar perfume recommendations**
- Discover page for fragrance exploration
- Brand house pages
- Contact form

## Project Structure

```
parfumello-app/
├── config/                  # Django project settings & URLs
├── parfumello/              # Main Django app
│   ├── models.py            # Perfume, Brand, Note, Profile, UserReview, Order
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API views
│   ├── ml_engine.py         # ML inference (compatibility & similarity)
│   ├── api_urls.py          # API routes
│   └── migrations/          # Database migrations
├── ml/                      # Trained ML model files (.h5, .onnx, .pkl)
├── match_perfumes.py        # CSV → DB matching script (fuzzy matching)
├── fra_cleanedcopy.csv      # Fragrance dataset
└── parfumello-frontend/     # React + Vite frontend
    └── src/
        ├── pages/           # HomePage, ShopPage, PerfumeDetail, BrandPage,
        │                    # CompatibilityPage, SimilarPage, ProfilePage,
        │                    # CheckoutPage, OrdersPage, LoginPage, RegisterPage,
        │                    # AboutPage, ContactPage, OrderConfirmationPage
        └── components/      # Navbar, Footer, HeroSection, PerfumeCard,
                             # PerfumeGrid, SearchModal, CartDrawer
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Create a new account |
| POST | `/api/auth/token/` | Login — returns access + refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Perfumes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/perfumes/` | List all perfumes (supports filtering & search) |
| GET | `/api/perfumes/{id}/` | Perfume detail with notes and reviews |

### Brands & Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/brands/` | List all brands |
| GET | `/api/brands/{id}/` | Brand detail |
| GET | `/api/notes/` | List all fragrance notes |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reviews/` | List all reviews |
| POST | `/api/reviews/` | Submit a review (auth required) |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/` | Get your profile (auth required) |
| POST | `/api/profile/add_favorite/` | Add a perfume to favorites |
| POST | `/api/profile/remove_favorite/` | Remove a perfume from favorites |

### Orders & Checkout
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/checkout/payment-intent/` | Create Stripe payment intent (auth required) |
| POST | `/api/orders/` | Place an order (auth required) |
| GET | `/api/orders/history/` | Get order history (auth required) |

### ML Features
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/compatibility/{id_a}/{id_b}/` | Compatibility score between two perfumes |
| GET | `/api/similar/{id}/` | Similar perfume recommendations |

### Other
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact/` | Submit a contact form message |

## Getting Started

### Backend

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate     # macOS/Linux
venv\Scripts\activate        # Windows

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

## Environment Variables

Create a `.env` file in the root with the following:

```
SECRET_KEY=your_django_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```
