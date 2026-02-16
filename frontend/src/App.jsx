import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import RoleSelection from './pages/RoleSelection';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import StaffProfile from './pages/StaffProfile';
import MyIDCard from './pages/MyIDCard';
import AuditLogs from './pages/AuditLogs';
import AdminVisitors from './pages/AdminVisitors';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/profile" element={<StaffProfile />} />
              <Route path="/my-id" element={<MyIDCard />} />

              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route index element={<AdminDashboard />} />
                <Route path="visitors" element={<AdminVisitors />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>

              <Route path="/security" element={<ProtectedRoute allowedRoles={['security']} />}>
                <Route index element={<SecurityDashboard />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<RoleSelection />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
