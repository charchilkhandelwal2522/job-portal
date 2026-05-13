import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createJob,
  deleteJob,
  fetchAllJobsAdmin,
  updateJob,
} from '../store/jobsSlice';
import { fetchAllApplicationsAdmin } from '../store/applicationsSlice';

const emptyJob = {
  title: '',
  company: '',
  location: '',
  employmentType: 'Full-time',
  salaryRange: '',
  description: '',
  postedAt: new Date().toISOString().slice(0, 10),
};

const TYPES = ['Full-time', 'Part-time', 'Contract'];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { adminList, adminStatus } = useSelector((s) => s.jobs);
  const { all, allStatus } = useSelector((s) => s.applications);
  const [tab, setTab] = useState('jobs');
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAllJobsAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (tab === 'applications') {
      dispatch(fetchAllApplicationsAdmin());
    }
  }, [dispatch, tab]);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      employmentType: job.employmentType,
      salaryRange: job.salaryRange,
      description: job.description,
      postedAt: job.postedAt,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyJob);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await dispatch(updateJob({ id: editingId, ...form })).unwrap();
      } else {
        await dispatch(createJob({ ...form })).unwrap();
      }
      handleCancelEdit();
      dispatch(fetchAllJobsAdmin());
    } catch {
      window.alert('Could not save job. Check the API server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job? Applications may still reference it in this demo.')) {
      return;
    }
    try {
      await dispatch(deleteJob(id)).unwrap();
      dispatch(fetchAllJobsAdmin());
    } catch {
      window.alert('Delete failed.');
    }
  };

  return (
    <div className="page admin-page">
      <h1>Admin</h1>
      <p className="lede">Manage jobs and review applications from the REST API.</p>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === 'jobs' ? 'tab active' : 'tab'}
          onClick={() => setTab('jobs')}
        >
          Jobs
        </button>
        <button
          type="button"
          className={tab === 'applications' ? 'tab active' : 'tab'}
          onClick={() => setTab('applications')}
        >
          Applications
        </button>
      </div>

      {tab === 'jobs' && (
        <>
          <section className="admin-form-section">
            <h2>{editingId ? 'Edit job' : 'Add job'}</h2>
            <form className="admin-job-form" onSubmit={handleSubmit}>
              <div className="filters-row">
                <label className="field">
                  <span>Title</span>
                  <input required value={form.title} onChange={setField('title')} />
                </label>
                <label className="field">
                  <span>Company</span>
                  <input required value={form.company} onChange={setField('company')} />
                </label>
                <label className="field">
                  <span>Location</span>
                  <input required value={form.location} onChange={setField('location')} />
                </label>
              </div>
              <div className="filters-row">
                <label className="field">
                  <span>Type</span>
                  <select value={form.employmentType} onChange={setField('employmentType')}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Salary range</span>
                  <input required value={form.salaryRange} onChange={setField('salaryRange')} />
                </label>
                <label className="field">
                  <span>Posted date</span>
                  <input type="date" required value={form.postedAt} onChange={setField('postedAt')} />
                </label>
              </div>
              <label className="field field-block">
                <span>Description</span>
                <textarea required rows={4} value={form.description} onChange={setField('description')} />
              </label>
              <div className="filters-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update job' : 'Create job'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-ghost" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <h2>All jobs ({adminList.length})</h2>
            {adminStatus === 'loading' && <p className="muted">Loading…</p>}
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {adminList.map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.employmentType}</td>
                      <td>{job.location}</td>
                      <td className="table-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(job)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(job.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === 'applications' && (
        <section>
          <h2>Applications ({all.length})</h2>
          {allStatus === 'loading' && <p className="muted">Loading…</p>}
          {allStatus === 'succeeded' && all.length === 0 && (
            <p className="muted">No applications yet.</p>
          )}
          {all.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((app) => (
                    <tr key={app.id}>
                      <td>{app.user?.name ?? '—'}</td>
                      <td>{app.user?.email ?? '—'}</td>
                      <td>{app.job?.title ?? app.jobId}</td>
                      <td>{app.status}</td>
                      <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
