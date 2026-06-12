import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [coachId, setCoachId] = useState("");
  const [studentId, setStudentId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, cRes, sRes] = await Promise.all([
        api.get("/admin/assignments"),
        api.get("/admin/users?role=coach"),
        api.get("/admin/users?role=student"),
      ]);
      setAssignments(aRes.data.assignments);
      setCoaches(cRes.data.users);
      setStudents(sRes.data.users);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!coachId || !studentId) {
      setError("Please select both a coach and a student");
      return;
    }
    try {
      await api.post("/admin/assignments", { coachId, studentId });
      setSuccess("✅ Student assigned successfully!");
      setCoachId("");
      setStudentId("");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign");
    }
  };

  const handleUnassign = async (id) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      setSuccess("Assignment removed");
      loadData();
    } catch (err) {
      setError("Failed to remove");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Coach Assignments</h1>
          <p className="admin-subtitle">Assign students to coaches</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-card">
        <h3 className="admin-card-title">Create Assignment</h3>
        <form className="admin-form" onSubmit={handleAssign}>
          <div className="form-row">
            <div className="form-group">
              <label>Coach</label>
              <select value={coachId} onChange={(e) => setCoachId(e.target.value)}>
                <option value="">-- Select Coach --</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Student</label>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Assign</button>
        </form>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">Current Assignments ({assignments.length})</h3>
        {loading ? <p>Loading...</p> : assignments.length === 0 ? (
          <div className="empty-state">No assignments yet</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coach</th>
                <th>Student</th>
                <th>Assigned On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.coach_first} {a.coach_last}</strong>
                    <div style={{ fontSize: 12, color: "#888" }}>{a.coach_email}</div>
                  </td>
                  <td>
                    <strong>{a.student_first} {a.student_last}</strong>
                    <div style={{ fontSize: 12, color: "#888" }}>{a.student_email}</div>
                  </td>
                  <td>{new Date(a.assigned_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleUnassign(a.id)}>
                      Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}