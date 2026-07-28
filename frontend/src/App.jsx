import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthSession } from "./redux/slices/authSlice";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/Loader";

function App() {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.auth);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // 1. Session check trigger karein
    dispatch(checkAuthSession());

    // 2. Minimum 400ms tak loader rakhein taaki UI sudden jump na kare
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Agar session check chal raha ho YA minimum timer baki ho
  if (isInitializing || showLoader) {
    return (
      <Loader/>
    );
  }

  return <AppRoutes />;
}

export default App;