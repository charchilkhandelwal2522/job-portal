export default function PaginationBar({ page, pages, total, perPage, onPageChange, disabled }) {
  if (pages <= 1) {
    return total > 0 ? (
      <p className="pagination-meta">
        Showing {total} job{total === 1 ? '' : 's'}
      </p>
    ) : null;
  }

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="pagination-bar">
      <p className="pagination-meta">
        Showing {from}–{to} of {total}
      </p>
      <div className="pagination-actions">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="pagination-page">
          Page {page} / {pages}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={disabled || page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
