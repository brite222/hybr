import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
    cohortId: "",
    coachId: "",
    tier: "standard",
    autoGeneratePassword: true,
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users${filter ? `?role=${filter}` : ""}`);
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadCohorts = async () => {
    try {
      const res = await api.get("/admin/cohorts");
      setCohorts(res.data.cohorts);
      if (res.data.cohorts.length > 0 && !form.cohortId) {
        setForm((prev) => ({ ...prev, cohortId: res.data.cohorts[0].id }));
      }
    } catch (err) {
      console.error("Failed to load cohorts", err);
    }
  };

  const loadCoaches = async () => {
    try {
      const res = await api.get("/admin/users?role=coach");
      setCoaches(res.data.users);
    } catch (err) {
      console.error("Failed to load coaches", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter]);

  useEffect(() => {
    loadCohorts();
    loadCoaches();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTempPassword("");

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
      };

      if (!form.autoGeneratePassword) {
        payload.password = form.password;
      }

      if (form.role === "student") {
        payload.cohortId = form.cohortId;
        payload.tier = form.tier; // ✅ send tier
        if (form.coachId) {
          payload.coachId = form.coachId;
        }
      }

      const res = await api.post("/admin/users", payload);

      let successMsg = `✅ ${form.role} created successfully!`;
      if (res.data.assignedCoach) {
        const coach = coaches.find((c) => c.id === res.data.assignedCoach);
        if (coach) {
          successMsg += ` Assigned to coach ${coach.first_name} ${coach.last_name}.`;
        }
      }
      setSuccess(successMsg);

      if (res.data.tempPassword) {
        setTempPassword(res.data.tempPassword);
      }

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "student",
        cohortId: cohorts[0]?.id || "",
        coachId: "",
        tier: "standard",   // ✅ COMMA HERE
        autoGeneratePassword: true,
      });
      loadUsers();
      loadCoaches();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccess("User deleted");
      loadUsers();
      loadCoaches();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleTierChange = async (userId, newTier) => {
    try {
      await api.patch(`/admin/users/${userId}/tier`, { tier: newTier });
      loadUsers();
    } catch (err) {
      alert("Failed to update tier: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Manage Users</h1>
          <p className="admin-subtitle">Create coaches, students, and other admins</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New User"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {tempPassword && (
        <div className="admin-card" style={{ background: "#fffbe6", border: "2px solid #f0ad4e" }}>
          <h3 style={{ marginTop: 0 }}>🔑 Temporary Password Generated</h3>
          <p>Share this password with the user. They'll be required to change it on first login:</p>
          <div
            style={{
              background: "#000",
              color: "#8DC540",
              padding: "16px 24px",
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: 2,
              textAlign: "center",
              margin: "16px 0",
            }}
          >
            {tempPassword}
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              navigator.clipboard.writeText(tempPassword);
              alert("Copied to clipboard!");
            }}
          >
            📋 Copy Password
          </button>
          <button
            className="btn-danger"
            style={{ marginLeft: 12 }}
            onClick={() => setTempPassword("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <div className="admin-card">
          <h3 className="admin-card-title">Create New User</h3>
          <form className="admin-form" onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value, coachId: "" })
                }
              >
                <option value="student">Student</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* ✅ Student-specific fields */}
            {form.role === "student" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cohort *</label>
                    <select
                      required
                      value={form.cohortId}
                      onChange={(e) => setForm({ ...form, cohortId: e.target.value })}
                    >
                      <option value="">-- Select Cohort --</option>
                      {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tier *</label>
                    <select
                      required
                      value={form.tier}
                      onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign to Coach (optional)</label>
                  <select
                    value={form.coachId}
                    onChange={(e) => setForm({ ...form, coachId: e.target.value })}
                  >
                    <option value="">-- Unassigned (assign later) --</option>
                    {coaches.length === 0 ? (
                      <option disabled>No coaches available — create one first</option>
                    ) : (
                      coaches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.first_name} {c.last_name} ({c.email})
                        </option>
                      ))
                    )}
                  </select>
                  <small style={{ color: "#666", display: "block", marginTop: 4 }}>
                    💡 You can also assign coaches later from the Assignments page
                  </small>
                </div>
              </>
            )}

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.autoGeneratePassword}
                  onChange={(e) =>
                    setForm({ ...form, autoGeneratePassword: e.target.checked })
                  }
                  style={{ marginRight: 8 }}
                />
                Auto-generate temporary password (user must change on first login)
              </label>
            </div>

            {!form.autoGeneratePassword && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}

            <button type="submit" className="btn-primary">
              Create User
            </button>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Users ({users.length})</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admins</option>
            <option value="coach">Coaches</option>
            <option value="student">Students</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tier</th>
                <th>Verified</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    {u.role === "student" ? (
                      <select
                        value={u.tier || "standard"}
                        onChange={(e) => handleTierChange(u.id, e.target.value)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          background: u.tier === "premium" ? "#E8F5DC" : "#DBEEF9",
                          color: u.tier === "premium" ? "#648C2D" : "#196AB4",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      >
                        <option value="standard">STANDARD</option>
                        <option value="premium">PREMIUM</option>
                      </select>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td>{u.is_verified ? "✅" : "❌"}</td>
                  <td>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() =>
                        handleDelete(u.id, `${u.first_name} ${u.last_name}`)
                      }
                    >
                      Delete
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