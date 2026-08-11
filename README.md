# 🚪 Visitor Pass Management System

A full-stack **Visitor Pass Management System** designed to digitize visitor entry, pass generation, check-in/check-out, and administrative monitoring.

The system provides separate dashboards for **Admin** and **Security Staff**, with JWT-based authentication, role-based access control, visitor search, and real-time daily statistics.

---

## 📌 Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Access and refresh token mechanism
* Secure authentication using HttpOnly cookies
* Password hashing with bcrypt
* Role-based access control for Admin and Security Staff
* Protected API routes

### 🎫 Visitor Pass Management

* Automatic unique visitor pass ID generation
* Create visitor passes
* Record visitor details
* Visitor check-in and check-out
* View today's visitors
* Track active and completed visits

### 👨‍💼 Admin Dashboard

* Daily visitor statistics
* Total visitor count
* Active visitor monitoring
* Visitor history
* Search visitors by name or phone number
* Pagination for visitor records
* Create and manage Security Staff accounts

### 🛡️ Security Dashboard

* Register new visitors
* Generate visitor passes
* View today's visitors
* Checkout visitors
* Simple and responsive interface

### 🎨 User Interface

* Responsive design
* React.js with Vite
* Tailwind CSS
* Clean dashboard-based UI
* Axios-based API communication

---

## 🛠️ Tech Stack

| Category       | Technologies                  |
| -------------- | ----------------------------- |
| Frontend       | React.js, Vite, Tailwind CSS  |
| Backend        | Node.js, Express.js           |
| Database       | MongoDB, Mongoose             |
| Authentication | JWT, HttpOnly Cookies, bcrypt |
| API            | REST API, Axios               |
| Security       | Helmet, CORS                  |
| Development    | Git, GitHub, Postman          |

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       React.js      │
                    │    Vite + Tailwind  │
                    └──────────┬──────────┘
                               │
                            Axios
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Express.js API   │
                    │    REST Endpoints   │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
              JWT Authentication     RBAC Middleware
                    │                     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MongoDB       │
                    │      Mongoose       │
                    └─────────────────────┘
```

---

## 📂 Project Structure

```text
visitor-pass-system/
│
├── README.md
├── .gitignore
├── start-dev.bat
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   └── pages/
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Prerequisites

Before running the project, make sure you have:

* **Node.js 18+**
* **npm**
* **MongoDB Atlas account** or local MongoDB installation
* **Git**
* **Postman** (optional, for API testing)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>

cd visitor-pass-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

CLIENT_URL=http://localhost:5173
```

> **Important:** Never upload your `.env` file or database credentials to GitHub.

Create an `.env.example` file instead:

```env
PORT=5000
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
```

---

## 👤 Create Initial Admin

The system requires an initial Admin account.

Start the backend server and send the following request using Postman:

```http
POST http://localhost:5000/api/auth/seed
```

Request body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

The seed route checks whether an Admin already exists to prevent duplicate Admin accounts.

> For a deployed production application, this endpoint should be protected or removed after initial setup.

---

## ▶️ Run the Application

### Option 1: Start Script — Windows

From the project root:

```text
start-dev.bat
```

This starts both the backend and frontend development servers.

### Option 2: Start Manually

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

The backend API will normally run at:

```text
http://localhost:5000
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | `/api/auth/login`   | Login user           |
| POST   | `/api/auth/refresh` | Refresh access token |
| POST   | `/api/auth/logout`  | Logout user          |
| POST   | `/api/auth/seed`    | Create initial Admin |

### Admin

| Method | Endpoint                                 | Description              |
| ------ | ---------------------------------------- | ------------------------ |
| POST   | `/api/admin/create-security`             | Create Security Staff    |
| GET    | `/api/admin/dashboard`                   | Get dashboard statistics |
| GET    | `/api/admin/visitors`                    | Get paginated visitors   |
| GET    | `/api/admin/visitors/search?keyword=...` | Search visitors          |

### Visitor / Security

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| POST   | `/api/visitors`              | Create visitor pass  |
| GET    | `/api/visitors/today`        | Get today's visitors |
| PUT    | `/api/visitors/:id/checkout` | Checkout visitor     |

---

## 🔐 Security

The application implements several security practices:

* JWT authentication
* Access and refresh tokens
* HttpOnly cookies
* Password hashing using bcrypt
* Role-based authorization
* Protected API routes
* Helmet security middleware
* CORS configuration
* Environment variables for sensitive credentials

---

## 📊 User Roles

### Admin

Admin users can:

* View dashboard statistics
* View visitor records
* Search visitors
* Monitor visitor activity
* Create Security Staff accounts

### Security Staff

Security Staff can:

* Register visitors
* Generate visitor passes
* View today's visitors
* Checkout visitors

---

## 🖥️ Screenshots

Add screenshots of the major pages here before submitting the project to recruiters.

Recommended screenshots:

1. Login Page
2. Admin Dashboard
3. Security Dashboard
4. Visitor Registration Form
5. Generated Visitor Pass
6. Visitor Search/History

Example:

```text
screenshots/
├── login.png
├── admin-dashboard.png
├── security-dashboard.png
├── visitor-form.png
└── visitor-pass.png
```


## 🚀 Deployment

### Backend

The backend can be deployed using platforms such as:

* Render
* Railway
* Heroku

Typical configuration:

```text
Build Command:
npm install

Start Command:
node server.js
```

Configure the required environment variables in the hosting platform.

### Frontend

The React frontend can be deployed using:

* Vercel
* Netlify

Typical configuration:

```text
Build Command:
npm run build

Output Directory:
dist
```

Update the Axios `baseURL` to point to the deployed backend API.

---

## 🧪 API Testing

The REST APIs can be tested using **Postman**.

Recommended testing flow:

```text
1. Create Admin
       ↓
2. Login
       ↓
3. Create Security Staff
       ↓
4. Login as Security
       ↓
5. Create Visitor Pass
       ↓
6. View Today's Visitors
       ↓
7. Checkout Visitor
       ↓
8. View Admin Dashboard
```

---

## 🔮 Future Enhancements

Potential improvements include:

* QR-code based visitor passes
* Email/SMS notifications
* Visitor photo capture
* Host approval workflow
* Advanced analytics and reports
* Export visitor records to CSV/PDF
* Multiple building/gate management
* Visitor blacklist management
* Automated pass expiry
* Docker support
* CI/CD pipeline

---

## 🎯 Project Highlights

This project demonstrates practical experience with:

* Full-stack web development
* REST API development
* React component architecture
* Node.js and Express.js
* MongoDB database design
* JWT authentication
* Role-based authorization
* Secure API development
* Responsive UI development
* API testing with Postman
* Git/GitHub workflow

---

## 👨‍💻 Author

**Sameer Patel**

B.E. Computer Science & Engineering
Chandigarh University

---

## ⭐ If You Like This Project

If this project helped you or you found it useful, consider giving the repository a ⭐ on GitHub.
