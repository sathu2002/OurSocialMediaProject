import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { MdAdd, MdDelete, MdAutoGraph, MdAutoAwesome } from 'react-icons/md';

const AnalyticsDashboard = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    platform: 'Facebook',
    campaignName: '',
    reach: '',
    impressions: '',
    engagement: '',
    clicks: '',
    conversions: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let analyticsUrl = '/analytics';

      // Clients only see their own analytics
      if (user.role === 'Client') {
        // Find own client profile first then load analytics for them
        const clientRes = await api.get('/clients');
        const me = clientRes.data.find(c => c.email === user.email);
        if (me) analyticsUrl = `/analytics/client/${me._id}`;
      }

      const [aRes, cRes] = await Promise.all([
        api.get(analyticsUrl),
        user.role !== 'Client' ? api.get('/clients') : Promise.resolve({ data: [] })
      ]);

      setRecords(Array.isArray(aRes.data) ? aRes.data : []);
      setClients(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      // Backend requires reportMonth (YYYY-MM), so derive it from startDate or current date
      if (payload.startDate) {
        payload.reportMonth = payload.startDate.substring(0, 7);
      } else {
        const d = new Date();
        payload.reportMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      await api.post('/analytics', payload);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add analytics record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this analytics record?')) {
      try {
        await api.delete(`/analytics/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting record');
      }
    }
  };

  const generateAIReport = async () => {
    if (records.length === 0) return alert('No analytics data to analyze.');
    setGeneratingReport(true);
    try {
      const { data } = await api.post('/ai/analytics-insight', { analytics: records.slice(0, 10) });
      setAiReport(data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Prepare chart data
  const chartData = records.slice(0, 8).map(r => ({
    name: r.campaignName?.slice(0, 12) || r.platform,
    Reach: r.reach,
    Engagement: r.engagement,
    Clicks: r.clicks,
    Conversions: r.conversions
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <MdAutoGraph className="mr-3 text-purple-500" /> Analytics Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Campaign performance metrics and AI-generated insights.</p>
        </div>
        {user.role !== 'Client' && (
          <button
            onClick={() => { setFormData({ clientId: '', platform: 'Facebook', campaignName: '', reach: '', impressions: '', engagement: '', clicks: '', conversions: '', startDate: '', endDate: '' }); setIsModalOpen(true); }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 shadow-md flex items-center space-x-2"
          >
            <MdAdd size={24} /> <span>Log Campaign</span>
          </button>
        )}
      </div>

      {/* Charts */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-bold text-slate-700 mb-6 text-lg">Reach vs Engagement</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Reach" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Engagement" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-bold text-slate-700 mb-6 text-lg">Clicks & Conversions Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Clicks" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Conversions" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights Banner */}
      {user.role !== 'Client' && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center mb-1">
                <MdAutoAwesome className="text-purple-500 mr-2" /> AI Campaign Analysis
              </h2>
              <p className="text-sm text-slate-500 max-w-xl">Let the AI analyze this campaign data and suggest improvements for future performance.</p>
            </div>
            {!aiReport && (
              <button
                onClick={generateAIReport}
                disabled={generatingReport}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 shrink-0 ml-4"
              >
                {generatingReport ? 'Analyzing...' : 'Generate AI Report'}
              </button>
            )}
          </div>
          {aiReport && (
            <div className="mt-4 bg-white rounded-xl p-5 border border-purple-100 shadow-sm text-slate-700 text-sm leading-relaxed">
              {aiReport.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-700">Campaign Records ({records.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-100 text-slate-500 font-bold tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Reach</th>
                <th className="px-6 py-4">Engagement</th>
                <th className="px-6 py-4">Clicks</th>
                <th className="px-6 py-4">Conversions</th>
                {user.role !== 'Client' && <th className="px-6 py-4 text-right">Del</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map(r => (
                <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{r.campaignName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-bold text-xs">{r.platform}</span>
                  </td>
                  <td className="px-6 py-4 font-mono">{r.reach?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">{r.engagement?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">{r.clicks?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-emerald-600 font-bold">{r.conversions?.toLocaleString()}</td>
                  {user.role !== 'Client' && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors">
                        <MdDelete size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-slate-400 font-bold">No analytics records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Campaign Analytics">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Client</label>
              <select required value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold">
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Platform</label>
              <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold cursor-pointer">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Google Ads', 'TikTok', 'Email'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Campaign Name</label>
            <input required type="text" value={formData.campaignName} onChange={e => setFormData({ ...formData, campaignName: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Summer Sale 2024" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {['reach', 'impressions', 'engagement', 'clicks', 'conversions'].map(field => (
              <div key={field}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{field}</label>
                <input type="number" min="0" value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" placeholder="0" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100">Cancel</button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-2.5 rounded-lg shadow-md">Save Analytics</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnalyticsDashboard;
