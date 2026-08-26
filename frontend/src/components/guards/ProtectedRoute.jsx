import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, rehydrating } = useSelector((state) => state.auth);

  const location = useLocation();

  if (rehydrating) {
    return <div className="page-loader">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
