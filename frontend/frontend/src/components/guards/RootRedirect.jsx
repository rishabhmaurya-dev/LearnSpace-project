import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import Landing from "../../pages/Landing";
const RootRedirect = () => {
  const { user, isAuthenticated, rehydrating } = useSelector(
    (state) => state.auth,
  );

  if (rehydrating) {
    return <div className="page-loader">Checking authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Landing />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "COMPANY") {
    return <Navigate to="/company/dashboard" replace />;
  }

  if (user.role === "STUDENT") {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Landing />;
};

export default RootRedirect;
