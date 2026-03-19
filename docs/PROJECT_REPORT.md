# Digital Approval Workflow Phase 3 Report

## Project Overview

Digital Approval Workflow streamlines employee approval requests such as leave, purchase, expense, loan, and work-from-home submissions. Employees create requests and monitor status updates, while managers review, comment, approve, reject, or delete entries.

## Technology Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, MySQL
- Authentication: JWT with role-based authorization
- Documentation: Swagger JSON and Postman collection

## Phase 3 Deliverables

### UI/UX Refinement

- Responsive layouts for desktop and mobile
- Animated cards, modern forms, and notification dropdowns
- Loading screens for route transitions and request lists
- Toast notifications for login, signup, and manager actions

### Advanced Logic

- Manager-side server-backed search
- Status and request-type filtering
- Pagination with page controls
- Document preview for image, PDF, and DOCX files

### Performance and Testing

- Indexed database columns for request listing queries
- Frontend route lazy loading and vendor chunk splitting
- Backend unit tests for query parsing and pagination logic

### Production Readiness

- Vercel-ready frontend deployment setup
- Render backend deployment descriptor
- GitHub Actions CI pipeline for tests and production build verification

### Documentation and Viva Support

- Swagger specification
- Human-readable API docs page
- Postman collection
- This project report for viva explanation

## API Summary

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/requests/create`
- `GET /api/requests`
- `GET /api/requests?advanced=true&search=&status=&type=&page=&pageSize=`
- `PATCH /api/requests/:id/status`
- `PATCH /api/requests/:id/comment`
- `DELETE /api/requests/:id`

## Viva Explanation Points

- Employees and managers are separated through JWT-based role authorization.
- Manager approval data now uses indexed, paginated queries instead of loading the whole table every time.
- React routes are lazy loaded so the initial bundle is smaller and the document viewer is split into a separate chunk.
- Phase 3 adds stronger documentation, testing, and deployment preparation around the existing workflow.
- The current deployment split uses Vercel for the frontend and Render for the backend.
