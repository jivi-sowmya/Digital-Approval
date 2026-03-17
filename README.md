# Digital Approval Workflow

Phase 3 full-stack web application for employee request submission and manager approval workflows.

## Phase 3 Coverage

- UI/UX refinement with responsive React pages, animated cards, loaders, and toast feedback
- Advanced logic with manager-side search, status/type filters, pagination, and document preview support
- Performance improvements with backend query indexes, lazy-loaded routes, and manual frontend chunk splitting
- Testing with backend unit tests using Node's built-in test runner
- Deployment-ready setup with SPA serving from Express, `render.yaml`, and GitHub Actions CI
- Documentation via Swagger spec, API docs page, Postman collection, and project report

## Run Locally

### Backend

```powershell
cd backend
npm install
npm start
```

### Frontend

```powershell
cd frontend-react
npm install
npm run build
```

The backend serves the production frontend from `frontend-react/dist` after the frontend build is generated.

## Scripts

### Backend

- `npm start`
- `npm test`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`

## API Documentation

- Local API docs page: `http://localhost:5000/api/docs/`
- Swagger spec: `http://localhost:5000/api/docs/swagger.json`
- Postman collection: [postman/Digital_Approval_Workflow_Phase2.postman_collection.json](c:\Users\jivis\OneDrive\Desktop\Digital Approval Workflow\postman\Digital_Approval_Workflow_Phase2.postman_collection.json)

## Deployment

- `render.yaml` defines a Render web service for the combined Express + React build
- `.github/workflows/ci.yml` runs backend tests and frontend build on push and pull request

## Environment Variables

Backend requires:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

Frontend optional variable:

- `VITE_API_URL`

