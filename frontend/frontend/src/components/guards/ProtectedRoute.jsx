import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, rehydrating, accessToken, user } = useSelector(
    (state) => state.auth,
  );

  console.log("🛡️ PROTECTED ROUTE:", {
    isAuthenticated,
    rehydrating,
    hasToken: !!accessToken,
    user,
  });

  if (rehydrating) {
    return;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
