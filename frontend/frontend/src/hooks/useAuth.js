import { useDispatch, useSelector } from "react-redux";

import {
  loginUser,
  logoutUser,
  logoutAllDevices,
  registerUser,
  refreshUser,
} from "../features/auth/authThunks";

const useAuth = () => {
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);

  return {
    ...auth,

    login: (data) => dispatch(loginUser(data)),

    register: (data) => dispatch(registerUser(data)),

    logout: () => dispatch(logoutUser()),

    logoutAll: () => dispatch(logoutAllDevices()),

    refresh: () => dispatch(refreshUser()),
  };
};

export default useAuth;
