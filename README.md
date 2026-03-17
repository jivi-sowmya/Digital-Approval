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

- Backend deploys to Render using [render.yaml](c:\Users\jivis\OneDrive\Desktop\Digital Approval Workflow\render.yaml)
- Frontend deploys to Vercel using [vercel.json](c:\Users\jivis\OneDrive\Desktop\Digital Approval Workflow\frontend-react\vercel.json)
- `.github/workflows/ci.yml` runs backend tests and frontend build on push and pull request

### Render Backend

- Service root: `backend`
- Set backend env vars:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGIN`

`CORS_ORIGIN` should be your Vercel frontend URL, for example:

```text
https://digital-approval-workflow.vercel.app
```

### Vercel Frontend

- Project root: `frontend-react`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Set frontend env var:

```text
VITE_API_URL=https://your-render-backend.onrender.com
```

## Environment Variables

Backend requires:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGIN`

Frontend optional variable:

- `VITE_API_URL`

