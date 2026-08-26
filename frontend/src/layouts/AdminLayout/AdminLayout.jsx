import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import LearnSpaceAi from "../../components/AI/LearnSpaceAi";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar gets isOpen state and closeSidebar handler */}
      <AdminSidebar isOpen={isOpen} onClose={closeSidebar} />

      <div className={styles.main}>
        {/* Header gets toggleSidebar handler */}
        <AdminHeader onToggleSidebar={toggleSidebar} />

        <main className={styles.content}>
          <Outlet />
        </main>
        <LearnSpaceAi />
      </div>
    </div>
  );
};

export default AdminLayout;
