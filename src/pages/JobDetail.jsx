import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../store/jobsSlice';
import { applyToJob, clearApplyError, fetchMyApplications } from '../store/applicationsSlice';
import { useNotification } from '../context/useNotification';

export default function JobDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const user = useSelector((s) => s.auth.user);
  const { currentJob, currentStatus, currentError } = useSelector((s) => s.jobs);
  const { mine, applyStatus, applyError } = useSelector((s) => s.applications);

  useEffect(() => {
    if (id) dispatch(fetchJobById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMyApplications(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    dispatch(clearApplyError());
  }, [dispatch, id]);

  const alreadyApplied = useMemo(
    () => mine.some((a) => String(a.jobId) === String(id)),
    [mine, id]
  );

  const handleApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    try {
      await dispatch(applyToJob({ jobId: id, userId: user.id })).unwrap();
      showToast('Application submitted successfully.', 'success');
      dispatch(fetchMyApplications(user.id));
    } catch (e) {
      showToast(typeof e === 'string' ? e : 'Could not apply.', 'error');
    }
  };

  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return <p className="muted padded">Loading job…</p>;
  }

  if (currentStatus === 'failed') {
    return (
      <div className="page padded">
        <p className="banner banner-error">{currentError}</p>
        <Link to="/">Back to listings</Link>
      </div>
    );
  }

  const job = currentJob;
  if (!job) return null;

  return (
    <div className="page job-detail">
      <Link to="/" className="back-link">
        ← All jobs
      </Link>
      <article className="job-detail-card">
        <header className="job-detail-head">
          <div>
            <h1>{job.title}</h1>
            <p className="job-company-lg">{job.company}</p>
          </div>
          <span className="job-badge">{job.employmentType}</span>
        </header>
        <dl className="job-facts">
          <div>
            <dt>Location</dt>
            <dd>{job.location}</dd>
          </div>
          <div>
            <dt>Compensation</dt>
            <dd>{job.salaryRange}</dd>
          </div>
          <div>
            <dt>Posted</dt>
            <dd>{job.postedAt}</dd>
          </div>
        </dl>
        <section className="job-body">
          <h2>Description</h2>
          <p>{job.description}</p>
        </section>
        <div className="job-apply-row">
          {applyError && <p className="inline-error">{applyError}</p>}
          {alreadyApplied ? (
            <p className="muted">You have already applied to this job.</p>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={applyStatus === 'loading'}
              onClick={handleApply}
            >
              {applyStatus === 'loading' ? 'Submitting…' : user ? 'Apply now' : 'Log in to apply'}
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
