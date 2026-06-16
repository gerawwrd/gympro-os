import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import api from '../../api/axios';
import { RegisterMemberModal } from '../../components/ui/RegisterMemberModal';
import { EditMemberModal } from '../../components/ui/EditMemberModal';

export const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const fetchMembers = async (searchTerm = '', statusFilter = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      const res = await api.get(`/members?${params.toString()}`);
      setMembers(res.data.members);
    } catch {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const load = async () => {
    await fetchMembers();
  };
  load();
}, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchMembers(val, filter);
  };

  const handleFilter = (val) => {
    setFilter(val);
    fetchMembers(search, val);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete member ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/members/${id}`);
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert('Failed to delete member');
    }
  };

  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiredCount = members.filter((m) => m.status === 'expired').length;

  return (
    <AdminLayout moduleName="Members">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members Matrix Registry</h1>
          <p className="text-gray-500 text-sm mt-1">
            Audit profiles, issue barcode identifiers, register subscriptions and verify payment balances.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          + Register New Athlete
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by code, name or phone..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <div className="flex gap-2">
          {['all', 'active', 'expired'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {f === 'all'
                ? `ALL ATHLETES (${members.length})`
                : f === 'active'
                ? `ACTIVE (${activeCount})`
                : `EXPIRED (${expiredCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {['Athletes Name & Code', 'Active Plan', 'Expiration Limit', 'Mobile Contacts', 'Status Flag', 'Operations'].map((h) => (
            <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading members...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No members found.</div>
        ) : (
          members.map((member) => (
            <div
              key={member._id}
              className="grid grid-cols-6 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors"
            >
              {/* Name & Code */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {member.profileImage ? (
                    <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                      {member.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {member.memberCode}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{member.gender}</span>
                  </div>
                </div>
              </div>

              {/* Active Plan */}
              <p className="text-sm text-gray-700">
                {member.currentPlan?.name || 'None'}
              </p>

              {/* Expiration */}
              <p className="text-sm text-gray-700">
                {member.planExpiresAt
                  ? new Date(member.planExpiresAt).toLocaleDateString('en-CA')
                  : 'N/A'}
              </p>

              {/* Contact */}
              <div>
                <p className="text-sm text-gray-700">{member.phone || '—'}</p>
                <p className="text-xs text-gray-400">{member.email}</p>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  member.status === 'active'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    member.status === 'active' ? 'bg-green-500' : 'bg-red-400'
                  }`}></span>
                  {member.status?.toUpperCase()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert(`View ${member.name}`)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="View"
                >
                  👁
                </button>
                <button
                  onClick={() => setEditingMember(member)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(member._id, member.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    {showRegisterModal && (
  <RegisterMemberModal
    onClose={() => setShowRegisterModal(false)}
    onSuccess={() => fetchMembers(search, filter)}
  />
)}
    {editingMember && (
  <EditMemberModal
    member={editingMember}
    onClose={() => setEditingMember(null)}
    onSuccess={() => fetchMembers(search, filter)}
  />
)}
    </AdminLayout>
  );
};