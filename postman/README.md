Postman Phase 2 Evidence

1. Start backend:
`cd backend && npm run restart`

2. Import collection:
`postman/Digital_Approval_Workflow_Phase2.postman_collection.json`

3. In Postman Collection Runner, run requests in order `1 -> 11`.

4. If signup/login fails, update these collection variables:
- `employee_email`
- `employee_password`
- `manager_email`
- `manager_password`

5. Capture screenshots for submission:
- Collection run summary with all tests passed
- `Login Employee` response showing JWT token
- `Create Request` response showing created `id`
- `Approve Request` response
- `Delete Request` response
