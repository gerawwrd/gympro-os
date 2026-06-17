import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import api from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const StatCard = ({ icon, label, value, valueColor = 'text-gray-900', bgColor = 'bg-blue-50' }) => (
  <div className="bg-white rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center text-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-0.5 ${valueColor}`}>{value}</p>
    </div>
  </div>
);

const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b', '#ef4444'];

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch {
        console.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout moduleName="Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  const revenueMixData = stats?.revenuePlanMix.filter((p) => p.holders > 0) || [];

  return (
    <AdminLayout moduleName="Dashboard">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Deck Control</h1>
          <p className="text-gray-500 text-sm mt-1">
            GymPro overall facility analytics, attendance thresholds and billing checks.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          ↻ Sync Ecosystem
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard
          icon="👥"
          label="Total Members"
          value={stats?.totalMembers}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon="✅"
          label="Active Cycles"
          value={stats?.activeCycles}
          valueColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon="⏰"
          label="Expired Plans"
          value={stats?.expiredPlans}
          valueColor="text-red-500"
          bgColor="bg-red-50"
        />
        <StatCard
          icon="💰"
          label="Gross Income"
          value={`₱${stats?.grossIncome?.toLocaleString()}`}
          valueColor="text-gray-900"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">🕐</div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Today's Check-ins</p>
              <p className="text-xs text-gray-400">Total count of sessions recorded today.</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.todayCheckIns}</p>
        </div>
        <div className="bg-white rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">⚡</div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Currently Workout Count</p>
              <p className="text-xs text-gray-400">Members inside the facility right now.</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats?.currentlyWorkingOut}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="col-span-2 bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900">Cycle Attendance Index</p>
              <p className="text-xs text-gray-400">Daily facility entries pattern last 7 recorded dates</p>
            </div>
            <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-lg text-gray-600">WEEKLY</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.weeklyAttendance}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl p-5">
          <p className="font-semibold text-gray-900 mb-1">Revenue Plan Mix</p>
          <p className="text-xs text-gray-400 mb-4">Gross distribution of sales by category products</p>
          {revenueMixData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No active plan holders
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={revenueMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="revenue"
                    nameKey="name"
                  >
                    {revenueMixData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₱${value}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {revenueMixData.map((plan, index) => (
                  <div key={plan.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-gray-600">{plan.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">₱{plan.revenue}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};