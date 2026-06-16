import { AdminLayout } from '../../components/layout/AdminLayout';

export const DashboardPage = () => {
  return (
    <AdminLayout moduleName="Dashboard">
      <h1 className="text-2xl font-bold text-gray-900">System Deck Control</h1>
      <p className="text-gray-500 text-sm mt-1">
        GymPro overall facility analytics, attendance thresholds and billing checks.
      </p>
      <div className="mt-6 text-gray-400">
        Dashboard content coming soon...
      </div>
    </AdminLayout>
  );
};