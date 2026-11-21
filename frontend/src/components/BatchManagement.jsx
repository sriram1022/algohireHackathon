import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CandidateCsvImport from "./CandidateCsvImport";

const API_URL = "http://localhost:5000";

const emptyCandidate = {
  fullName: "",
  phone: "",
  email: "",
  completionDate: "",
};


function BatchManagement() {
  const { token } = useAuth();

  const [courseName, setCourseName] = useState("");
  const [candidates, setCandidates] = useState([{ ...emptyCandidate }]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBatches = async () => {
    setFetchingBatches(true);

    try {
      const response = await fetch(`${API_URL}/api/batches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch batches");
      }

      setBatches(data.batches);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingBatches(false);
    }
  };

  const handleCsvImport = (importedCandidates) => {
  setCandidates((prev) => [...prev, ...importedCandidates]);

  setError("");
  setSuccess(
    `${importedCandidates.length} candidates imported into the form`
  );
};

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCandidateChange = (index, field, value) => {
    setCandidates((prev) =>
      prev.map((candidate, i) =>
        i === index
          ? { ...candidate, [field]: value }
          : candidate
      )
    );
  };

  const addCandidate = () => {
    setCandidates((prev) => [...prev, { ...emptyCandidate }]);
  };

  const removeCandidate = (index) => {
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!courseName.trim()) {
      setError("Course name is required");
      return;
    }

    if (candidates.length === 0) {
      setError("Add at least one candidate");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseName,
          candidates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Batch creation failed");
      }

      setSuccess(`Batch ${data.batch.batchNumber} created successfully`);

      setCourseName("");
      setCandidates([{ ...emptyCandidate }]);

      await fetchBatches();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="batch-management">
      <h2>Create Training Batch</h2>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit} className="batch-form">
        <div className="form-group">
          <label>Course Name</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter course name"
            required
          />
        </div>

        <h3>Candidates</h3>

        <CandidateCsvImport onImport={handleCsvImport} />

        {candidates.map((candidate, index) => (
          <div className="candidate-form" key={index}>
            <div className="candidate-header">
              <h4>Candidate {index + 1}</h4>

              {candidates.length > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeCandidate(index)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="candidate-fields">
              <input
                type="text"
                placeholder="Full name"
                value={candidate.fullName}
                onChange={(e) =>
                  handleCandidateChange(index, "fullName", e.target.value)
                }
                required
              />

              <input
                type="tel"
                placeholder="10-digit phone number"
                value={candidate.phone}
                onChange={(e) =>
                  handleCandidateChange(index, "phone", e.target.value)
                }
                required
              />

              <input
                type="email"
                placeholder="Email (optional)"
                value={candidate.email}
                onChange={(e) =>
                  handleCandidateChange(index, "email", e.target.value)
                }
              />

              <input
                type="date"
                value={candidate.completionDate}
                onChange={(e) =>
                  handleCandidateChange(
                    index,
                    "completionDate",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="secondary-button"
          onClick={addCandidate}
        >
          + Add Candidate
        </button>

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? "Creating Batch..." : "Create Batch"}
        </button>
      </form>

      <hr />

      <h2>My Batches</h2>

      {fetchingBatches ? (
        <p>Loading batches...</p>
      ) : batches.length === 0 ? (
        <p>No batches created yet.</p>
      ) : (
    <div className="batch-list">
      {batches.map((batch) => (
        <div className="batch-card" key={batch.id}>
          <h3>{batch.batchNumber}</h3>
          <p>{batch.courseName}</p>
          <p>Candidates: {batch.candidateCount}</p>
          <p>Status: {batch.status}</p>
        </div>
      ))}
    </div>
      )}
    </div>
  );
}

export default BatchManagement;