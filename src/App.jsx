import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MembersPage } from './pages/admin/MembersPage';
import { PlansPage } from './pages/admin/PlansPage';
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute allowedRoles={['admin']}><MembersPage /></ProtectedRoute>
          } />
          <Route path="/admin/plans" element={
            <ProtectedRoute allowedRoles={['admin']}><PlansPage /></ProtectedRoute>
          } />

          <Route path="/member/dashboard" element={
            <ProtectedRoute allowedRoles={['member']}><MemberDashboardPage /></ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;