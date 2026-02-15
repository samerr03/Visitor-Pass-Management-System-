# Visitor Pass Management System

A production-ready Visitor Pass Management System built with Node.js, Express, MongoDB, and React.js.

## Features
- **Authentication**: Admin & Security login with JWT (Access + Refresh Tokens).
- **Video Pass Generation**: Auto-generate unique Pass IDs.
- **Role-Based Access**: Separate dashboards for Admin and Security.
- **Real-time Stats**: Admin dashboard with daily visitor statistics.
- **Search**: Admin can search visitors by name or phone.
- **Responsive UI**: Clean interface using Tailwind CSS.

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React.js (Vite), Tailwind CSS, Axios
- **Security**: Helmet, CORS, bcrypt, HttpOnly Cookies

## Prerequisites
- Node.js (v14+)
- MongoDB Atlas Account (or local MongoDB)

## Setup Instructions

### 1. Clone & Install Dependencies

**Backend:**
```bash
cd visitor-pass-system/backend
npm install
```

**Frontend:**
```bash
cd visitor-pass-system/frontend
npm install
```

### 2. Environment Variables

Create `backend/.env` file:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

### 3. Seed Admin User
The system requires an initial Admin user.
You can use Postman to send a POST request to `http://localhost:5000/api/auth/seed`:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpassword"
}
```
*Note: This route checks if an admin already exists to prevent duplicates.*

### 4. Run the Application

### 4. Run the Application

**Option 1: Using Batch Script (Recommended for Windows)**
Double-click `start-dev.bat` in the root folder.
This will open two terminal windows (one for backend, one for frontend).

**Option 2: Using NPM**
Run from the root directory:
```bash
npm run dev
```
*(Note: If `npm run dev` fails on Windows, use Option 1)*

Visit `http://localhost:5173` in your browser.

## API Endpoints

### Auth
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Admin
- `POST /api/admin/create-security` - Create security staff
- `GET /api/admin/dashboard` - Get stats
- `GET /api/admin/visitors` - List visitors (paginated)
- `GET /api/admin/visitors/search?keyword=...` - Search visitors

### Visitor (Security)
- `POST /api/visitors` - Create pass
- `GET /api/visitors/today` - View today's visitors
- `PUT /api/visitors/:id/checkout` - Checkout visitor

## Deployment

### Backend (Render/Heroku/Railway)
1. Push code to GitHub.
2. Connect repository to hosting provider.
3. Set Environment Variables in dashboard.
4. Build Command: `npm install`
5. Start Command: `node server.js`

### Frontend (Vercel/Netlify)
1. Push code to GitHub.
2. Connect repository.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. **Important:** Set up proxy or update `baseURL` in `axios.js` to point to production backend URL.

## Folder Structure
```
visitor-pass-system/
├── backend/        # Express API
│   ├── config/     # DB connection
│   ├── controllers/# Logic
│   ├── middleware/ # Auth, Error, Validation
│   ├── models/     # Mongoose Schemas
│   ├── routes/     # API Routes
│   └── utils/      # Helpers
└── frontend/       # React App
    ├── src/
    │   ├── api/    # Axios setup
    │   ├── components/
    │   ├── context/# Auth Context
    │   └── pages/  # Views
```
