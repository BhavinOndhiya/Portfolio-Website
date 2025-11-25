import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { ADMIN_API_BASE_URL } from "../../config";
import {
  processImage,
  isImageFile,
  imageDimensions,
} from "../../utils/imageProcessor";

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
      {
        name: "documentUrl",
        label: "Result Sheet URL",
        type: "text",
      },
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
      {
        name: "certificateUrl",
        label: "Certificate URL",
        type: "text",
      },
      {
        name: "offerLetterUrl",
        label: "Offer Letter URL",
        type: "text",
      },
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
      { name: "value", label: "Destination / Value", type: "text" },
      {
        name: "displayValue",
        label: "Link Text (optional)",
        type: "text",
        required: false,
      },
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
  const [uploadContext, setUploadContext] = useState(null);
  const fileInputRef = useRef(null);

  const isPending = (action) => pendingAction === action;

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  const triggerUpload = (context) => {
    setUploadContext(context);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
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
        processing: uploadContext?.label
          ? `Processing ${uploadContext.label}...`
          : "Processing image...",
        upload: uploadContext?.label
          ? `Uploading ${uploadContext.label}...`
          : "Uploading file...",
      }[pendingAction] || "Saving changes...";

  const showOverlay =
    token && (loading || (pendingAction && pendingAction !== "login"));

  const handleFileSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !uploadContext) {
      return;
    }

    setPendingAction("upload");
    let fileToUpload = file;
    let contentType = file.type || "application/octet-stream";

    try {
      // Process image files to standardize dimensions
      if (isImageFile(file)) {
        setPendingAction("processing");

        // Determine image type based on upload context and active section
        let dimensions = imageDimensions.portfolio; // default
        const labelLower = uploadContext.label?.toLowerCase() || "";
        const fieldName = uploadContext.fieldName?.toLowerCase() || "";
        const sectionName = activeSection?.toLowerCase() || "";

        if (labelLower.includes("hero") || fieldName.includes("hero")) {
          dimensions = imageDimensions.hero;
        } else if (
          sectionName === "portfolio" ||
          labelLower.includes("portfolio") ||
          labelLower.includes("project") ||
          labelLower.includes("image url") ||
          fieldName.includes("imageurl")
        ) {
          dimensions = imageDimensions.portfolio;
        }

        // Process the image
        fileToUpload = await processImage(file, {
          width: dimensions.width,
          height: dimensions.height,
          quality: 0.9,
          format: "jpeg",
        });
        contentType = fileToUpload.type;

        setPendingAction("upload");
      }

      const { uploadUrl, fileUrl } = await authenticatedRequest(
        "/api/uploads/sign",
        {
          method: "POST",
          body: JSON.stringify({
            filename: fileToUpload.name,
            contentType: contentType,
          }),
        }
      );

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: fileToUpload,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      uploadContext.onSuccess(fileUrl);
      const processedMsg = isImageFile(file)
        ? " (processed and standardized)"
        : "";
      showToast(
        "success",
        `${uploadContext.label || "File"} uploaded${processedMsg}`
      );
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setPendingAction(null);
      setUploadContext(null);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const hiddenFileInput = (
    <input
      type="file"
      ref={fileInputRef}
      style={{ display: "none" }}
      onChange={handleFileSelection}
    />
  );

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
      <span className={`toast-icon ${toast.type}`}>
        {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
      </span>
      <span>{toast.message}</span>
    </div>
  ) : null;

  if (!token) {
    return (
      <div className="admin-login alt-theme">
        {hiddenFileInput}
        <div className="admin-login-card">
          <div className="login-brand">
            <h1>Portfolio Admin</h1>
            <p>Manage every section of the site securely.</p>
          </div>
          <form onSubmit={handleLogin} className="login-form modern">
            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
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
                placeholder="••••••••"
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
            <button
              type="submit"
              className="btn primary wide"
              disabled={isPending("login")}
            >
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
              className="btn outline wide"
              onClick={() => navigate("/")}
            >
              Back to site
            </button>
          </form>
          <p className="login-hint">Private console • Authorized use only</p>
        </div>
        {toastElement}
      </div>
    );
  }

  const currentConfig = sectionConfigs[activeSection];

  return (
    <div className="admin-dashboard">
      {hiddenFileInput}
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
                  <div className="upload-actions">
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() =>
                        triggerUpload({
                          label: "resume",
                          onSuccess: (url) =>
                            setHeroForm((prev) => ({
                              ...prev,
                              resumeUrl: url,
                            })),
                        })
                      }
                    >
                      Upload file
                    </button>
                    <span className="hint-text">PDF / DOC up to 10MB</span>
                  </div>
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
                  <div className="upload-actions">
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() =>
                        triggerUpload({
                          label: "hero image",
                          onSuccess: (url) =>
                            setHeroForm((prev) => ({
                              ...prev,
                              imageUrl: url,
                            })),
                        })
                      }
                    >
                      Upload image
                    </button>
                    <span className="hint-text">PNG/JPG up to 5MB</span>
                  </div>
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
                  const isRequired = field.required !== false;
                  const normalized = field.name.toLowerCase();
                  const supportsUpload =
                    normalized.includes("image") ||
                    normalized.includes("screenshot") ||
                    normalized.includes("logo") ||
                    normalized.includes("resume") ||
                    normalized.includes("document") ||
                    normalized.includes("sheet") ||
                    normalized.includes("certificate") ||
                    normalized.includes("offer");

                  let control = null;

                  if (field.type === "textarea") {
                    control = (
                      <textarea
                        name={field.name}
                        value={formState[field.name]}
                        onChange={handleFieldChange}
                        required={isRequired}
                      />
                    );
                  } else if (field.type === "select") {
                    control = (
                      <select
                        name={field.name}
                        value={formState[field.name]}
                        onChange={handleFieldChange}
                        required={isRequired}
                      >
                        <option value="">Select</option>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    );
                  } else {
                    control = (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formState[field.name]}
                        onChange={handleFieldChange}
                        required={isRequired}
                      />
                    );
                  }

                  return (
                    <label key={field.name}>
                      {field.label}
                      {control}
                      {supportsUpload && (
                        <div className="upload-actions">
                          <button
                            type="button"
                            className="btn outline"
                            onClick={() =>
                              triggerUpload({
                                label: field.label.toLowerCase(),
                                fieldName: field.name,
                                onSuccess: (url) =>
                                  setFormState((prev) => ({
                                    ...prev,
                                    [field.name]: url,
                                  })),
                              })
                            }
                          >
                            Upload file
                          </button>
                          <span className="hint-text">
                            {normalized.includes("image")
                              ? "Images will be automatically resized to 1200x900px"
                              : "We will fill the URL automatically"}
                          </span>
                        </div>
                      )}
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
