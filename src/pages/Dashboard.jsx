import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyApplications } from '../store/applicationsSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { mine, mineStatus } = useSelector((s) => s.applications);

  useEffect(() => {
    if (user?.id) dispatch(fetchMyApplications(user.id));
  }, [dispatch, user?.id]);

  return (
    <div className="page dashboard-page">
      <h1>My applications</h1>
      <p className="lede">Roles you have applied to via the REST API.</p>

      {mineStatus === 'loading' && <p className="muted">Loading…</p>}
      {mineStatus === 'succeeded' && mine.length === 0 && (
        <p className="muted">
          You have not applied yet. <Link to="/">Browse jobs</Link>
        </p>
      )}

      {mine.length > 0 && (
        <ul className="applications-list">
          {mine.map((app) => (
            <li key={app.id} className="application-row">
              <div>
                <strong>{app.job?.title ?? 'Job'}</strong>
                <p className="muted">
                  {app.job?.company} · {app.job?.location}
                </p>
              </div>
              <div className="application-meta">
                <span className="job-badge">{app.status}</span>
                <time dateTime={app.appliedAt}>
                  {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : ''}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
