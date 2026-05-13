import { Link } from 'react-router-dom';

export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <div className="job-card-head">
        <h2>
          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
        </h2>
        <span className="job-badge">{job.employmentType}</span>
      </div>
      <p className="job-company">{job.company}</p>
      <p className="job-meta">
        {job.location} · {job.salaryRange}
      </p>
      <p className="job-desc-preview">{job.description}</p>
      <div className="job-card-foot">
        <span className="job-posted">Posted {job.postedAt}</span>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
          View & apply
        </Link>
      </div>
    </article>
  );
}
