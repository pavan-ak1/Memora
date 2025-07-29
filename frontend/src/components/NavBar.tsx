import { Link, useLocation } from "react-router-dom";
import { LogoIcon } from "../icons/Logo";

export function NavBar() {
  const location = useLocation();
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 flex items-center justify-between px-8 py-3 border-b border-gray-100">
      <Link to="/" className="flex items-center gap-2">
        <LogoIcon />
        <span className="text-xl font-bold text-purple-700">Memora</span>
      </Link>
      <div className="flex gap-4">
        {location.pathname !== "/signin" && (
          <Link to="/signin" className="text-purple-600 hover:underline font-medium">Login</Link>
        )}
        {location.pathname !== "/signup" && (
          <Link to="/signup" className="text-purple-600 hover:underline font-medium">Sign Up</Link>
        )}
      </div>
    </nav>
  );
} 