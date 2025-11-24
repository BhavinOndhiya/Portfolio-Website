import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { ADMIN_API_BASE_URL } from "../../config";

const TOKEN_KEY = "portfolio-admin-token";

const sectionConfigs = {
  services: {
    title: "Services",
    description: "Control the services displayed on the homepage.",
    displayField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "iconKey",
        label: "Icon",
        type: "select",
        options: [
          { value: "wallet", label: "Wallet" },
          { value: "coins", label: "Coins" },
          { value: "money", label: "Money" },
          { value: "gem", label: "Gem" },
        ],
      },
    ],
  },
  skills: {
    title: "Skills",
    description: "Update your skills and proficiency levels.",
    displayField: "name",
    fields: [
      { name: "name", label: "Skill Name", type: "text" },
      { name: "percent", label: "Proficiency %", type: "number" },
    ],
  },
  personalInfo: {
    title: "Personal Info",
    description: "Details rendered in the About section.",
    displayField: "label",
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "value", label: "Value", type: "text" },
    ],
  },
  education: {
    title: "Education",
    description: "Timeline entries for your education journey.",
    displayField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "institution", label: "Institution", type: "text" },
      { name: "range", label: "Date Range", type: "text" },
      { name: "details", label: "Description", type: "textarea" },
      { name: "extra", label: "Extra (optional)", type: "text" },
    ],
  },
  projectTimeline: {
    title: "Project Timeline",
    description: "Key projects displayed under About > Projects.",
    displayField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "date", label: "Date", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  experience: {
    title: "Experience",
    description: "Professional experience timeline.",
    displayField: "company",
    fields: [
      { name: "company", label: "Company", type: "text" },
      { name: "title", label: "Role / Title", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "mode", label: "Mode (Remote/Onsite)", type: "text" },
      { name: "range", label: "Date Range", type: "text" },
      { name: "details", label: "Description", type: "textarea" },
    ],
  },
  portfolio: {
    title: "Portfolio",
    description: "Projects with cover images and links.",
    displayField: "title",
    fields: [
      { name: "category", label: "Category", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "imageUrl", label: "Image URL (or /public path)", type: "text" },
      { name: "link", label: "External Link", type: "text" },
    ],
  },
  contactMethods: {
    title: "Contact Methods",
    description: "Tiles above the contact form.",
    displayField: "label",
    fields: [
      {
        name: "type",
        label: "Type",
        type: "select",
        options: [
          { value: "phone", label: "Phone" },
          { value: "location", label: "Location" },
          { value: "email", label: "Email" },
          { value: "website", label: "Website" },
        ],
      },
      { name: "label", label: "Label", type: "text" },
      { name: "value", label: "Value", type: "text" },
    ],
  },
};

