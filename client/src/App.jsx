import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MembersPage } from './pages/admin/MembersPage';
import { PlansPage } from './pages/admin/PlansPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { MemberQRPage } from './pages/member/MemberQRPage';

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
          <Route path="/admin/attendance" element={
            <ProtectedRoute allowedRoles={['admin']}><AttendancePage /></ProtectedRoute>
          } />

          <Route path="/member/dashboard" element={
            <ProtectedRoute allowedRoles={['member']}><MemberDashboardPage /></ProtectedRoute>
          } />
          <Route path="/member/qr" element={
            <ProtectedRoute allowedRoles={['member']}><MemberQRPage /></ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
