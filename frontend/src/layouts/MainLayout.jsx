import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import ForcePasswordChangeModal from "../components/ForcePasswordChangeModal";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <DemoModeBanner />
      <ForcePasswordChangeModal />
      <div className="layout" style={{ flex: 1 }}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="layout-main">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="layout-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
