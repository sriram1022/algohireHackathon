import { useAuth } from "../context/AuthContext";
import BatchManagement from "../components/BatchManagement";

function Dashboard() {
  const { user, logout } = useAuth();

  const roleDashboard = {
    TRAINING_CENTRE: {
      title: "Training Centre Dashboard",
      description: "Create batches and submit certificates for approval.",
    },
    DISTRICT_OFFICER: {
      title: "District Officer Dashboard",
      description: "Review submitted batches and approve or return them.",
    },
    QUALITY_OFFICER: {
      title: "Quality Officer Dashboard",
      description: "Perform quality checks on submitted batches.",
    },
    STATE_OFFICER: {
      title: "State Officer Dashboard",
      description: "Review final approvals and issue certificates.",
    },
  };

  const dashboard = roleDashboard[user?.role];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>CertiFlow</h1>
          <p>Certificate Issuance Platform</p>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <main className="dashboard-content">
        <h2>Welcome, {user?.name}</h2>

        <div className="dashboard-card">
          <h3>{dashboard?.title || "Dashboard"}</h3>
          <p>{dashboard?.description || "Welcome to CertiFlow"}</p>
        </div>

         {user?.role === "TRAINING_CENTRE" && (
    <BatchManagement />
  )}
      </main>
    </div>
  );
}

export default Dashboard;