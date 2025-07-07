import { useEffect, useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Header } from "./components/layout/Header";
import { FloatingActionBar } from "./components/layout/FloatingActionBar";
import { DashboardSidebar } from "./components/layout/DashboardSidebar";
import { useThemeStore } from "./store/themeStore";
import { useDashboardStore } from "./store/dashboardStore";
import "react-tooltip/dist/react-tooltip.css";

function App() {
  const { theme } = useThemeStore();
  const { initializeIfNeeded } = useDashboardStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Initialize dashboards and widgets if needed
  useEffect(() => {
    initializeIfNeeded();
  }, [initializeIfNeeded]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Header />
      <Dashboard />
      <FloatingActionBar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
}

export default App;
