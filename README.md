# Digital Approval Workflow

Digital Approval Workflow is a full-stack web application for managing employee approval requests. Employees can create and track requests, while managers can review, comment, approve, reject, and monitor request history through a responsive dashboard.

## Project Overview

This project was developed as a Phase 3 web development submission with a focus on:

- polished and responsive UI/UX
- advanced request handling logic
- performance improvements
- testing and reliability
- live deployment
- project documentation

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT
- API Documentation: Swagger JSON and Postman collection
- Deployment: Vercel (frontend) and Render (backend)

## Core Features

- Employee signup and login
- Manager signup and login
- Role-based dashboard access
- Create approval requests for:
- `Leave`
- `Purchase`
- `Expense`
- `Loan`
- `Work From Home`
- View submitted requests and approval status
- Manager comments on requests
- Manager approval, rejection, and deletion
- Search, filter, and pagination for manager approvals
- Document preview support for uploaded files
- Notification UI for employee updates
- Loaders and toast notifications for better user feedback

## UI/UX Highlights

- Responsive layouts for desktop and mobile
- Modern form styling and animated cards
- Loaders for route and data states
- Toast notifications for signup, login, and request actions
- Smooth transitions for sections and request interactions

## Advanced Logic

- Manager-side search by title, description, employee name, and email
- Filtering by request status and request type
- Server-side pagination for approval management
- Role-based authorization for employee and manager routes
- Request document handling and preview

## Performance and Testing

- Indexed request and user table fields for faster queries
- Frontend route lazy loading
- Vendor chunk splitting with Vite
- Backend unit tests for request query parsing and pagination logic

## Project Structure

```text
Digital Approval Workflow/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── docs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   └── server.js
├── frontend-react/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── docs/
├── postman/
├── render.yaml
└── README.md
```

## Local Setup

### Backend

```powershell
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

```powershell
cd frontend-react
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

### Backend

Create `backend/.env` and configure:

```env
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
```

### Frontend

Optional for deployed frontend:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## API Endpoints

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Requests

- `POST /api/requests/create`
- `GET /api/requests`
- `GET /api/requests/:id`
- `PATCH /api/requests/:id/status`
- `PATCH /api/requests/:id/comment`
- `DELETE /api/requests/:id`

### Utility

- `GET /api/health`
- `GET /api/docs/`
- `GET /api/docs/swagger.json`

## Testing

Run backend tests:

```powershell
cd backend
npm test
```

## Deployment

### Frontend

- Live URL: `https://digital-approval-ktyt.vercel.app`

### Backend

- Live URL: `https://digital-approval-2.onrender.com`
- Health check: `https://digital-approval-2.onrender.com/api/health`
- API docs: `https://digital-approval-2.onrender.com/api/docs/`

## Documentation Files

- Project report: [docs/PROJECT_REPORT.md](c:\Users\jivis\OneDrive\Desktop\Digital Approval Workflow\docs\PROJECT_REPORT.md)
- Swagger spec: [backend/docs/swagger.json](c:\Users\jivis\OneDrive\Desktop\Digital Approval Workflow\backend\docs\swagger.json)
- Postman collection: [postman/Digital_Approval_Workflow_Phase2.postman_collection.json](c:\Users\jivis\OneDrive\Desktop\Digital Approval Workflow\postman\Digital_Approval_Workflow_Phase2.postman_collection.json)

## Author

- Jivi Sowmya
