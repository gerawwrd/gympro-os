import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import api from '../../api/axios';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const tabs = ['ATTENDANCE SHEETS', 'REVENUE AUDITS', 'MEMBERSHIP REGISTERS'];

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/reports');
        setData(res.data);
      } catch {
        console.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportCSV = () => {
    if (!data) return;
    let rows = [];
    let filename = '';

    if (activeTab === 0) {
      filename = 'attendance_report.csv';
      rows = data.attendance.recentSessions.map((s) => ({
        Member: s.member?.name,
        Code: s.memberCode,
        CheckIn: new Date(s.checkInTime).toLocaleString(),
        CheckOut: s.checkOutTime ? new Date(s.checkOutTime).toLocaleString() : 'Active',
        Duration: s.duration ? `${s.duration} mins` : '-',
      }));
    } else if (activeTab === 1) {
      filename = 'revenue_report.csv';
      rows = data.revenue.payments.map((p) => ({
        Reference: p.referenceId,
        Member: p.memberName,
        Code: p.memberCode,
        Plan: p.planName,
        Amount: `P${p.planPrice}`,
        Method: p.paymentMethod,
        Date: new Date(p.paidAt).toLocaleString(),
      }));
    } else {
      filename = 'membership_report.csv';
      rows = data.membership.membersChecklist.map((m) => ({
        Code: m.memberCode,
        Name: m.name,
        Email: m.email,
        Plan: m.currentPlan?.name || 'None',
        Expiration: m.planExpiresAt ? new Date(m.planExpiresAt).toLocaleDateString() : 'N/A',
        Status: m.currentPlan && m.planExpiresAt && new Date(m.planExpiresAt) > new Date() ? 'ACTIVE' : 'EXPIRED',
      }));
    }

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const now = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('GymPro Elite Fit', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report generated: ${now}`, 14, 22);

    if (activeTab === 0) {
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Attendance Sheets Report', 14, 32);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Total Visits: ${data.attendance.totalVisits} | Avg Duration: ${data.attendance.avgDuration} mins`, 14, 39);
      autoTable(doc, {
        startY: 45,
        head: [['Athlete', 'Code', 'Check-In', 'Check-Out', 'Duration']],
        body: data.attendance.recentSessions.map((s) => [
          s.member?.name || '-',
          s.memberCode,
          new Date(s.checkInTime).toLocaleString(),
          s.checkOutTime ? new Date(s.checkOutTime).toLocaleString() : 'Active',
          s.duration ? `${s.duration} mins` : '-',
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
      });
      doc.save('attendance_report.pdf');

    } else if (activeTab === 1) {
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Revenue Audits Report', 14, 32);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Total Revenue: P${data.revenue.totalRevenue.toLocaleString()} | Invoices: ${data.revenue.totalInvoices}`, 14, 39);
      autoTable(doc, {
        startY: 45,
        head: [['Reference', 'Member', 'Code', 'Plan', 'Method', 'Amount', 'Date']],
        body: data.revenue.payments.map((p) => [
          p.referenceId,
          p.memberName,
          p.memberCode,
          p.planName,
          p.paymentMethod,
          `P${p.planPrice}`,
          new Date(p.paidAt).toLocaleDateString(),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
      });
      doc.save('revenue_report.pdf');

    } else {
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Membership Registers Report', 14, 32);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Total: ${data.membership.totalMembers} | Active: ${data.membership.activeMembers} | Expired: ${data.membership.expiredMembers}`, 14, 39);
      autoTable(doc, {
        startY: 45,
        head: [['Code', 'Name', 'Email', 'Plan', 'Expiration', 'Status']],
        body: data.membership.membersChecklist.map((m) => {
          const isActive = m.currentPlan && m.planExpiresAt && new Date(m.planExpiresAt) > new Date();
          return [
            m.memberCode,
            m.name,
            m.email,
            m.currentPlan?.name || 'None',
            m.planExpiresAt ? new Date(m.planExpiresAt).toLocaleDateString() : 'N/A',
            isActive ? 'ACTIVE' : 'EXPIRED',
          ];
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
      });
      doc.save('membership_report.pdf');
    }
  };

  return (
    <AdminLayout moduleName="Reports">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ecosystem Reports Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate diagnostic spreadsheets, review annual sales curves, and check attendance metrics.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
        >
          ↻
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl p-1 flex items-center justify-between mb-6">
        <div className="flex">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors ${
                activeTab === i ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pr-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-600"
          >
            Export to CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700"
          >
            Download Report (PDF)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading reports...</p>
        </div>
      ) : (
        <>
          {activeTab === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-gray-900 rounded-xl p-5">
                  <p className="font-semibold text-white mb-1">Peak Workout Hours Index</p>
                  <p className="text-xs text-gray-400 mb-4">Statistical hourly distribution of check-in times</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.attendance.peakHours}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1f2937', border: 'none', color: '#fff', fontSize: 12 }} />
                      <Area type="monotone" dataKey="count" stroke="#ef4444" fill="url(#areaGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-900 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Biometric Check KPIs</p>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">Total Visits Logged:</p>
                    <p className="text-2xl font-bold text-white mt-1">{data.attendance.totalVisits} Sessions</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">In-Gym Active:</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{data.attendance.activeSessions} Athletes</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">Average Workout Time:</p>
                    <p className="text-2xl font-bold text-white mt-1">{data.attendance.avgDuration} Minutes</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-5">
                <p className="font-semibold text-white mb-4">Access Times Checklist ({data.attendance.recentSessions.length})</p>
                <div className="grid grid-cols-4 pb-2 border-b border-gray-700 mb-2">
                  {['Athlete', 'Check-In', 'Check-Out', 'Duration'].map((h) => (
                    <p key={h} className="text-xs font-semibold text-gray-500 uppercase">{h}</p>
                  ))}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.attendance.recentSessions.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">No sessions recorded yet.</p>
                  ) : (
                    data.attendance.recentSessions.map((s) => (
                      <div key={s._id} className="grid grid-cols-4 py-2 border-b border-gray-800 text-sm">
                        <p className="text-white">{s.member?.name} ({s.memberCode})</p>
                        <p className="text-gray-300">{new Date(s.checkInTime).toLocaleString()}</p>
                        <p className="text-gray-300">{s.checkOutTime ? new Date(s.checkOutTime).toLocaleString() : '-'}</p>
                        <p className="text-gray-300">{s.duration ? `${s.duration} mins` : '-'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-gray-900 rounded-xl p-5">
                  <p className="font-semibold text-white mb-1">Revenues Curve Trends</p>
                  <p className="text-xs text-gray-400 mb-4">Chronological revenue progression accumulative sums</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.revenue.revenueTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1f2937', border: 'none', color: '#fff', fontSize: 12 }} formatter={(v) => `P${v}`} />
                      <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-900 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Ledger Metrics</p>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">Gross Cashflow:</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">P{data.revenue.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">Sales Transaction Volume:</p>
                    <p className="text-2xl font-bold text-white mt-1">{data.revenue.totalInvoices} Invoices</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">Average Invoice Value:</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">P{data.revenue.avgInvoice}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-5">
                <p className="font-semibold text-white mb-4">Payments Checklist Ledger ({data.revenue.totalInvoices})</p>
                <div className="grid grid-cols-5 pb-2 border-b border-gray-700 mb-2">
                  {['Invoice Ref', 'Athlete', 'Contract Plan', 'Receipt Way', 'Gross Value'].map((h) => (
                    <p key={h} className="text-xs font-semibold text-gray-500 uppercase">{h}</p>
                  ))}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.revenue.payments.map((p) => (
                    <div key={p._id} className="grid grid-cols-5 py-2 border-b border-gray-800 text-sm items-center">
                      <p className="text-yellow-400 font-mono">{p.referenceId}</p>
                      <p className="text-white">{p.memberName} ({p.memberCode})</p>
                      <p className="text-gray-300">{p.planName}</p>
                      <span className="inline-block border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-300 uppercase w-fit">
                        {p.paymentMethod}
                      </span>
                      <p className="text-green-400 font-semibold">P{p.planPrice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-gray-900 rounded-xl p-5">
                  <p className="font-semibold text-white mb-2">Biological Genders Mix</p>
                  <p className="text-xs text-gray-400 mb-4">Statistical division of physical profiles in registry</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Male Ratio', value: data.membership.genderMix.male, color: 'text-blue-400' },
                      { label: 'Female Ratio', value: data.membership.genderMix.female, color: 'text-pink-400' },
                      { label: 'Other Ratio', value: data.membership.genderMix.other, color: 'text-yellow-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}:</p>
                        <p className={`text-3xl font-bold ${color}`}>{value.percent}%</p>
                        <p className="text-xs text-gray-500 mt-1">({value.count} total)</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contract Counters</p>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">Active Athletes Card:</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{data.membership.activeMembers} Athletes</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase">Expired Contracts:</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{data.membership.expiredMembers} expired</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-5">
                <p className="font-semibold text-white mb-4">Members Profiles Checklist ({data.membership.totalMembers})</p>
                <div className="grid grid-cols-5 pb-2 border-b border-gray-700 mb-2">
                  {['Code / Name', 'Email Link', 'Plan Active', 'Expiration Date', 'Subscription Status'].map((h) => (
                    <p key={h} className="text-xs font-semibold text-gray-500 uppercase">{h}</p>
                  ))}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.membership.membersChecklist.map((m) => {
                    const isActive = m.currentPlan && m.planExpiresAt && new Date(m.planExpiresAt) > new Date();
                    return (
                      <div key={m._id} className="grid grid-cols-5 py-2 border-b border-gray-800 text-sm items-center">
                        <p className="text-white font-mono">{m.memberCode} - {m.name}</p>
                        <p className="text-gray-400 text-xs">{m.email}</p>
                        <p className="text-gray-300">{m.currentPlan?.name || 'None'}</p>
                        <p className="text-gray-300">{m.planExpiresAt ? new Date(m.planExpiresAt).toLocaleDateString() : 'N/A'}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-fit ${
                          isActive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                        }`}>
                          {isActive ? 'ACTIVE' : 'EXPIRED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};
