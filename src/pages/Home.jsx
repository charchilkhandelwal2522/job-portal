import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, setJobFilters, setJobPage, resetJobFilters } from '../store/jobsSlice';
import JobCard from '../components/JobCard';
import PaginationBar from '../components/PaginationBar';

const EMPLOYMENT_TYPES = ['', 'Full-time', 'Part-time', 'Contract'];

export default function Home() {
  const dispatch = useDispatch();
  const { list, page, pages, total, perPage, filters, listStatus, listError } = useSelector(
    (s) => s.jobs
  );

  const [localQ, setLocalQ] = useState(filters.q);
  const [localLocation, setLocalLocation] = useState(filters.location);

  useEffect(() => {
    dispatch(
      fetchJobs({
        page,
        perPage,
        q: filters.q,
        employmentType: filters.employmentType,
        location: filters.location,
      })
    );
  }, [dispatch, page, perPage, filters.q, filters.employmentType, filters.location]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(
      setJobFilters({
        q: localQ,
        location: localLocation,
      })
    );
  };

  const handleTypeChange = (e) => {
    dispatch(setJobFilters({ employmentType: e.target.value }));
  };

  const handleReset = () => {
    setLocalQ('');
    setLocalLocation('');
    dispatch(resetJobFilters());
  };

  return (
    <div className="page home-page">
      <section className="hero-block">
        <h1>Find your next role</h1>
        <p className="lede">
          Browse live listings from a REST API with search, filters, and pagination.
        </p>
      </section>

      <form className="filters-card" onSubmit={handleSearch}>
        <div className="filters-row">
          <label className="field">
            <span>Keywords</span>
            <input
              type="search"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder="Title, company, or description"
              autoComplete="off"
            />
          </label>
          <label className="field">
            <span>Location</span>
            <input
              type="text"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              placeholder="e.g. Remote, Lagos, London"
              autoComplete="off"
            />
          </label>
          <label className="field">
            <span>Employment type</span>
            <select value={filters.employmentType} onChange={handleTypeChange}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t || 'any'} value={t}>
                  {t || 'Any'}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="filters-actions">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            Reset filters
          </button>
        </div>
      </form>

      {listStatus === 'failed' && (
        <p className="banner banner-error" role="alert">
          {listError}. Is the API running? Use <code>npm run dev:full</code>.
        </p>
      )}

      {listStatus === 'loading' && <p className="muted">Loading jobs…</p>}

      {listStatus === 'succeeded' && !list.length && (
        <p className="muted">No jobs match your filters.</p>
      )}

      <ul className="job-grid">
        {list.map((job) => (
          <li key={job.id}>
            <JobCard job={job} />
          </li>
        ))}
      </ul>

      <PaginationBar
        page={page}
        pages={pages}
        total={total}
        perPage={perPage}
        disabled={listStatus === 'loading'}
        onPageChange={(p) => dispatch(setJobPage(p))}
      />
    </div>
  );
}
