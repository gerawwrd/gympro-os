import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import api from '../../api/axios';

const PlanCard = ({ plan, isBestValue }) => (
  <div className={`bg-white rounded-xl p-6 relative ${
    isBestValue ? 'ring-2 ring-blue-500' : 'border border-gray-100'
  }`}>
    {isBestValue && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          BEST VALUE PLAN
        </span>
      </div>
    )}

    {/* Plan Header */}
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        {plan.name}
      </p>
      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
        {plan.durationDays} Days
      </span>
    </div>

    {/* Price */}
    <p className="text-4xl font-bold text-gray-900 mb-4">
      ₱{plan.price.toLocaleString()}
      <span className="text-sm font-normal text-gray-400 ml-1">/ cycle</span>
    </p>

    {/* Stats */}
    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">👥</span>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Active Holders</p>
          <p className="text-sm font-bold text-gray-900">{plan.activeHolders} Athletes</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">Total Sales</p>
        <p className="text-sm font-bold text-green-600">
          ↑ ₱{(plan.activeHolders * plan.price).toLocaleString()}
        </p>
      </div>
    </div>

    {/* Perks */}
    <ul className="space-y-2">
      {plan.perks?.map((perk, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
          {perk}
        </li>
      ))}
    </ul>
  </div>
);

export const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/plans');
        setPlans(res.data.plans);
      } catch {
        setError('Failed to load membership plans');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout moduleName="Memberships">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Membership Subscriptions System
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure pricing blueprints, track sales per product category and assign active gym plans.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading plans...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg">{error}</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              isBestValue={plan.name === 'Monthly Pass'}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
};