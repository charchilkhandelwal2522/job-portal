import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export function buildJobsQuery({ page, perPage = 6, q, employmentType, location }) {
  const params = new URLSearchParams();
  params.set('_page', String(page));
  params.set('_per_page', String(perPage));

  const where = {};
  const trimmedQ = q?.trim();
  if (trimmedQ) {
    where.or = [
      { title: { contains: trimmedQ } },
      { company: { contains: trimmedQ } },
      { description: { contains: trimmedQ } },
    ];
  }
  if (employmentType) {
    where.employmentType = { eq: employmentType };
  }
  const trimmedLoc = location?.trim();
  if (trimmedLoc) {
    where.location = { contains: trimmedLoc };
  }

  if (Object.keys(where).length > 0) {
    params.set('_where', JSON.stringify(where));
  }

  return params.toString();
}

/** Normalizes json-server list responses. Note: paginated bodies use `first` as a constant (always 1), not the current page — pass the requested page from the caller. */
export function normalizePagedList(resData) {
  if (resData && Array.isArray(resData.data)) {
    return {
      rows: resData.data,
      pages: resData.pages ?? 1,
      total: resData.items ?? resData.data.length,
    };
  }
  if (Array.isArray(resData)) {
    return {
      rows: resData,
      pages: 1,
      total: resData.length,
    };
  }
  return { rows: [], pages: 0, total: 0 };
}
