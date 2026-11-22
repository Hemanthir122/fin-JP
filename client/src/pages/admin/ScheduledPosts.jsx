import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Trash2, Edit, Clock, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import api, { aiApi } from '../../utils/api';
import './Admin.css';

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NAV_LINKS = [
    { to: '/admin',                 label: 'Dashboard' },
    { to: '/admin/post-job',        label: 'Post New Job' },
    { to: '/admin/manage-jobs',     label: 'Manage Jobs' },
    { to: '/admin/scheduled-posts', label: '🕐 Scheduled Posts' },
    { to: '/admin/external-jobs',   label: 'External Jobs Database' },
    { to: '/admin/update-company-logo', label: 'Update Company Logo' },
];

// ─── Example JSON shown on first load ────────────────────────────────────────
const EXAMPLE = `[
  {
    "title": "Frontend Developer",
    "company": "Acme Corp",
    "location": "Bangalore, India",
    "type": "job",
    "jobType": "Full Time",
    "experience": "0-2 years",
    "package": "6-10 LPA",
    "batch": "2023, 2024",
    "skills": ["React", "CSS", "JavaScript"],
    "description": "Build great UI...",
    "responsibilities": ["Develop features", "Write tests"],
    "qualifications": ["B.Tech CS or related"],
    "applyLink": "https://example.com/apply",
    "country": "India",
    "scheduledPublishAt": "2026-11-23T10:00:00.000Z"
  },
  {
    "title": "Backend Developer",
    "company": "Beta Ltd",
    "location": "Remote",
    "type": "job",
    "jobType": "Full Time",
    "experience": "1-3 years",
    "package": "8-14 LPA",
    "batch": "2022, 2023",
    "skills": ["Node.js", "MongoDB"],
    "description": "Build scalable APIs...",
    "responsibilities": ["Design endpoints", "Write docs"],
    "qualifications": ["B.Tech CS or related"],
    "applyLink": "https://example.com/apply2",
    "country": "India",
    "scheduledPublishAt": "2026-11-23T14:00:00.000Z"
  },
  {
    "title": "DevOps Engineer",
    "company": "Gamma Inc",
    "location": "Hyderabad",
    "type": "job",
    "jobType": "Full Time",
    "experience": "2-4 years",
    "package": "12-18 LPA",
    "batch": "2021, 2022",
    "skills": ["Docker", "Kubernetes", "AWS"],
    "description": "Manage infra...",
    "responsibilities": ["CI/CD pipelines", "Monitor systems"],
    "qualifications": ["B.Tech CS or related"],
    "applyLink": "https://example.com/apply3",
    "country": "India"
  }
]`;

