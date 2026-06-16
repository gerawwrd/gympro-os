import { useAuth } from '../../context/AuthContext';

export const MemberDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Member Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {user?.name}</p>
      <button
        onClick={logout}
        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Sign Out
      </button>
    </div>
  );
};