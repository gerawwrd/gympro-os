import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MembersPage } from './pages/admin/MembersPage';
import { PlansPage } from './pages/admin/PlansPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { MemberQRPage } from './pages/member/MemberQRPage';
import { MemberProfilePage } from './pages/member/MemberProfilePage';

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
          <Route path="/admin/payments" element={
            <ProtectedRoute allowedRoles={['admin']}><PaymentsPage /></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>
          } />

          <Route path="/member/dashboard" element={
            <ProtectedRoute allowedRoles={['member']}><MemberDashboardPage /></ProtectedRoute>
          } />
          <Route path="/member/qr" element={
            <ProtectedRoute allowedRoles={['member']}><MemberQRPage /></ProtectedRoute>
          } />
          <Route path="/member/profile" element={
            <ProtectedRoute allowedRoles={['member']}><MemberProfilePage /></ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