function ScheduledPosts() {
    const [scheduled, setScheduled]       = useState([]);
    const [loadingList, setLoadingList]   = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Input
    const [jsonText, setJsonText]   = useState(EXAMPLE);
    const [jsonError, setJsonError] = useState('');

    // Submission
    const [submitting, setSubmitting]     = useState(false);
    const [submitResult, setSubmitResult] = useState(null); // { saved, failed, errors }
    const [progress, setProgress]         = useState(null); // { done, total }

    // ─── Parse + live preview ────────────────────────────────────────────────
    const parsed = useMemo(() => {
        try {
            const data = JSON.parse(jsonText);
            if (!Array.isArray(data)) return { items: null, error: 'JSON must be an array [ ... ]' };
            if (data.length > 1000) return { items: null, error: 'Maximum 1000 jobs per batch' };
            return { items: data, error: null };
        } catch (e) {
            return { items: null, error: `Invalid JSON: ${e.message}` };
        }
    }, [jsonText]);

    // Count how many have a future scheduledPublishAt vs immediate
    const previewStats = useMemo(() => {
        if (!parsed.items) return null;
        const now = new Date();
        let scheduled = 0, immediate = 0;
        for (const item of parsed.items) {
            if (item.scheduledPublishAt && new Date(item.scheduledPublishAt) > now) {
                scheduled++;
            } else {
                immediate++;
            }
        }
        return { total: parsed.items.length, scheduled, immediate };
    }, [parsed.items]);

    // ─── Fetch queued scheduled items ────────────────────────────────────────
    const fetchScheduled = async () => {
        try {
            const res = await api.get('/scheduled');
            setScheduled(res.data);
        } catch (err) {
            console.error('Error fetching scheduled posts:', err);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchScheduled(); }, []);

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!parsed.items) return;
        setSubmitting(true);
        setSubmitResult(null);
        setProgress({ done: 0, total: parsed.items.length });

        // Split into chunks of 100 so we don't hit any payload limit
        const CHUNK = 100;
        const agg = { saved: 0, failed: 0, errors: [] };

        for (let i = 0; i < parsed.items.length; i += CHUNK) {
            const chunk = parsed.items.slice(i, i + CHUNK);
            try {
                const res = await aiApi.post('/jobs/bulk', chunk);
                agg.saved  += res.data.saved  || 0;
                agg.failed += res.data.failed || 0;
                agg.errors.push(...(res.data.errors || []));
            } catch (err) {
                agg.failed += chunk.length;
                agg.errors.push({ index: i, error: err.response?.data?.message || err.message });
            }
            setProgress({ done: Math.min(i + CHUNK, parsed.items.length), total: parsed.items.length });
        }

        setSubmitResult(agg);
        setSubmitting(false);
        setProgress(null);
        fetchScheduled();
    };

    // ─── Delete one scheduled item ────────────────────────────────────────────
    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.title || item.company}"?`)) return;
        try {
            await api.delete(`/${item.model === 'walkin' ? 'walkins' : 'jobs'}/${item._id}`);
            fetchScheduled();
        } catch {
            alert('Delete failed. Try again.');
        }
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const fmt = (d) => new Date(d).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const timeUntil = (d) => {
        const diff = new Date(d) - new Date();
        if (diff <= 0) return 'Overdue';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        if (h >= 24) return `in ${Math.floor(h / 24)}d ${h % 24}h`;
        return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
    };

    return (
        <div className="admin-page">
            {/* Sidebar */}
            <div className={`admin-sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="admin-logo">
                    <span className="logo-text">Jobs</span>
                    <span className="logo-accent">Connect</span>
                </div>
                <nav className="admin-nav">
                    {NAV_LINKS.map(({ to, label }) => (
                        <Link key={to} to={to}
                            className={`nav-item${to === '/admin/scheduled-posts' ? ' active' : ''}`}>
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/" className="nav-item back-link">← Back to Site</Link>
                </div>
            </div>
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Main */}
            <div className="admin-content">
                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(v => !v)}>
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1>Bulk Post / Schedule</h1>
                            <p>Paste a JSON array — each job can have its own <code>scheduledPublishAt</code>.</p>
                        </div>
                    </div>
                </div>

                {/* ── Input card ── */}
                <div className="admin-card" style={{ marginBottom: '24px' }}>
                    <div style={{ padding: '20px' }}>

                        {/* Legend */}
                        <div style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
                            padding: '12px 16px', marginBottom: '16px', fontSize: '13px', lineHeight: 1.7,
                        }}>
                            <strong>Format rules:</strong>
                            <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                                <li>Paste a <strong>JSON array</strong> — one object per job, up to 1000 items.</li>
                                <li>Include <code>"scheduledPublishAt": "2026-11-25T09:00:00.000Z"</code> inside any job to schedule it.</li>
                                <li>Jobs <strong>without</strong> that field are published <strong>immediately</strong>.</li>
                                <li>Use ISO 8601 UTC format for times, or your local datetime string.</li>
                            </ul>
                        </div>

                        {/* Textarea */}
                        <textarea
                            value={jsonText}
                            onChange={e => setJsonText(e.target.value)}
                            rows={22}
                            spellCheck={false}
                            placeholder="Paste JSON array here…"
                            style={{
                                width: '100%', fontFamily: 'monospace', fontSize: '12.5px',
                                padding: '12px', borderRadius: '6px', resize: 'vertical',
                                border: parsed.error ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                                background: '#fafafa', boxSizing: 'border-box', lineHeight: 1.5,
                            }}
                        />

                        {/* JSON error */}
                        {parsed.error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                color: '#ef4444', fontSize: '13px', marginTop: '8px',
                            }}>
                                <AlertCircle size={14} /> {parsed.error}
                            </div>
                        )}

                        {/* Live preview bar */}
                        {previewStats && !parsed.error && (
                            <div style={{
                                display: 'flex', flexWrap: 'wrap', gap: '12px',
                                margin: '12px 0', fontSize: '13px',
                            }}>
                                <span style={{
                                    background: '#dbeafe', color: '#1e40af',
                                    padding: '4px 12px', borderRadius: '20px', fontWeight: 600,
                                }}>
                                    {previewStats.total} job{previewStats.total !== 1 ? 's' : ''} total
                                </span>
                                {previewStats.immediate > 0 && (
                                    <span style={{
                                        background: '#dcfce7', color: '#15803d',
                                        padding: '4px 12px', borderRadius: '20px', fontWeight: 600,
                                    }}>
                                        ⚡ {previewStats.immediate} publish immediately
                                    </span>
                                )}
                                {previewStats.scheduled > 0 && (
                                    <span style={{
                                        background: '#fef3c7', color: '#92400e',
                                        padding: '4px 12px', borderRadius: '20px', fontWeight: 600,
                                    }}>
                                        🕐 {previewStats.scheduled} scheduled
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Progress bar */}
                        {progress && (
                            <div style={{ margin: '12px 0' }}>
                                <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                                    Submitting… {progress.done} / {progress.total}
                                </div>
                                <div style={{
                                    height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%', borderRadius: '4px',
                                        background: 'var(--accent-blue, #2563eb)',
                                        width: `${(progress.done / progress.total) * 100}%`,
                                        transition: 'width 0.2s',
                                    }} />
                                </div>
                            </div>
                        )}

                        {/* Result */}
                        {submitResult && (
                            <div style={{
                                margin: '12px 0', padding: '12px 16px', borderRadius: '8px',
                                background: submitResult.failed === 0 ? '#dcfce7' : '#fef9c3',
                                border: `1px solid ${submitResult.failed === 0 ? '#bbf7d0' : '#fde68a'}`,
                                fontSize: '13px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                    <CheckCircle2 size={16} color={submitResult.failed === 0 ? '#15803d' : '#92400e'} />
                                    {submitResult.saved} saved
                                    {submitResult.failed > 0 && `, ${submitResult.failed} failed`}
                                </div>
                                {submitResult.errors.length > 0 && (
                                    <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: '#7c2d12' }}>
                                        {submitResult.errors.slice(0, 10).map((e, i) => (
                                            <li key={i}>Item #{e.index + 1}: {e.error}</li>
                                        ))}
                                        {submitResult.errors.length > 10 && (
                                            <li>…and {submitResult.errors.length - 10} more</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting || !!parsed.error || !parsed.items}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}
                        >
                            <Upload size={16} />
                            {submitting
                                ? `Submitting… ${progress ? `${progress.done}/${progress.total}` : ''}`
                                : `Submit ${previewStats ? previewStats.total + ' job' + (previewStats.total !== 1 ? 's' : '') : ''}`}
                        </button>
                    </div>
                </div>

                {/* ── Upcoming scheduled queue ── */}
                <div className="admin-card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
                        <h2 style={{ margin: 0, fontSize: '16px' }}>
                            Scheduled Queue
                            {!loadingList && (
                                <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>
                                    ({scheduled.length} pending)
                                </span>
                            )}
                        </h2>
                    </div>

                    {loadingList ? (
                        <div className="loading-container"><div className="spinner" /></div>
                    ) : scheduled.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Clock size={36} style={{ color: '#ccc', marginBottom: '10px' }} />
                            <p>Nothing in the queue yet.</p>
                        </div>
                    ) : (
                        <div className="jobs-table-container">
                            <table className="jobs-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title / Company</th>
                                        <th>Type</th>
                                        <th>Scheduled For</th>
                                        <th>Countdown</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scheduled.map((item, idx) => (
                                        <tr key={item._id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                                            <td>
                                                <strong>{item.title || item.company}</strong>
                                                {item.title && (
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.company}</div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${item.type || 'job'}`}>
                                                    {item.type === 'walkin' ? 'Walk-in'
                                                        : item.type === 'internship' ? 'Internship'
                                                        : 'Full Time'}
                                                </span>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                                                {item.scheduledPublishAt ? fmt(item.scheduledPublishAt) : '—'}
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    color: new Date(item.scheduledPublishAt) <= new Date() ? '#ef4444' : '#2563eb',
                                                    fontSize: '13px', fontWeight: 500,
                                                }}>
                                                    <Clock size={12} />
                                                    {item.scheduledPublishAt ? timeUntil(item.scheduledPublishAt) : '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <Link
                                                        to={`/admin/edit-job/${item._id}?type=${item.type || 'job'}`}
                                                        className="table-btn table-btn-edit"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </Link>
                                                    <button
                                                        className="table-btn table-btn-delete"
                                                        onClick={() => handleDelete(item)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info box */}
                <div style={{
                    marginTop: '24px', background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: '8px', padding: '16px 20px',
                }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#1e40af' }}>
                        ℹ️ How it works
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e3a8a', lineHeight: 1.8 }}>
                        <li>Jobs <strong>with</strong> <code>scheduledPublishAt</code> → saved as <em>scheduled</em>, published automatically when time arrives.</li>
                        <li>Jobs <strong>without</strong> it → published immediately + Telegram notification sent.</li>
                        <li>Scheduler checks every <strong>5 minutes</strong> (Vercel Cron: <code>/api/cron/publish-scheduled</code>).</li>
                        <li>Bulk submit processes jobs in chunks of 100, so 1000 jobs takes a few seconds.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ScheduledPosts;
