import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const CreateRequest = lazy(() => import("./pages/CreateRequest"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const ManagerApproval = lazy(() => import("./pages/ManagerApproval"));
const ManagerRequestView = lazy(() => import("./pages/ManagerRequestView"));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen label="Loading application..." />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/create-request" element={<CreateRequest />} />
          <Route path="/my-requests" element={<MyRequests />} />

          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/manager-approval" element={<ManagerApproval />} />
          <Route path="/manager-approval/:id" element={<ManagerApproval />} />
          <Route path="/manager-approval/:id/view" element={<ManagerRequestView />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
