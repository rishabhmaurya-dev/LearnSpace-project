import { useState } from "react";
import { Outlet } from "react-router-dom";

import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";
import LearnSpaceAi from "../../components/AI/LearnSpaceAi";

import styles from "./StudentLayout.module.css";

const StudentLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.layout}>
      <StudentSidebar isOpen={isOpen} onClose={closeSidebar} />

      <div className={styles.main}>
        <StudentHeader onToggleSidebar={toggleSidebar} />

        <main className={styles.content}>
          <Outlet />
        </main>

        <LearnSpaceAi />
      </div>
    </div>
  );
};

export default StudentLayout;