const getEmptyFormState = (fields) =>
  fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: "",
    }),
    {}
  );

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { content, refreshContent, loading, error } = useContent();

  const [activeSection, setActiveSection] = useState("services");
  const [formState, setFormState] = useState(() =>
    getEmptyFormState(sectionConfigs.services.fields)
  );
  const [editingId, setEditingId] = useState(null);
  const [heroForm, setHeroForm] = useState({
    name: "",
    tagline: "",
    resumeUrl: "",
    hireMeTarget: "#contact",
    imageUrl: "",
    roles: "",
  });
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );
  const [passwordForm, setPasswordForm] = useState({
    email: "",
    password: "",
  });
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);

  const isPending = (action) => pendingAction === action;

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  useEffect(() => {
    if (content?.hero) {
      setHeroForm({
        name: content.hero.name || "",
        tagline: content.hero.tagline || "",
        resumeUrl: content.hero.resumeUrl || "",
        hireMeTarget: content.hero.hireMeTarget || "#contact",
        imageUrl: content.hero.imageUrl || "",
        roles: (content.hero.roles || []).join(", "),
      });
    }
  }, [content?.hero]);

  useEffect(() => {
    const config = sectionConfigs[activeSection];
    if (config) {
      setFormState(getEmptyFormState(config.fields));
      setEditingId(null);
    }
  }, [activeSection]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (error) {
      showToast("error", error);
    }
  }, [error]);

  const sectionItems = content?.[activeSection] || [];
  const overlayMessage = loading
    ? "Loading fresh content..."
    : {
        hero: "Updating hero section...",
        entry: editingId ? "Updating entry..." : "Creating entry...",
        delete: "Removing entry...",
        reset: "Restoring defaults...",
      }[pendingAction] || "Saving changes...";

  const showOverlay =
    token && (loading || (pendingAction && pendingAction !== "login"));

  const authenticatedRequest = async (path, options = {}) => {
    if (!token) {
      throw new Error("Missing admin session");
    }
    const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (response.status === 401) {
      setToken("");
      localStorage.removeItem(TOKEN_KEY);
      throw new Error("Session expired. Please log in again.");
    }
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Request failed");
    }
    return response.json();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setPendingAction("login");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      showToast("success", "Signed in successfully");
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem(TOKEN_KEY);
    showToast("info", "Signed out");
  };

  const handleFieldChange = (event) => {
    const { name, value, type } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    }));
  };

  const handleEntrySubmit = async (event) => {
    event.preventDefault();
    if (!token) return;
    const action = editingId ? "UPDATE_ITEM" : "ADD_ITEM";
    const payload = {
      action,
      section: activeSection,
      data: formState,
      ...(editingId ? { id: editingId } : {}),
    };
    setPendingAction("entry");
    try {
      await authenticatedRequest("/api/content", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await refreshContent();
      setFormState(getEmptyFormState(sectionConfigs[activeSection].fields));
      setEditingId(null);
      showToast("success", editingId ? "Entry updated" : "Entry added");
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleEdit = (item) => {
    const config = sectionConfigs[activeSection];
    const nextState = getEmptyFormState(config.fields);
    config.fields.forEach((field) => {
      nextState[field.name] = item[field.name] ?? "";
    });
    setFormState(nextState);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) {
      return;
    }
    setPendingAction("delete");
    try {
      await authenticatedRequest("/api/content", {
        method: "PATCH",
        body: JSON.stringify({
          action: "DELETE_ITEM",
          section: activeSection,
          id,
        }),
      });
      await refreshContent();
      showToast("success", "Entry removed");
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleHeroSubmit = async (event) => {
    event.preventDefault();
    const roles = heroForm.roles
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
    setPendingAction("hero");
    try {
      await authenticatedRequest("/api/content", {
        method: "PATCH",
        body: JSON.stringify({
          action: "UPDATE_HERO",
          data: { ...heroForm, roles },
        }),
      });
      await refreshContent();
      showToast("success", "Hero updated");
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all content to defaults?")) {
      return;
    }
    setPendingAction("reset");
    try {
      await authenticatedRequest("/api/content", {
        method: "PATCH",
        body: JSON.stringify({ action: "RESET_CONTENT" }),
      });
      await refreshContent();
      showToast("success", "Content restored to defaults");
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const menuItems = useMemo(
    () =>
      Object.entries(sectionConfigs).map(([key, config]) => ({
        key,
        title: config.title,
      })),
    []
  );

  const toastElement = toast ? (
    <div className={`admin-toast ${toast.type}`}>
      <span className="toast-dot" />
      {toast.message}
    </div>
  ) : null;

  if (!token) {
    return (
      <div className="admin-login">
        <div className="container">
          <h1>Admin Access</h1>
          <form onSubmit={handleLogin} className="login-form">
            <label>
              Email
              <input
                type="email"
                value={passwordForm.email}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={passwordForm.password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                required
              />
            </label>
            <button type="submit" className="btn" disabled={isPending("login")}>
              {isPending("login") ? (
                <>
                  <span className="btn-spinner"></span> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/")}
              style={{ marginLeft: "1rem" }}
            >
              Back to site
            </button>
          </form>
        </div>
        {toastElement}
      </div>
    );
  }

  const currentConfig = sectionConfigs[activeSection];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Content Dashboard</h1>
        <div className="admin-actions">
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
          <button className="btn" onClick={() => navigate("/")}>
            View Site
          </button>
          <button
            className="btn"
            onClick={handleReset}
            disabled={isPending("reset")}
          >
            {isPending("reset") ? (
              <>
                <span className="btn-spinner"></span> Resetting...
              </>
            ) : (
              "Reset to Defaults"
            )}
          </button>
        </div>
      </div>
      {toastElement}
      {showOverlay && (
        <div className="admin-loading-overlay">
          <div className="admin-loading-card">
            <span className="spinner large"></span>
            <p>{overlayMessage}</p>
          </div>
        </div>
      )}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h3>Sections</h3>
          <ul>
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  className={item.key === activeSection ? "active" : ""}
                  onClick={() => setActiveSection(item.key)}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="admin-content">
          <section className="hero-editor card">
            <h2>Hero Section</h2>
            <form onSubmit={handleHeroSubmit} className="admin-form">
              <div className="form-grid">
                <label>
                  Name
                  <input
                    type="text"
                    value={heroForm.name}
                    onChange={(event) =>
                      setHeroForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Resume URL
                  <input
                    type="text"
                    value={heroForm.resumeUrl}
                    onChange={(event) =>
                      setHeroForm((prev) => ({
                        ...prev,
                        resumeUrl: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Hire Me Target
                  <input
                    type="text"
                    value={heroForm.hireMeTarget}
                    onChange={(event) =>
                      setHeroForm((prev) => ({
                        ...prev,
                        hireMeTarget: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Hero Image URL
                  <input
                    type="text"
                    value={heroForm.imageUrl}
                    onChange={(event) =>
                      setHeroForm((prev) => ({
                        ...prev,
                        imageUrl: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <label>
                Headline / Summary
                <textarea
                  value={heroForm.tagline}
                  onChange={(event) =>
                    setHeroForm((prev) => ({
                      ...prev,
                      tagline: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Roles (comma separated)
                <input
                  type="text"
                  value={heroForm.roles}
                  onChange={(event) =>
                    setHeroForm((prev) => ({
                      ...prev,
                      roles: event.target.value,
                    }))
                  }
                />
              </label>
              <button
                type="submit"
                className="btn"
                disabled={isPending("hero")}
              >
                {isPending("hero") ? (
                  <>
                    <span className="btn-spinner"></span> Saving...
                  </>
                ) : (
                  "Save Hero Content"
                )}
              </button>
            </form>
          </section>
          <section className="section-editor card">
            <h2>{currentConfig.title}</h2>
            <p className="description">{currentConfig.description}</p>
            <div className="editor-grid">
              <form onSubmit={handleEntrySubmit} className="admin-form">
                {currentConfig.fields.map((field) => {
                  if (field.type === "textarea") {
                    return (
                      <label key={field.name}>
                        {field.label}
                        <textarea
                          name={field.name}
                          value={formState[field.name]}
                          onChange={handleFieldChange}
                          required
                        />
                      </label>
                    );
                  }
                  if (field.type === "select") {
                    return (
                      <label key={field.name}>
                        {field.label}
                        <select
                          name={field.name}
                          value={formState[field.name]}
                          onChange={handleFieldChange}
                          required
                        >
                          <option value="">Select</option>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }
                  return (
                    <label key={field.name}>
                      {field.label}
                      <input
                        type={field.type}
                        name={field.name}
                        value={formState[field.name]}
                        onChange={handleFieldChange}
                        required
                      />
                    </label>
                  );
                })}
                <button
                  type="submit"
                  className="btn"
                  disabled={isPending("entry")}
                >
                  {isPending("entry") ? (
                    <>
                      <span className="btn-spinner"></span>{" "}
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : editingId ? (
                    "Update Entry"
                  ) : (
                    "Add Entry"
                  )}
                </button>
              </form>
              <div className="admin-list">
                <h3>Existing Entries</h3>
                {sectionItems.length === 0 && <p>No entries yet.</p>}
                <ul>
                  {sectionItems.map((item, index) => (
                    <li
                      key={item.id}
                      className="admin-list-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div>
                        <strong>
                          {item[currentConfig.displayField] ||
                            item.title ||
                            item.label}
                        </strong>
                        {(item.description || item.value) && (
                          <p>{item.description || item.value}</p>
                        )}
                      </div>
                      <div className="list-actions">
                        <button
                          className="btn small"
                          type="button"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn small danger"
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isPending("delete")}
                        >
                          {isPending("delete") ? (
                            <span className="btn-spinner" />
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
