import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized">
      <h1>403 - Access Denied</h1>
      <p>You don't have permission to access this page.</p>

      <button onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </button>
    </div>
  );
}

export default Unauthorized;