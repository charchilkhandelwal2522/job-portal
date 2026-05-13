import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="nav-bar">
      <NavLink to="/" className="nav-brand" end>
        JobPortal
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/" end>
          Jobs
        </NavLink>
        {user && (
          <NavLink to="/dashboard" end>
            My applications
          </NavLink>
        )}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-user" title={user.email}>
              {user.name}
            </span>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost">
              Log in
            </NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
