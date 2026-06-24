/* ============================================
   GREENWOOD HEIGHTS — SOCIETY MANAGEMENT
   Complete Frontend Application
   ============================================ */

("use strict");

// ============ STATE MANAGEMENT ============
const State = {
  user: null,
  token: null,
  currentPage: "dashboard",
  data: {
    dashStats: null,
    residents: [],
    flats: [],
    visitors: [],
    complaints: [],
    notices: [],
    bills: [],
  },
  charts: {},
  modals: {},
};
window.State = State;

// ============ API CLIENT ============
const API = {
  base: "https://app.mygatebell.com/backend",
  async request(method, endpoint, body = null) {
    if (
      typeof SocietyBridge !== "undefined" &&
      SocietyBridge.isLegacyEndpoint(endpoint) &&
      State.user?.role !== "super_admin" &&
      State.user?.role !== "superadmin"
    ) {
      try {
        return await SocietyBridge.handleRequest(method, endpoint, body);
      } catch (err) {
        throw err;
      }
    }
    const headers = { "Content-Type": "application/json" };
    if (State.token) {
      headers["Authorization"] = `Bearer ${State.token}`;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(`${this.base}${endpoint}`, opts);
      const json = await res.json();

      if (!res.ok || json.status === false) {
        if (res.status === 404) {
          throw new Error(
            `Endpoint not found (404): ${endpoint}. This feature might not be deployed to the production backend yet.`,
          );
        }
        if (res.status === 401) {
          throw new Error("Authorization failed. Please login again.");
        }
        const errMsg = json.message || json.error || "Request failed";
        throw new Error(errMsg);
      }

      // If backend uses standard wrapper {status:true, data: ...}, return data
      if (json.hasOwnProperty("data") && json.status === true) {
        return json.data;
      }
      if (json.status === true && !json.hasOwnProperty("data")) {
        console.warn("API returned success but no data field:", json);
      }
      return json;
    } catch (err) {
      throw err;
    }
  },
  get: (ep) => API.request("GET", ep),
  post: (ep, body) => API.request("POST", ep, body),
  put: (ep, body) => API.request("PUT", ep, body),
  delete: (ep) => API.request("DELETE", ep),
};

// ============ UTILITIES ============
function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function categoryIcon(cat) {
  const icons = {
    plumbing: "fa-droplet",
    electrical: "fa-bolt",
    security: "fa-shield-halved",
    cleaning: "fa-broom",
    parking: "fa-car",
    lift: "fa-elevator",
    other: "fa-circle-question",
    general: "fa-bullhorn",
    maintenance: "fa-wrench",
    billing: "fa-indian-rupee-sign",
    emergency: "fa-triangle-exclamation",
    event: "fa-calendar-star",
    finance: "fa-indian-rupee-sign",
  };
  return icons[cat] || "fa-circle";
}

function statusBadge(status) {
  return `<span class="badge badge-${status}"><span class="badge-dot"></span>${status.replace("_", " ")}</span>`;
}

function priorityBadge(priority) {
  const map = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };
  return `<span class="badge badge-${priority === "high" ? "rejected" : priority === "medium" ? "pending" : "approved"}">${map[priority]}</span>`;
}

function el(id) {
  return document.getElementById(id);
}
function qs(sel) {
  return document.querySelector(sel);
}
function qsa(sel) {
  return document.querySelectorAll(sel);
}

// ============ TOAST NOTIFICATIONS ============
const Toast = {
  show(type, title, message, duration = 4000) {
    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-xmark",
      warning: "fa-triangle-exclamation",
      info: "fa-circle-info",
    };
    const container = el("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type]} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ""}
      </div>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success: (title, msg) => Toast.show("success", title, msg),
  error: (title, msg) => Toast.show("error", title, msg),
  warning: (title, msg) => Toast.show("warning", title, msg),
  info: (title, msg) => Toast.show("info", title, msg),
};

// ============ MODAL SYSTEM ============
const Modal = {
  open(id) {
    const overlay = el(id);
    if (overlay) {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  },
  close(id) {
    const overlay = el(id);
    if (overlay) {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  },
  closeAll() {
    qsa(".modal-overlay").forEach((m) => m.classList.remove("open"));
    document.body.style.overflow = "";
  },
  confirm(title, message, onConfirm) {
    const existing = el("confirm-modal");
    if (existing) existing.remove();
    const div = document.createElement("div");
    div.id = "confirm-modal";
    div.className = "modal-overlay";
    div.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-body" style="padding:28px">
          <div class="confirm-dialog">
            <div class="confirm-icon">⚠️</div>
            <div class="confirm-title">${title}</div>
            <div class="confirm-text">${message}</div>
            <div class="confirm-actions">
              <button class="btn btn-ghost" onclick="Modal.close('confirm-modal')">Cancel</button>
              <button class="btn btn-danger" id="confirm-ok-btn">Yes, Delete</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add("open"), 10);
    el("confirm-ok-btn").onclick = () => {
      Modal.close("confirm-modal");
      onConfirm();
    };
    div.addEventListener("click", (e) => {
      if (e.target === div) Modal.close("confirm-modal");
    });
  },
};

// ============ AUTH ============
async function doLogin(e) {
  e.preventDefault();
  const phone = el("login-email").value.trim();
  const password = el("login-password").value;
  const btn = el("login-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
  try {
    const data = await API.post("/auth/login", { phone, password });
    State.token = data.token;
    State.user =
      typeof SocietyBridge !== "undefined"
        ? SocietyBridge.normalizeUser(data.user)
        : data.user;
    localStorage.setItem("gh_token", data.token);
    localStorage.setItem("gh_user", JSON.stringify(State.user));
    Toast.success("Welcome back!", `Signed in as ${data.user.name}`);
    if (data.user.role === "super_admin" || data.user.role === "superadmin")
      renderSuperAdminApp();
    else renderApp();
  } catch (err) {
    Toast.error("Login Failed", err.message);
    btn.disabled = false;
    btn.innerHTML =
      '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';
  }
}

function doLogout() {
  // Clear all stored data
  localStorage.removeItem("gh_token");
  localStorage.removeItem("gh_user");

  // Clear state
  State.token = null;
  State.user = null;
  State.saPage = null;
  State.currentPage = "dashboard";
  State.data = {
    dashStats: null,
    residents: [],
    flats: [],
    visitors: [],
    complaints: [],
    notices: [],
    bills: [],
  };

  // Destroy all charts if they exist
  if (State.charts.visitor) State.charts.visitor.destroy();
  if (State.charts.complaint) State.charts.complaint.destroy();
  State.charts = {};

  // Clear any cached data
  State.modals = {};

  // Show toast notification
  Toast.success("Signed Out", "You have been logged out successfully");

  // Render login page
  renderLogin();
}

function togglePasswordVisibility(inputId, toggleId) {
  const passwordInput = document.getElementById(inputId);
  const toggleIcon = document.getElementById(toggleId);

  if (passwordInput && toggleIcon) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
  }
}

function setDemoCredentials(role) {
  const creds = {
    superadmin: { phone: "1122334455", password: "Pass@123" },
    admin: { phone: "9383673712", password: "Admin@123" },
    resident: { phone: "8976351526", password: "Pass@123" },
  };
  const c = creds[role];
  if (c) {
    el("login-email").value = c.phone;
    el("login-password").value = c.password;
  }
  qsa(".role-option").forEach((o) =>
    o.classList.toggle("active", o.dataset.role === role),
  );
  updateDemoHint(role);
}

function updateDemoHint(role) {
  const hints = {
    superadmin: {
      phone: "1122334455",
      pass: "Pass@123",
      label: "👑 Super Admin — Manage all societies",
    },
    admin: {
      phone: "9383673712",
      pass: "Admin@123",
      label: "Admin Access — Full control",
    },
    resident: {
      phone: "8976351526",
      pass: "Pass@123",
      label: "Resident — MyGate Member",
    },
  };
  const h = hints[role];
  if (h && el("demo-hint")) {
    el("demo-hint").innerHTML =
      `<p>${h.label}</p><span>${h.phone} / ${h.pass}</span>`;
  }
}

// ============ RENDER LOGIN ============
function renderLogin() {
  document.title = "Sign In — MyGateBell";
  document.body.innerHTML = `
    <div class="login-page">
      <div class="login-hero">
        <div class="login-brand" style="cursor:pointer" onclick="renderLanding()">
          <div class="login-brand-icon"><i class="fa-solid fa-building-shield"></i></div>
          <div class="login-brand-text">
            <h2>MyGateBell</h2>
            <p>Smart Society Platform</p>
          </div>
        </div>
        <div class="login-hero-content">
          <h1>Smarter Living,<br>Better Community</h1>
          <p>A complete platform for managing your residential society — visitors, complaints, billing, notices and security — all in one place.</p>
        </div>
        <div class="login-features">
          <div class="login-feature-item"><div class="login-feature-icon"><i class="fa-solid fa-shield"></i></div><span>Visitor Management & Security</span></div>
          <div class="login-feature-item"><div class="login-feature-icon"><i class="fa-solid fa-file-invoice-dollar"></i></div><span>Maintenance Billing & Payments</span></div>
          <div class="login-feature-item"><div class="login-feature-icon"><i class="fa-solid fa-headset"></i></div><span>Complaint Helpdesk & Tracking</span></div>
          <div class="login-feature-item"><div class="login-feature-icon"><i class="fa-solid fa-bell"></i></div><span>Notice Board & Announcements</span></div>
        </div>
        <div style="margin-top:auto;padding-top:32px">
          <button onclick="renderLanding()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.75);padding:8px 18px;border-radius:8px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all 0.2s">
            <i class="fa-solid fa-arrow-left"></i> Back to Home
          </button>
        </div>
      </div>
      <div class="login-form-panel">
        <div class="login-form-container fade-in">
          <div class="login-form-header">
            <h2>Sign In</h2>
            <p>Access your society portal with your credentials</p>
          </div>
          <div class="role-selector" style="grid-template-columns:repeat(3,1fr)">
            <div class="role-option active" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.04)" data-role="superadmin" onclick="setDemoCredentials('superadmin')" title="Super Admin">
              <span class="role-option-icon" style="background:rgba(239,68,68,0.1);color:#ef4444"><i class="fa-solid fa-crown"></i></span>
              <span style="font-size:11px">Super Admin</span>
            </div>
            <div class="role-option" data-role="admin" onclick="setDemoCredentials('admin')" title="Society Admin">
              <span class="role-option-icon"><i class="fa-solid fa-user-shield"></i></span>
              <span style="font-size:11px">Society Admin</span>
            </div>
            <div class="role-option" data-role="resident" onclick="setDemoCredentials('resident')" title="Resident">
              <span class="role-option-icon"><i class="fa-solid fa-house-user"></i></span>
              <span style="font-size:11px">Resident</span>
            </div>
          </div>
          <div class="demo-creds" id="demo-hint">
            <p>👑 Super Admin — Manage all societies</p>
            <span>1122334455 / Pass@123</span>
          </div>
          <form onsubmit="doLogin(event)" autocomplete="on">
            <div class="form-group">
              <label class="form-label">Phone Number <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="fa-solid fa-phone input-icon"></i>
                <input type="text" id="login-email" class="form-input with-icon" placeholder="10-digit mobile" value="1122334455" required autocomplete="tel">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="fa-solid fa-lock input-icon"></i>
                <input type="password" id="login-password" class="form-input with-icon" placeholder="Enter password" value="Pass@123" required autocomplete="current-password" style="padding-right:40px">
                <i class="fa-solid fa-eye password-toggle" id="login-password-toggle" onclick="togglePasswordVisibility('login-password', 'login-password-toggle')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--gray-400);font-size:14px;z-index:10"></i>
              </div>
            </div>
            <button type="submit" id="login-btn" class="btn btn-primary btn-full btn-lg" style="margin-top:8px">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
            </button>
          </form>
          <div style="text-align:center;margin-top:18px">
            <button onclick="renderLanding()" style="background:none;border:none;color:var(--primary-500);font-size:13px;cursor:pointer;font-weight:500">
              <i class="fa-solid fa-arrow-left"></i> Back to Homepage
            </button>
          </div>
          <p style="text-align:center;margin-top:14px;font-size:11px;color:var(--gray-400)">
            Powered by MyGateBell v2.0 · Made in India
          </p>
        </div>
      </div>
    </div>
    <div id="toast-container"></div>`;

  // Highlight the superadmin role as default
  setDemoCredentials("superadmin");
}

// ============ RENDER MAIN APP ============
function renderApp() {
  const role = State.user.role;
  const navItems = getNavItems(role);
  document.body.innerHTML = `
    <div id="sidebar-backdrop" class="overlay-backdrop" onclick="closeMobileSidebar()"></div>
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon"><i class="fa-solid fa-building"></i></div>
          <div class="sidebar-brand-text">
            <h2>${State.user.societyName || "MyGateBell"}</h2>
            <p>Society Portal</p>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Main Menu</div>
          ${navItems
            .map(
              (item) => `
            <div class="nav-item ${item.id === State.currentPage ? "active" : ""}" 
                 data-page="${item.id}" onclick="navigateTo('${item.id}')">
              <i class="fa-solid ${item.icon} nav-icon"></i>
              <span>${item.label}</span>
              ${item.badge ? `<span class="nav-badge" id="badge-${item.id}">${item.badge}</span>` : ""}
            </div>`,
            )
            .join("")}
        </div>
        <div class="sidebar-footer">
          <div class="user-card" onclick="doLogout()">
            <div class="user-avatar">${initials(State.user.name)}</div>
            <div class="user-card-info">
              <div class="user-card-name">${State.user.name}</div>
              <div class="user-card-role">${State.user.role}</div>
            </div>
            <i class="fa-solid fa-arrow-right-from-bracket user-card-logout"></i>
          </div>
        </div>
      </aside>
      <div class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <div class="menu-toggle" onclick="toggleMobileSidebar()"><i class="fa-solid fa-bars"></i></div>
            <div class="breadcrumb">
              <span class="breadcrumb-item">${State.user.societyName || "MyGateBell"}</span>
              <span class="breadcrumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
              <span class="breadcrumb-item active" id="breadcrumb-current">Dashboard</span>
            </div>
          </div>
          <div class="topbar-right">
            <div class="topbar-action" title="Notifications" onclick="navigateTo('notices')">
              <i class="fa-solid fa-bell"></i>
              <span class="topbar-notif-dot"></span>
            </div>
            <div class="topbar-action" title="Search"><i class="fa-solid fa-magnifying-glass"></i></div>
            <div style="width:1px;height:22px;background:var(--gray-200);margin:0 4px"></div>
            <div class="user-avatar" style="width:32px;height:32px;font-size:12px;cursor:pointer" onclick="doLogout()" title="Sign Out">${initials(State.user.name)}</div>
          </div>
        </header>
        <main class="page-content" id="page-content">
          <div class="skeleton skeleton-card" style="height:200px"></div>
        </main>
      </div>
    </div>
    <div id="toast-container"></div>`;

  navigateTo(State.currentPage);
}

function getNavItems(role) {
  const all = [
    {
      id: "dashboard",
      icon: "fa-chart-pie",
      label: "Dashboard",
      roles: ["admin", "guard", "resident"],
    },
    {
      id: "visitors",
      icon: "fa-users-viewfinder",
      label: "Visitors",
      roles: ["admin", "guard", "resident"],
      badge: null,
    },
    {
      id: "residents",
      icon: "fa-house-user",
      label: "Residents & Flats",
      roles: ["admin"],
    },
    {
      id: "complaints",
      icon: "fa-headset",
      label: "Complaints",
      roles: ["admin", "resident"],
    },
    {
      id: "notices",
      icon: "fa-bullhorn",
      label: "Notice Board",
      roles: ["admin", "resident", "guard"],
    },
    {
      id: "billing",
      icon: "fa-file-invoice-dollar",
      label: "Billing",
      roles: ["admin", "resident"],
    },
    {
      id: "security",
      icon: "fa-shield-halved",
      label: "Security Panel",
      roles: ["admin", "guard"],
    },
    {
      id: "amenities",
      icon: "fa-dumbbell",
      label: "Amenities",
      roles: ["admin"],
    },
    {
      id: "community",
      icon: "fa-users-rays",
      label: "Community",
      roles: ["admin"],
    },
    {
      id: "events",
      icon: "fa-calendar-check",
      label: "Events",
      roles: ["admin"],
    },
    {
      id: "polls",
      icon: "fa-square-poll-vertical",
      label: "Polls",
      roles: ["admin"],
    },
    {
      id: "guards",
      icon: "fa-shield-halved",
      label: "Guards",
      roles: ["admin"],
    },
  ];
  return all.filter((item) => item.roles.includes(role));
}

function toggleMobileSidebar() {
  const s = el("sidebar");
  const b = el("sidebar-backdrop");
  s.classList.toggle("mobile-open");
  b.classList.toggle("show");
}

function closeMobileSidebar() {
  el("sidebar")?.classList.remove("mobile-open");
  el("sidebar-backdrop")?.classList.remove("show");
}

function navigateTo(page) {
  State.currentPage = page;
  qsa(".nav-item").forEach((el) =>
    el.classList.toggle("active", el.dataset.page === page),
  );
  const labels = {
    dashboard: "Dashboard",
    visitors: "Visitor Management",
    residents: "Residents & Flats",
    complaints: "Complaints",
    notices: "Notice Board",
    billing: "Billing",
    security: "Security Panel",
    amenities: "Amenities",
    community: "Community Management",
    events: "Event Management",
    polls: "Polls Management",
    guards: "Guard Management",
  };
  if (el("breadcrumb-current"))
    el("breadcrumb-current").textContent = labels[page] || page;
  closeMobileSidebar();

  const pageContent = el("page-content");
  if (pageContent) {
    pageContent.innerHTML =
      '<div class="skeleton skeleton-card" style="height:120px;margin-bottom:16px"></div><div class="skeleton skeleton-card" style="height:80px;margin-bottom:16px"></div><div class="skeleton skeleton-card" style="height:300px"></div>';
  }

  setTimeout(() => {
    switch (page) {
      case "dashboard":
        renderDashboard();
        break;
      case "visitors":
        renderVisitors();
        break;
      case "residents":
        renderResidents();
        break;
      case "complaints":
        renderComplaints();
        break;
      case "notices":
        renderNotices();
        break;
      case "billing":
        renderBilling();
        break;
      case "security":
        renderSecurity();
        break;
      case "amenities":
        renderAmenities();
        break;
      case "community":
        renderCommunity();
        break;
      case "events":
        renderEvents();
        break;
      case "polls":
        renderPolls();
        break;
      case "guards":
        renderGuards();
        break;
    }
  }, 150);
}

// ============ DASHBOARD PAGE ============
function refreshSocietyCache() {
  if (typeof SocietyBridge !== "undefined") SocietyBridge.invalidateCache();
}

async function renderDashboard() {
  const role = State.user.role;
  try {
    const [stats, activity] = await Promise.all([
      API.get("/dashboard/stats"),
      API.get("/dashboard/recent-activity"),
    ]);
    State.data.dashStats = stats;

    if (role === "admin") renderAdminDashboard(stats, activity);
    else if (role === "guard") renderGuardDashboard(stats, activity);
    else renderResidentDashboard(stats, activity);
  } catch (err) {
    showError(err.message || "Failed to load dashboard");
  }
}

function renderAdminDashboard(stats, activity) {
  const pc = el("page-content");
  pc.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Good morning, ${State.user.name.split(" ")[0]} 👋</h1>
        <p class="page-subtitle">Here's what's happening at ${State.user.societyName || "your society"} today</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-ghost btn-sm" onclick="refreshSocietyCache();renderDashboard()"><i class="fa-solid fa-arrow-rotate-right"></i> Refresh</button>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('visitors')"><i class="fa-solid fa-plus"></i> Add Visitor</button>
      </div>
    </div>

    <div class="stats-grid">
      ${statCard("Total Residents", stats.totalResidents, "fa-house-user", "indigo", `${stats.occupiedFlats}/${stats.totalFlats} flats occupied`, "neutral")}
      ${statCard("Today's Visitors", stats.visitorsToday, "fa-users-viewfinder", "blue", `${stats.pendingApprovals} awaiting approval`, stats.pendingApprovals > 0 ? "down" : "neutral")}
      ${statCard("Open Complaints", stats.openComplaints, "fa-headset", stats.openComplaints > 3 ? "red" : "orange", "Needs attention", stats.openComplaints > 3 ? "down" : "neutral")}
      ${statCard("Revenue Collected", formatCurrency(stats.totalRevenue), "fa-indian-rupee-sign", "green", `${formatCurrency(stats.pendingRevenue)} pending`, "up")}
    </div>

    <div class="grid-cols-6-4" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa-solid fa-chart-bar" style="color:var(--primary-500)"></i> Weekly Visitor Traffic</span>
          <span class="text-sm text-muted">Last 7 days</span>
        </div>
        <div class="card-body">
          <div class="chart-container"><canvas id="visitorChart"></canvas></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa-solid fa-chart-donut" style="color:var(--orange-500)"></i> Complaint Categories</span>
        </div>
        <div class="card-body">
          <div class="chart-container"><canvas id="complaintChart"></canvas></div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa-solid fa-clock-rotate-left" style="color:var(--primary-500)"></i> Recent Visitors</span>
          <button class="btn btn-ghost btn-sm" onclick="navigateTo('visitors')">View All</button>
        </div>
        <div class="card-body" style="padding:0">
          ${
            activity.recentVisitors.length === 0
              ? emptyState("fa-users", "No recent visitors")
              : activity.recentVisitors
                  .map(
                    (v) => `
              <div class="flex items-center gap-3" style="padding:12px 20px;border-bottom:1px solid var(--gray-100)">
                <div class="user-avatar" style="width:36px;height:36px;font-size:13px;flex-shrink:0">${initials(v.name)}</div>
                <div style="flex:1;min-width:0">
                  <div class="font-semibold truncate" style="font-size:14px">${v.name}</div>
                  <div class="text-muted text-xs">${v.flatNo} · ${v.purpose}</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  ${statusBadge(v.status)}
                  <div class="text-xs text-muted mt-1">${timeAgo(v.createdAt)}</div>
                </div>
              </div>`,
                  )
                  .join("")
          }
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa-solid fa-triangle-exclamation" style="color:var(--orange-500)"></i> Recent Complaints</span>
          <button class="btn btn-ghost btn-sm" onclick="navigateTo('complaints')">View All</button>
        </div>
        <div class="card-body" style="padding:0">
          ${activity.recentComplaints
            .map(
              (c) => `
            <div class="flex items-center gap-3" style="padding:12px 20px;border-bottom:1px solid var(--gray-100)">
              <div class="cat-icon cat-${c.category}"><i class="fa-solid ${categoryIcon(c.category)}"></i></div>
              <div style="flex:1;min-width:0">
                <div class="font-semibold truncate" style="font-size:14px">${c.title}</div>
                <div class="text-muted text-xs">${c.flatNo} · ${c.residentName}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                ${statusBadge(c.status)}
                <div class="text-xs text-muted mt-1">${timeAgo(c.createdAt)}</div>
              </div>
            </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-header">
        <span class="card-title"><i class="fa-solid fa-bullhorn" style="color:var(--primary-500)"></i> Active Notices</span>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('notices')">Manage Notices</button>
      </div>
      <div class="card-body" style="padding:0">
        ${activity.recentNotices
          .map(
            (n) => `
          <div class="flex items-center gap-3" style="padding:14px 22px;border-bottom:1px solid var(--gray-100)">
            <div class="cat-icon" style="background:${n.priority === "urgent" ? "var(--red-100)" : n.priority === "important" ? "var(--orange-100)" : "var(--primary-100)"};color:${n.priority === "urgent" ? "var(--red-600)" : n.priority === "important" ? "var(--orange-600)" : "var(--primary-600)"}">
              <i class="fa-solid fa-bullhorn"></i>
            </div>
            <div style="flex:1">
              <div class="font-semibold" style="font-size:14px">${n.title}</div>
              <div class="text-muted text-xs">${formatDate(n.createdAt)} · ${n.acknowledgedBy.length} acknowledged</div>
            </div>
            <span class="badge badge-${n.priority}">${n.priority}</span>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;

  // Charts
  setTimeout(() => {
    drawVisitorChart(stats.weeklyVisitors);
    drawComplaintChart(stats.complaintsByCategory);
  }, 100);
}

function statCard(label, value, icon, color, sub, trend) {
  const trendIcon =
    trend === "up"
      ? "fa-arrow-trend-up"
      : trend === "down"
        ? "fa-arrow-trend-down"
        : "fa-minus";
  return `
    <div class="stat-card ${color}">
      <div class="stat-header">
        <div class="stat-icon ${color}"><i class="fa-solid ${icon}"></i></div>
        <span class="stat-trend ${trend}"><i class="fa-solid ${trendIcon}"></i></span>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
      <div style="font-size:12px;color:var(--gray-400);margin-top:4px">${sub}</div>
    </div>`;
}

function drawVisitorChart(data) {
  const ctx = el("visitorChart");
  if (!ctx) return;
  if (State.charts.visitor) State.charts.visitor.destroy();
  State.charts.visitor = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((d) => d.day),
      datasets: [
        {
          label: "Visitors",
          data: data.map((d) => d.count),
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          borderColor: "rgba(99, 102, 241, 0.8)",
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: { font: { size: 11 } },
        },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

function drawComplaintChart(data) {
  const ctx = el("complaintChart");
  if (!ctx) return;
  if (State.charts.complaint) State.charts.complaint.destroy();
  const colors = [
    "#6366f1",
    "#f97316",
    "#22c55e",
    "#3b82f6",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
  ];
  const filtered = data.filter((d) => d.count > 0);
  if (filtered.length === 0) {
    ctx.parentElement.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">📊</div><p class="text-muted">No complaint data yet</p></div>';
    return;
  }
  State.charts.complaint = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: filtered.map(
        (d) => d.category.charAt(0).toUpperCase() + d.category.slice(1),
      ),
      datasets: [
        {
          data: filtered.map((d) => d.count),
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { font: { size: 11 }, boxWidth: 12, padding: 12 },
        },
      },
      cutout: "60%",
    },
  });
}

function renderGuardDashboard(stats, activity) {
  const pc = el("page-content");
  pc.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Security Dashboard</h1>
        <p class="page-subtitle">Today's gate management overview</p>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('security')"><i class="fa-solid fa-shield-halved"></i> Open Security Panel</button>
    </div>
    <div class="stats-grid">
      ${statCard("Today's Visitors", stats.visitorsToday, "fa-users", "blue", "People entered today", "neutral")}
      ${statCard("Pending Approvals", stats.pendingApprovals, "fa-clock", stats.pendingApprovals > 0 ? "orange" : "green", "Awaiting resident approval", stats.pendingApprovals > 0 ? "down" : "neutral")}
      ${statCard("Active Residents", stats.totalResidents, "fa-house-user", "indigo", "Registered residents", "neutral")}
      ${statCard("Active Notices", stats.activeNotices, "fa-bullhorn", "purple", "From administration", "neutral")}
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fa-solid fa-list-check" style="color:var(--orange-500)"></i> Recent Gate Activity</span>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('security')"><i class="fa-solid fa-plus"></i> Log Visitor</button>
      </div>
      <div class="card-body" style="padding:0">
        ${activity.recentVisitors
          .map(
            (v) => `
          <div class="flex items-center gap-3" style="padding:14px 22px;border-bottom:1px solid var(--gray-100)">
            <div class="user-avatar" style="width:38px;height:38px;font-size:14px;flex-shrink:0">${initials(v.name)}</div>
            <div style="flex:1;min-width:0">
              <div class="font-semibold" style="font-size:14px">${v.name}</div>
              <div class="text-muted text-xs">${v.phone} · ${v.purpose} · Flat ${v.flatNo}</div>
            </div>
            <div style="text-align:right">
              ${statusBadge(v.status)}
              <div class="text-xs text-muted mt-1">${v.entryTime ? formatTime(v.entryTime) : timeAgo(v.createdAt)}</div>
            </div>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

function renderResidentDashboard(stats, activity) {
  const pc = el("page-content");
  pc.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Welcome, ${State.user.name.split(" ")[0]} 🏡</h1>
        <p class="page-subtitle">Your Greenwood Heights resident portal</p>
      </div>
    </div>
    <div class="stats-grid">
      ${statCard("My Visitors Today", stats.visitorsToday, "fa-users-viewfinder", "blue", "Logged at gate today", "neutral")}
      ${statCard("Open Complaints", stats.openComplaints, "fa-headset", stats.openComplaints > 0 ? "orange" : "green", "Your active complaints", "neutral")}
      ${statCard("Notices", stats.activeNotices, "fa-bullhorn", "indigo", "Unread announcements", "neutral")}
      ${statCard("Pending Bills", stats.billStats ? stats.billStats.unpaid + stats.billStats.overdue : 0, "fa-file-invoice-dollar", "orange", "Due this month", "neutral")}
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa-solid fa-clock-rotate-left" style="color:var(--primary-500)"></i> Recent Visitors</span>
          <button class="btn btn-primary btn-sm" onclick="openAddVisitorModal()"><i class="fa-solid fa-plus"></i> Pre-approve</button>
        </div>
        <div class="card-body" style="padding:0">
          ${activity.recentVisitors
            .slice(0, 4)
            .map(
              (v) => `
            <div class="flex items-center gap-3" style="padding:12px 20px;border-bottom:1px solid var(--gray-100)">
              <div class="user-avatar" style="width:34px;height:34px;font-size:12px;flex-shrink:0">${initials(v.name)}</div>
              <div style="flex:1;min-width:0">
                <div class="font-semibold truncate" style="font-size:14px">${v.name}</div>
                <div class="text-muted text-xs">${v.purpose} · ${timeAgo(v.createdAt)}</div>
              </div>
              ${statusBadge(v.status)}
            </div>`,
            )
            .join("")}
          ${activity.recentVisitors.length === 0 ? '<div class="empty-state" style="padding:30px"><div class="empty-state-icon" style="font-size:36px">🚶</div><p class="text-muted text-sm">No visitors logged today</p></div>' : ""}
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa-solid fa-bullhorn" style="color:var(--orange-500)"></i> Latest Notices</span>
          <button class="btn btn-ghost btn-sm" onclick="navigateTo('notices')">View All</button>
        </div>
        <div class="card-body" style="padding:0">
          ${activity.recentNotices
            .map(
              (n) => `
            <div style="padding:14px 20px;border-bottom:1px solid var(--gray-100);cursor:pointer" onclick="navigateTo('notices')">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge badge-${n.priority}">${n.priority}</span>
                <span style="font-size:11px;color:var(--gray-400)">${timeAgo(n.createdAt)}</span>
              </div>
              <div class="font-semibold" style="font-size:14px">${n.title}</div>
              <div class="text-muted text-xs mt-1">${n.content.substring(0, 80)}...</div>
            </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>`;
}

// ============ VISITORS PAGE ============
async function renderVisitors() {
  try {
    const [visitors, flats] = await Promise.all([
      API.get("/visitors"),
      API.get("/residents/flats/all"),
    ]);
    State.data.visitors = visitors;
    State.data.flats = flats;

    const role = State.user.role;
    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Visitor Management</h1>
          <p class="page-subtitle">${visitors.length} total visitors tracked</p>
        </div>
        <div class="page-header-actions">
          ${role !== "guard" ? `<button class="btn btn-outline-primary btn-sm" onclick="openAddVisitorModal()"><i class="fa-solid fa-calendar-check"></i> Pre-approve</button>` : ""}
          <button class="btn btn-primary btn-sm" onclick="openAddVisitorModal()"><i class="fa-solid fa-plus"></i> Log Visitor</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-body" style="padding:16px 20px">
          <div class="filter-bar" style="margin-bottom:0">
            <div class="search-input-wrapper">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input type="text" class="search-input" placeholder="Search by name, phone, flat..." id="visitor-search" oninput="filterVisitors()">
            </div>
            <select class="form-input" style="width:auto" id="visitor-status-filter" onchange="filterVisitors()">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="exited">Exited</option>
            </select>
            <button class="btn btn-ghost btn-sm" onclick="loadTodayVisitors()"><i class="fa-solid fa-calendar-day"></i> Today Only</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa-solid fa-users-viewfinder" style="color:var(--primary-500)"></i> Visitor Log</span>
          <span class="text-muted text-sm" id="visitor-count">${visitors.length} records</span>
        </div>
        <div class="table-wrapper">
          <table class="data-table" id="visitors-table">
            <thead>
              <tr>
                <th>Visitor</th><th>Flat / Resident</th><th>Purpose</th><th>Entry Time</th><th>Exit Time</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody id="visitors-tbody">
              ${renderVisitorRows(visitors)}
            </tbody>
          </table>
        </div>
        ${visitors.length === 0 ? emptyState("fa-users", "No visitors logged", "Visitor records will appear here once logged by the security guard.") : ""}
      </div>

      ${getVisitorModal(flats)}`;

    setupModalClose("visitor-modal");
  } catch (err) {
    showError(err.message || "Failed to load visitors");
  }
}

function renderVisitorRows(visitors) {
  if (visitors.length === 0)
    return `<tr><td colspan="7">${emptyState("fa-users", "No visitors found")}</td></tr>`;
  return visitors
    .map(
      (v) => `
    <tr>
      <td>
        <div class="flex items-center gap-2">
          <div class="user-avatar" style="width:34px;height:34px;font-size:12px;flex-shrink:0">${initials(v.name)}</div>
          <div>
            <div class="font-semibold">${v.name}</div>
            <div class="text-muted text-xs">${v.phone}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="font-semibold">${v.flatNo}</div>
        <div class="text-muted text-xs">${v.residentName}</div>
      </td>
      <td>${v.purpose}</td>
      <td>${v.entryTime ? `<div>${formatTime(v.entryTime)}</div><div class="text-xs text-muted">${formatDate(v.entryTime)}</div>` : '<span class="text-muted">—</span>'}</td>
      <td>${v.exitTime ? `<div>${formatTime(v.exitTime)}</div>` : '<span class="text-muted">—</span>'}</td>
      <td>${statusBadge(v.status)}</td>
      <td>
        <div class="flex gap-2">
          ${
            v.status === "pending"
              ? `
            <button class="btn btn-success btn-sm" onclick="approveVisitor('${v.id}')"><i class="fa-solid fa-check"></i></button>
            <button class="btn btn-danger btn-sm" onclick="rejectVisitor('${v.id}')"><i class="fa-solid fa-times"></i></button>`
              : ""
          }
          ${v.status === "approved" ? `<button class="btn btn-ghost btn-sm" onclick="exitVisitor('${v.id}')"><i class="fa-solid fa-door-open"></i> Exit</button>` : ""}
          <button class="btn btn-ghost btn-icon" onclick="deleteVisitor('${v.id}')" title="Delete"><i class="fa-solid fa-trash" style="color:var(--red-500)"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

function getVisitorModal(flats) {
  return `
    <div class="modal-overlay" id="visitor-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Log New Visitor</span>
          <div class="modal-close" onclick="Modal.close('visitor-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <form id="visitor-form" onsubmit="submitVisitor(event)">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Visitor Name <span class="required">*</span></label>
                <input type="text" class="form-input" id="v-name" placeholder="Full name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number <span class="required">*</span></label>
                <input type="tel" class="form-input" id="v-phone" placeholder="10-digit mobile" required>
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Flat <span class="required">*</span></label>
                <select class="form-input" id="v-flat" required>
                  <option value="">Select flat</option>
                  ${flats
                    .filter((f) => f.status === "occupied")
                    .map(
                      (f) =>
                        `<option value="${f.id}">${f.flatNo} — ${f.owner ? f.owner.name : "Resident"}</option>`,
                    )
                    .join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Purpose <span class="required">*</span></label>
                <select class="form-input" id="v-purpose" required>
                  <option value="">Select purpose</option>
                  <option>Personal Visit</option>
                  <option>Delivery</option>
                  <option>Courier</option>
                  <option>Maid</option>
                  <option>Plumber</option>
                  <option>Electrician</option>
                  <option>Carpenter</option>
                  <option>Cook</option>
                  <option>Driver</option>
                  <option>Official Work</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Vehicle Number <span style="color:var(--gray-400);font-weight:400">(optional)</span></label>
              <input type="text" class="form-input" id="v-vehicle" placeholder="e.g. MH12AB1234">
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:10px">
              <input type="checkbox" id="v-preapproved" style="width:16px;height:16px;accent-color:var(--primary-500)">
              <label for="v-preapproved" style="font-size:14px;color:var(--gray-700);cursor:pointer">Pre-approved visitor (bypass approval)</label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('visitor-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitVisitor(event)"><i class="fa-solid fa-check"></i> Log Visitor</button>
        </div>
      </div>
    </div>`;
}

function openAddVisitorModal() {
  Modal.open("visitor-modal");
}

async function submitVisitor(e) {
  e.preventDefault();
  const flatId = el("v-flat").value;
  const name = el("v-name").value.trim();
  const phone = el("v-phone").value.trim();
  const purpose = el("v-purpose").value;
  const vehicleNo = el("v-vehicle").value.trim();
  const isPreApproved = el("v-preapproved").checked;

  if (!name || !phone || !flatId || !purpose) {
    Toast.error("Validation Error", "Please fill all required fields");
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    Toast.error("Invalid Phone", "Enter a valid 10-digit phone number");
    return;
  }

  try {
    await API.post("/visitors", {
      name,
      phone,
      purpose,
      flatId,
      vehicleNo,
      isPreApproved,
      guardId: State.user.id,
    });
    Toast.success("Visitor Logged", `${name} has been logged successfully`);
    Modal.close("visitor-modal");
    renderVisitors();
  } catch (err) {
    Toast.error("Failed", err.message);
  }
}

async function approveVisitor(id) {
  try {
    await API.put(`/visitors/${id}/approve`, { approvedBy: State.user.id });
    Toast.success("Approved", "Visitor has been approved for entry");
    renderVisitors();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function rejectVisitor(id) {
  try {
    await API.put(`/visitors/${id}/reject`, {});
    Toast.warning("Rejected", "Visitor entry has been rejected");
    renderVisitors();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function exitVisitor(id) {
  try {
    await API.put(`/visitors/${id}/exit`, {});
    Toast.info("Exit Logged", "Visitor exit has been recorded");
    renderVisitors();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function deleteVisitor(id) {
  Modal.confirm(
    "Delete Visitor Record",
    "This will permanently remove the visitor record. This action cannot be undone.",
    async () => {
      try {
        await API.delete(`/visitors/${id}`);
        Toast.success("Deleted", "Visitor record removed");
        renderVisitors();
      } catch (err) {
        Toast.error("Error", err.message);
      }
    },
  );
}

async function loadTodayVisitors() {
  const data = await API.get("/visitors/today");
  const tbody = el("visitors-tbody");
  if (tbody) tbody.innerHTML = renderVisitorRows(data);
  const cnt = el("visitor-count");
  if (cnt) cnt.textContent = `${data.length} records (today)`;
}

function filterVisitors() {
  const search = el("visitor-search")?.value.toLowerCase() || "";
  const status = el("visitor-status-filter")?.value || "";
  const visitors = State.data.visitors.filter((v) => {
    const matchSearch =
      !search ||
      v.name.toLowerCase().includes(search) ||
      v.phone.includes(search) ||
      v.flatNo.toLowerCase().includes(search) ||
      v.purpose.toLowerCase().includes(search);
    const matchStatus = !status || v.status === status;
    return matchSearch && matchStatus;
  });
  const tbody = el("visitors-tbody");
  if (tbody) tbody.innerHTML = renderVisitorRows(visitors);
  const cnt = el("visitor-count");
  if (cnt) cnt.textContent = `${visitors.length} records`;
}

// ============ RESIDENTS PAGE ============
async function renderResidents() {
  try {
    const [residents, flats] = await Promise.all([
      API.get("/residents"),
      API.get("/residents/flats/all"),
    ]);
    State.data.residents = residents;
    State.data.flats = flats;

    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Residents & Flats</h1>
          <p class="page-subtitle">${residents.length} residents · ${flats.length} total flats</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost btn-sm" onclick="openFlatModal()"><i class="fa-solid fa-plus"></i> Add Flat</button>
          <button class="btn btn-primary btn-sm" onclick="openResidentModal()"><i class="fa-solid fa-user-plus"></i> Add Resident</button>
        </div>
      </div>

      <div class="tabs" style="margin-bottom:20px">
        <div class="tab active" id="tab-flats" onclick="switchResidentTab('flats')">Flats Overview</div>
        <div class="tab" id="tab-residents" onclick="switchResidentTab('residents')">All Residents</div>
      </div>

      <div id="tab-content-flats" class="page-transition">
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" class="search-input" placeholder="Search flat number, block..." id="flat-search" oninput="filterFlats()">
          </div>
          <select class="form-input" style="width:auto" id="flat-block-filter" onchange="filterFlats()">
            <option value="">All Blocks</option>
            ${[...new Set(flats.map((f) => f.block))].map((b) => `<option value="${b}">Block ${b}</option>`).join("")}
          </select>
          <select class="form-input" style="width:auto" id="flat-status-filter" onchange="filterFlats()">
            <option value="">All Status</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>
        </div>
        <div id="flats-grid" class="grid-3">
          ${renderFlatCards(flats)}
        </div>
      </div>

      <div id="tab-content-residents" class="hidden page-transition">
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" class="search-input" placeholder="Search resident name, email..." id="resident-search" oninput="filterResidents()">
          </div>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table class="data-table" id="residents-table">
              <thead><tr><th>Resident</th><th>Contact</th><th>Flat</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody id="residents-tbody">${renderResidentRows(residents, flats)}</tbody>
            </table>
          </div>
        </div>
      </div>

      ${getResidentModal(flats)}
      ${getFlatModal()}
      ${getFlatDetailsModal()}`;

    setupModalClose("resident-modal");
    setupModalClose("flat-modal");
    setupModalClose("flat-details-modal");
  } catch (err) {
    showError(err.message || "Failed to load residents");
  }
}

function renderFlatCards(flats) {
  if (flats.length === 0)
    return emptyState("fa-building", "No flats added yet");
  return flats
    .map(
      (f) => `
    <div class="flat-card" style="cursor:pointer" onclick="openFlatDetailsModal('${f.id}')">
      <div class="flat-card-top">
        <div>
          <div class="flat-number">${f.flatNo}</div>
          <div class="flat-type">Block ${f.block} · ${f.type}</div>
        </div>
        <span class="badge badge-${f.status}"><span class="badge-dot"></span>${f.status}</span>
      </div>
      <div class="flat-card-body">
        <div class="flat-info-row"><i class="fa-solid fa-layer-group"></i> ${f.type} · Floor ${f.floor} · ${f.area} sq ft</div>
        ${f.ownerDetails ? `<div class="flat-info-row"><i class="fa-solid fa-user-tie"></i> ${f.ownerDetails.name} <span style="font-size:11px;color:var(--gray-400)">(Owner)</span></div>` : ""}
        ${f.tenantDetails ? `<div class="flat-info-row"><i class="fa-solid fa-user"></i> ${f.tenantDetails.name} <span style="font-size:11px;color:var(--gray-400)">(Tenant)</span></div>` : ""}
        ${f.status === "vacant" ? `<div class="flat-info-row" style="color:var(--orange-600)"><i class="fa-solid fa-circle-exclamation" style="color:var(--orange-500)"></i> Vacant</div>` : ""}
        ${f.vehicles && f.vehicles.length > 0 ? `<div class="flat-info-row"><i class="fa-solid fa-car"></i> ${f.vehicles.map((v) => v.number).join(", ")}</div>` : ""}
      </div>
      <div class="flat-card-footer">
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); editFlat('${f.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-ghost btn-sm" style="color:var(--red-500)" onclick="event.stopPropagation(); deleteFlat('${f.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`,
    )
    .join("");
}

function renderResidentRows(residents, flats) {
  if (residents.length === 0)
    return `<tr><td colspan="6">${emptyState("fa-users", "No residents found")}</td></tr>`;
  return residents
    .map((r) => {
      const flat = flats.find((f) => f.id === r.flatId);
      const isOwner = flat?.ownerId === r.id;
      return `
      <tr>
        <td>
          <div class="flex items-center gap-2">
            <div class="user-avatar" style="width:36px;height:36px;font-size:13px;flex-shrink:0">${initials(r.name)}</div>
            <div>
              <div class="font-semibold">${r.name}</div>
              <div class="text-muted text-xs">${r.email}</div>
            </div>
          </div>
        </td>
        <td><div>${r.phone}</div><div class="text-xs text-muted">${r.email}</div></td>
        <td>${flat ? `<span class="font-semibold">${flat.flatNo}</span><div class="text-xs text-muted">${flat.type} · Block ${flat.block}</div>` : '<span class="text-muted">Unassigned</span>'}</td>
        <td><span class="badge ${isOwner ? "badge-approved" : "badge-in_progress"}">${isOwner ? "🏠 Owner" : "👤 Tenant"}</span></td>
        <td><span class="badge ${r.isActive ? "badge-approved" : "badge-rejected"}">${r.isActive ? "Active" : "Inactive"}</span></td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-icon" onclick="editResident('${r.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-ghost btn-icon" onclick="deleteResident('${r.id}')" title="Delete"><i class="fa-solid fa-trash" style="color:var(--red-500)"></i></button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

function getResidentModal(flats) {
  return `
    <div class="modal-overlay" id="resident-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="resident-modal-title">Add Resident</span>
          <div class="modal-close" onclick="Modal.close('resident-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <input type="hidden" id="r-id">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" class="form-input" id="r-name" placeholder="e.g. Priya Mehta" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone <span class="required">*</span></label>
              <input type="tel" class="form-input" id="r-phone" placeholder="10-digit mobile">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input type="email" class="form-input" id="r-email" placeholder="resident@example.com">
            </div>
            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <input type="text" class="form-input" id="r-password" placeholder="e.g. Pass@123" value="Pass@123">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Assign Flat</label>
              <select class="form-input" id="r-flat">
                <option value="">No flat assigned</option>
                ${flats.map((f) => `<option value="${f.id}">${f.flatNo} — Block ${f.block}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Resident Role</label>
              <select class="form-input" id="r-type">
                <option value="owner">Owner</option>
                <option value="renting_family">Renting Family</option>
                <option value="renting_flatmates">Renting Flatmates</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Occupancy Status</label>
            <select class="form-input" id="r-occupancy">
              <option value="residing">Residing</option>
              <option value="let_out">Let Out</option>
              <option value="empty">Empty</option>
            </select>
          </div>
          <div class="form-group" style="background:var(--primary-50);border-radius:var(--radius-md);padding:12px 14px;margin-top:4px">
            <p style="font-size:13px;color:var(--primary-700)"><i class="fa-solid fa-circle-info" style="margin-right:6px"></i>A resident account will be created and the flat will be linked automatically based on the selected role.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('resident-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitResident()"><i class="fa-solid fa-check"></i> Save Resident</button>
        </div>
      </div>
    </div>`;
}

function getFlatModal() {
  return `
    <div class="modal-overlay" id="flat-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="flat-modal-title">Add Flat</span>
          <div class="modal-close" onclick="Modal.close('flat-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <input type="hidden" id="fl-id">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Flat No. <span class="required">*</span></label>
              <input type="text" class="form-input" id="fl-no" placeholder="e.g. A-101">
            </div>
            <div class="form-group">
              <label class="form-label">Block <span class="required">*</span></label>
              <input type="text" class="form-input" id="fl-block" placeholder="e.g. A, B, C">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" class="form-input" id="fl-floor" placeholder="e.g. 1">
            </div>
            <div class="form-group">
              <label class="form-label">Area (sq ft)</label>
              <input type="number" class="form-input" id="fl-area" placeholder="850">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Flat Type <span class="required">*</span></label>
            <select class="form-input" id="fl-type">
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK" selected>2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="4BHK+">4 BHK+</option>
            </select>
          </div>

          <hr style="margin:18px 0;border:none;border-top:1px solid var(--gray-200)">
          <div class="form-group">
            <label style="font-size:14px;font-weight:600;color:var(--gray-700);display:flex;align-items:center;gap:6px;cursor:pointer" onclick="toggleOwnerFields()">
              <i class="fa-solid fa-user-tie" style="color:var(--primary-500)"></i> Owner Details
              <span style="font-size:11px;font-weight:400;color:var(--gray-400)">(optional — fill to auto-create resident &amp; mark flat occupied)</span>
            </label>
          </div>
          <div id="owner-fields" style="display:none">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Owner Name</label>
                <input type="text" class="form-input" id="fl-owner-name" placeholder="Full name">
              </div>
              <div class="form-group">
                <label class="form-label">Owner Phone</label>
                <input type="tel" class="form-input" id="fl-owner-phone" placeholder="10-digit mobile">
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Owner Email</label>
                <input type="email" class="form-input" id="fl-owner-email" placeholder="owner@example.com">
              </div>
              <div class="form-group">
                <label class="form-label">Owner Password</label>
                <input type="text" class="form-input" id="fl-owner-password" placeholder="Pass@123">
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Resident Role</label>
                <select class="form-input" id="fl-user-role">
                  <option value="owner">Owner</option>
                  <option value="renting_family">Renting Family</option>
                  <option value="renting_flatmates">Renting Flatmates</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Occupancy Status</label>
                <select class="form-input" id="fl-occupancy-status">
                  <option value="residing">Residing</option>
                  <option value="let_out">Let Out</option>
                  <option value="empty">Empty</option>
                </select>
              </div>
            </div>
            <p style="font-size:12px;color:var(--gray-500);margin-top:2px"><i class="fa-solid fa-circle-info"></i> If name, phone and email are provided, a resident account will be created automatically and the flat will be set to <strong>Occupied</strong>.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('flat-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitFlat()"><i class="fa-solid fa-check"></i> Save Flat</button>
        </div>
      </div>
    </div>`;
}

function getFlatDetailsModal() {
  return `
    <div class="modal-overlay" id="flat-details-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Flat Details</span>
          <div class="modal-close" onclick="Modal.close('flat-details-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body" id="flat-details-content">
          <!-- Populated dynamically -->
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="Modal.close('flat-details-modal')">Close</button>
        </div>
      </div>
    </div>`;
}

function openFlatDetailsModal(id) {
  const flat = State.data.flats.find((f) => f.id === id);
  if (!flat) return;
  const content = el("flat-details-content");
  
  let html = `
    <div style="margin-bottom:20px;">
      <h3 style="margin-bottom:8px;font-size:16px;">Flat Info</h3>
      <p><strong>Flat:</strong> ${flat.flatNo} (Block ${flat.block})</p>
      <p><strong>Type:</strong> ${flat.type}</p>
      <p><strong>Floor:</strong> ${flat.floor}</p>
      <p><strong>Area:</strong> ${flat.area} sq ft</p>
      <p><strong>Status:</strong> ${flat.status}</p>
    </div>
  `;

  if (flat.ownerDetails) {
    html += `
      <div style="margin-bottom:20px;padding:15px;background:var(--gray-50);border-radius:8px;">
        <h3 style="margin-bottom:8px;font-size:15px;color:var(--primary-600)"><i class="fa-solid fa-user-tie"></i> Owner Details</h3>
        <p><strong>Name:</strong> ${flat.ownerDetails.name || "N/A"}</p>
        <p><strong>Phone:</strong> ${flat.ownerDetails.phone || "N/A"}</p>
        <p><strong>Email:</strong> ${flat.ownerDetails.email || "N/A"}</p>
      </div>
    `;
  } else {
    html += `<div style="margin-bottom:20px;padding:15px;background:var(--gray-50);border-radius:8px;"><p style="color:var(--gray-500)">No owner assigned</p></div>`;
  }

  if (flat.tenantDetails) {
    html += `
      <div style="padding:15px;background:var(--gray-50);border-radius:8px;">
        <h3 style="margin-bottom:8px;font-size:15px;color:var(--primary-600)"><i class="fa-solid fa-user"></i> Tenant Details</h3>
        <p><strong>Name:</strong> ${flat.tenantDetails.name || "N/A"}</p>
        <p><strong>Phone:</strong> ${flat.tenantDetails.phone || "N/A"}</p>
        <p><strong>Email:</strong> ${flat.tenantDetails.email || "N/A"}</p>
      </div>
    `;
  } else {
    html += `<div style="padding:15px;background:var(--gray-50);border-radius:8px;"><p style="color:var(--gray-500)">No tenant assigned</p></div>`;
  }
  
  content.innerHTML = html;
  Modal.open("flat-details-modal");
}

function toggleOwnerFields() {
  const el = document.getElementById('owner-fields');
  if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
}

function openResidentModal(id) {
  el("r-id").value = id || "";
  el("r-name").value = "";
  el("r-phone").value = "";
  el("r-email").value = "";
  el("r-password").value = "Pass@123";
  el("r-flat").value = "";
  el("r-type").value = "owner";
  el("r-occupancy").value = "residing";
  el("resident-modal-title").textContent = id ? "Edit Resident" : "Add Resident";
  if (id) {
    const r = State.data.residents.find((x) => x.id === id);
    if (r) {
      el("r-name").value = r.name;
      el("r-phone").value = r.phone;
      el("r-email").value = r.email || "";
      el("r-flat").value = r.flatId || "";
      // Pre-fill role from linked flat data
      const linkedFlat = State.data.flats.find((f) => f.id === r.flatId);
      if (linkedFlat) {
        el("r-type").value = linkedFlat.userRole || "owner";
        el("r-occupancy").value = linkedFlat.occupancyStatus || "residing";
      }
      // Hide password field on edit (not required)
      const pwdGroup = el("r-password")?.closest(".form-group");
      if (pwdGroup) pwdGroup.style.display = "none";
    }
  } else {
    const pwdGroup = el("r-password")?.closest(".form-group");
    if (pwdGroup) pwdGroup.style.display = "";
  }
  Modal.open("resident-modal");
}

function openFlatModal(id) {
  el("fl-id").value = id || "";
  el("fl-no").value = "";
  el("fl-block").value = "";
  el("fl-floor").value = "";
  el("fl-area").value = "";
  el("fl-type").value = "2BHK";
  el("fl-owner-name").value = "";
  el("fl-owner-phone").value = "";
  el("fl-owner-email").value = "";
  el("fl-owner-password").value = "";
  el("fl-user-role").value = "owner";
  el("fl-occupancy-status").value = "residing";
  document.getElementById('owner-fields').style.display = 'none';
  el("flat-modal-title").textContent = id ? "Edit Flat" : "Add Flat";
  if (id) {
    const f = State.data.flats.find((x) => x.id === id);
    if (f) {
      el("fl-no").value = f.flatNo;
      el("fl-block").value = f.block;
      el("fl-floor").value = f.floor;
      el("fl-area").value = f.area;
      el("fl-type").value = f.type || "2BHK";
      el("fl-user-role").value = f.userRole || "owner";
      el("fl-occupancy-status").value = f.occupancyStatus || "residing";

      const details = (f.userRole === "owner" || !f.userRole) ? f.ownerDetails : f.tenantDetails;
      if (details) {
        el("fl-owner-name").value = details.name || "";
        el("fl-owner-phone").value = details.phone || "";
        el("fl-owner-email").value = details.email || "";
        document.getElementById('owner-fields').style.display = '';
      }
    }
  }
  Modal.open("flat-modal");
}

function editResident(id) {
  openResidentModal(id);
}
function editFlat(id) {
  openFlatModal(id);
}

async function submitResident() {
  const id = el("r-id").value;
  const name = el("r-name").value.trim();
  const email = el("r-email").value.trim();
  const phone = el("r-phone").value.trim();
  const password = el("r-password")?.value.trim() || "Pass@123";
  const flatId = el("r-flat").value;
  const selectedRole = el("r-type").value;
  const userRole = selectedRole; // keep original role (owner, renting_family, renting_flatmates)
  const occupancyStatus = el("r-occupancy").value;

  if (!name || !phone) {
    Toast.error("Validation", "Name and phone are required");
    return;
  }
  if (!id && !email) {
    Toast.error("Validation", "Email is required when adding a new resident");
    return;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    Toast.error("Validation", "Please enter a valid email address");
    return;
  }
  if (!id && !/^\d{10}$/.test(phone)) {
    Toast.error("Validation", "Phone must be a 10-digit number");
    return;
  }

  try {
    if (id) {
      await API.put(`/residents/${id}`, { name, email, flatId, userRole, occupancyStatus });
      Toast.success("Updated", "Resident updated successfully");
    } else {
      await API.post("/residents", { name, email, phone, password, flatId, userRole, occupancyStatus });
      Toast.success("Added", "Resident added successfully");
    }
    Modal.close("resident-modal");
    renderResidents();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function submitFlat() {
  const id = el("fl-id").value;
  const flatNo = el("fl-no").value.trim();
  const block = el("fl-block").value.trim();
  const floor = el("fl-floor").value.trim() || "1";
  const area = parseInt(el("fl-area").value) || 0;
  const type = el("fl-type").value;

  // Owner fields
  const ownerName    = el("fl-owner-name").value.trim();
  const ownerPhone   = el("fl-owner-phone").value.trim();
  const ownerEmail   = el("fl-owner-email").value.trim();
  const ownerPassword = el("fl-owner-password").value.trim();
  const userRole     = el("fl-user-role").value;
  const occupancyStatus = el("fl-occupancy-status").value;

  const hasOwnerDetails = ownerName && ownerPhone && ownerEmail;

  if (!flatNo || !block || !type) {
    Toast.error("Validation", "Flat number, block and flat type are required");
    return;
  }
  if (hasOwnerDetails && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    Toast.error("Validation", "Please enter a valid owner email address");
    return;
  }

  try {
    let newFlat;
    const body = { 
        flatNo, block, floor: parseInt(floor), area, type, userRole, occupancyStatus
    };
    if (hasOwnerDetails) {
        body.ownerName = ownerName;
        body.ownerPhone = ownerPhone;
        body.ownerEmail = ownerEmail;
        body.ownerPassword = ownerPassword;
    }

    if (id) {
      // ---- Edit existing flat ----
      const existingFlat = State.data.flats.find(x => x.id === id);
      if (existingFlat && hasOwnerDetails) {
        const details = (existingFlat.userRole === "owner" || !existingFlat.userRole) ? existingFlat.ownerDetails : existingFlat.tenantDetails;
        if (details && details.name === ownerName && details.phone === ownerPhone && details.email === ownerEmail) {
          delete body.ownerName;
          delete body.ownerPhone;
          delete body.ownerEmail;
          delete body.ownerPassword;
        }
      }
      
      const res = await API.put(`/residents/flats/${id}`, body);
      newFlat = res;
      Toast.success("Updated", "Flat updated");
    } else {
      // ---- Create new flat ----
      newFlat = await API.post("/residents/flats", body);
      Toast.success("Added", `Flat ${flatNo} created`);
      if (hasOwnerDetails) {
          Toast.success("Resident Linked", `${ownerName} assigned to flat ${flatNo}`);
      }
    }

    Modal.close("flat-modal");
    renderResidents();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function deleteResident(id) {
  const r = State.data.residents.find((x) => x.id === id);
  Modal.confirm(
    "Remove Resident",
    `Are you sure you want to remove <strong>${r?.name}</strong> from the system? This action cannot be undone.`,
    async () => {
      try {
        await API.delete(`/residents/${id}`);
        Toast.success("Removed", "Resident removed successfully");
        renderResidents();
      } catch (err) {
        Toast.error("Error", err.message);
      }
    },
  );
}

async function deleteFlat(id) {
  const f = State.data.flats.find((x) => x.id === id);
  Modal.confirm(
    "Delete Flat",
    `Are you sure you want to delete flat <strong>${f?.flatNo}</strong>? All associated data will be affected.`,
    async () => {
      try {
        await API.delete(`/residents/flats/${id}`);
        Toast.success("Deleted", "Flat deleted");
        renderResidents();
      } catch (err) {
        Toast.error("Error", err.message);
      }
    },
  );
}

function switchResidentTab(tab) {
  el("tab-content-flats").classList.toggle("hidden", tab !== "flats");
  el("tab-content-residents").classList.toggle("hidden", tab !== "residents");
  el("tab-flats").classList.toggle("active", tab === "flats");
  el("tab-residents").classList.toggle("active", tab === "residents");
}

function filterFlats() {
  const search = el("flat-search")?.value.toLowerCase() || "";
  const block = el("flat-block-filter")?.value || "";
  const status = el("flat-status-filter")?.value || "";
  const filtered = State.data.flats.filter((f) => {
    const ms =
      !search ||
      f.flatNo.toLowerCase().includes(search) ||
      f.block.toLowerCase().includes(search);
    const mb = !block || f.block === block;
    const mst = !status || f.status === status;
    return ms && mb && mst;
  });
  const grid = el("flats-grid");
  if (grid) grid.innerHTML = renderFlatCards(filtered);
}

function filterResidents() {
  const search = el("resident-search")?.value.toLowerCase() || "";
  const filtered = State.data.residents.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search) ||
      r.email.toLowerCase().includes(search) ||
      r.phone.includes(search),
  );
  const tbody = el("residents-tbody");
  if (tbody) tbody.innerHTML = renderResidentRows(filtered, State.data.flats);
}

// ============ POLLS PAGE ============
async function renderPolls() {
  const pc = el("page-content");
  pc.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Polls</h1>
        <p class="page-subtitle">Manage society polls</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-ghost btn-sm" onclick="renderPolls()"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Society Polls</span>
      </div>
      <div class="card-body" style="padding:0">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Ends At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="polls-list">
              <tr><td colspan="6" style="text-align:center;padding:20px;">Loading polls...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  try {
    const response = await API.get("/communications/polls?limit=100");
    let polls = [];
    if (Array.isArray(response)) polls = response;
    else if (response.data && Array.isArray(response.data)) polls = response.data;
    else if (response.data && Array.isArray(response.data.data)) polls = response.data.data;

    const listEl = el("polls-list");
    if (!polls || polls.length === 0) {
      listEl.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500)">No polls found.</td></tr>';
      return;
    }

    listEl.innerHTML = polls.map(p => `
      <tr>
        <td style="font-weight:600;">${p.question}</td>
        <td><span class="badge" style="background:var(--gray-100);color:var(--gray-800)">${p.poll_type}</span></td>
        <td>${p.is_active ? '<span class="badge" style="background:var(--green-100);color:var(--green-800)">Active</span>' : '<span class="badge" style="background:var(--gray-100);color:var(--gray-600)">Closed</span>'}</td>
        <td>${p.created_by_name || 'Admin'}</td>
        <td>${new Date(p.ends_at).toLocaleDateString()}</td>
        <td>
          <div class="flex items-center gap-2">
            ${p.is_active ? `<button class="btn btn-ghost btn-sm" onclick="closePoll(${p.id})" title="Close Poll"><i class="fa-solid fa-lock" style="color:var(--orange-500)"></i></button>` : ''}
            <button class="btn btn-ghost btn-sm" onclick="deletePoll(${p.id})" title="Delete Poll"><i class="fa-solid fa-trash" style="color:var(--red-500)"></i></button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    showError(err.message || "Failed to load polls");
  }
}

async function closePoll(id) {
  Modal.confirm("Close Poll", "Are you sure you want to close this poll? Voting will be stopped.", async () => {
    try {
      await API.put(`/communications/polls/${id}`, { is_active: false });
      Toast.success("Poll Closed", "The poll has been closed successfully.");
      renderPolls();
    } catch(err) {
      showError(err.message || "Failed to close poll");
    }
  });
}

async function deletePoll(id) {
  Modal.confirm("Delete Poll", "Are you sure you want to delete this poll? All votes and data will be lost.", async () => {
    try {
      await API.delete(`/communications/polls/${id}`);
      Toast.success("Poll Deleted", "The poll has been deleted successfully.");
      renderPolls();
    } catch(err) {
      showError(err.message || "Failed to delete poll");
    }
  });
}

// ============ COMMUNITY PAGE ============
async function renderComplaints() {
  try {
    const [complaints, staff] = await Promise.all([
      API.get(
        "/complaints" +
          (State.user.role === "resident"
            ? `?residentId=${State.user.id}`
            : ""),
      ),
      State.user.role === "admin"
        ? API.get("/staff")
        : Promise.resolve([]),
    ]);
    State.data.complaints = complaints;
    State.data.staff = staff;
    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Complaint Helpdesk</h1>
          <p class="page-subtitle">${complaints.length} total complaints tracked</p>
        </div>
        ${
          State.user.role === "resident"
            ? `<button class="btn btn-primary btn-sm" onclick="openComplaintModal()"><i class="fa-solid fa-plus"></i> Raise Complaint</button>`
            : ""
        }
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-body" style="padding:16px 20px">
          <div class="filter-bar" style="margin-bottom:0">
            <div class="search-input-wrapper">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input type="text" class="search-input" placeholder="Search complaints..." id="comp-search" oninput="filterComplaints()">
            </div>
            <select class="form-input" style="width:auto" id="comp-status-filter" onchange="filterComplaints()">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select class="form-input" style="width:auto" id="comp-cat-filter" onchange="filterComplaints()">
              <option value="">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div id="complaints-list">
        ${renderComplaintCards(complaints)}
      </div>

      ${getComplaintModal()}
      ${getComplaintDetailModal()}`;

    setupModalClose("complaint-modal");
    setupModalClose("complaint-detail-modal");
  } catch (err) {
    showError(err.message || "Failed to load complaints");
  }
}

function renderComplaintCards(complaints) {
  if (complaints.length === 0)
    return emptyState(
      "fa-headset",
      "No complaints found",
      "All quiet here! No complaints have been raised yet.",
      "openComplaintModal()",
    );
  return `<div style="display:flex;flex-direction:column;gap:12px">${complaints
    .map(
      (c) => `
    <div class="complaint-card">
      <div class="complaint-card-header">
        <div style="flex:1">
          <div class="flex items-center gap-2 mb-2">
            <div class="cat-icon cat-${c.category}"><i class="fa-solid ${categoryIcon(c.category)}"></i></div>
            <div class="complaint-card-title">${c.title}</div>
          </div>
          <div class="complaint-card-meta">
            ${statusBadge(c.status)}
            ${priorityBadge(c.priority)}
            <span class="text-xs text-muted"><i class="fa-solid fa-building"></i> ${c.flatNo}</span>
            <span class="text-xs text-muted"><i class="fa-solid fa-user"></i> ${c.residentName}</span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div class="text-xs text-muted">${timeAgo(c.createdAt)}</div>
          ${c.assignedTo ? `<div class="text-xs" style="color:var(--primary-600);margin-top:4px"><i class="fa-solid fa-user-check"></i> ${c.assignedTo}</div>` : ""}
        </div>
      </div>
      <div class="complaint-card-body">
        <div class="complaint-card-desc">${c.description.substring(0, 120)}${c.description.length > 120 ? "..." : ""}</div>
      </div>
      <div class="complaint-card-footer">
        <div class="complaint-progress">
          <i class="fa-solid fa-comment" style="color:var(--gray-400)"></i>
          <span>${c.comments.length} comment${c.comments.length !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>${formatDate(c.createdAt)}</span>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" onclick="openComplaintDetail('${c.id}')"><i class="fa-solid fa-eye"></i> View</button>
          ${
            State.user.role === "admin"
              ? `
            <button class="btn btn-outline-primary btn-sm" onclick="updateComplaintStatus('${c.id}', 'in_progress')">In Progress</button>
            <button class="btn btn-success btn-sm" onclick="updateComplaintStatus('${c.id}', 'resolved')"><i class="fa-solid fa-check"></i> Resolve</button>`
              : ""
          }
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteComplaint('${c.id}')" title="Delete"><i class="fa-solid fa-trash" style="color:var(--red-400)"></i></button>
        </div>
      </div>
    </div>`,
    )
    .join("")}</div>`;
}

function getComplaintModal() {
  return `
    <div class="modal-overlay" id="complaint-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Raise a Complaint</span>
          <div class="modal-close" onclick="Modal.close('complaint-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Title <span class="required">*</span></label>
            <input type="text" class="form-input" id="cp-title" placeholder="Brief description of the issue">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Category <span class="required">*</span></label>
              <select class="form-input" id="cp-category">
                <option value="">Select category</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="security">🛡️ Security</option>
                <option value="billing">💰 Billing</option>
                <option value="general">📋 General</option>
                <option value="other">❓ Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select class="form-input" id="cp-priority">
                <option value="low">🟢 Low</option>
                <option value="medium" selected>🟡 Medium</option>
                <option value="high">🔴 High</option>
                <option value="urgent">🚨 Urgent</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Detailed Description <span class="required">*</span></label>
            <textarea class="form-input" id="cp-desc" placeholder="Describe the issue in detail..." rows="4"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('complaint-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitComplaint()"><i class="fa-solid fa-paper-plane"></i> Submit Complaint</button>
        </div>
      </div>
    </div>`;
}

function getComplaintDetailModal() {
  return `<div class="modal-overlay" id="complaint-detail-modal"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title" id="cdm-title">Complaint Details</span><div class="modal-close" onclick="Modal.close('complaint-detail-modal')"><i class="fa-solid fa-times"></i></div></div><div class="modal-body" id="cdm-body"></div></div></div>`;
}

function openComplaintModal() {
  Modal.open("complaint-modal");
}

async function openComplaintDetail(id) {
  let c = State.data.complaints.find((x) => x.id === id);
  try {
    c = await API.get(`/complaints/${id}`);
    const idx = State.data.complaints.findIndex((x) => x.id === id);
    if (idx >= 0) State.data.complaints[idx] = c;
  } catch {
    if (!c) return;
  }
  el("cdm-title").textContent = c.title;
  el("cdm-body").innerHTML = `
    <div class="flex items-center gap-3 mb-4">
      <div class="cat-icon cat-${c.category}" style="width:44px;height:44px;font-size:20px;border-radius:var(--radius-md)"><i class="fa-solid ${categoryIcon(c.category)}"></i></div>
      <div style="flex:1">
        <div style="font-size:18px;font-weight:700;color:var(--gray-900)">${c.title}</div>
        <div class="flex items-center gap-2 mt-1">${statusBadge(c.status)} ${priorityBadge(c.priority)} <span class="text-xs text-muted">${formatDate(c.createdAt)}</span></div>
      </div>
    </div>
    <div class="info-grid mb-4">
      <div class="info-item"><div class="info-label">Flat No.</div><div class="info-value">${c.flatNo}</div></div>
      <div class="info-item"><div class="info-label">Reported By</div><div class="info-value">${c.residentName}</div></div>
      <div class="info-item"><div class="info-label">Category</div><div class="info-value" style="text-transform:capitalize">${c.category}</div></div>
      <div class="info-item"><div class="info-label">Assigned To</div><div class="info-value">${c.assignedTo || "Not assigned"}</div></div>
    </div>
    <div style="background:var(--gray-50);border-radius:var(--radius-md);padding:14px;margin-bottom:20px">
      <div class="info-label mb-2">Description</div>
      <p style="font-size:14px;color:var(--gray-700);line-height:1.7">${c.description}</p>
    </div>
    ${
      State.user.role === "admin"
        ? `
      <div style="background:var(--primary-50);border:1px solid var(--primary-100);border-radius:var(--radius-md);padding:14px;margin-bottom:20px">
        <div class="info-label mb-2" style="color:var(--primary-700)">Update Status</div>
        <div class="flex gap-2 flex-wrap">
          ${["open", "in_progress", "resolved", "closed"].map((s) => `<button class="btn btn-sm ${c.status === s ? "btn-primary" : "btn-ghost"}" onclick="updateComplaintStatus('${c.id}','${s}')">${s.replace("_", " ")}</button>`).join("")}
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Assign To</label>
          <select class="form-input" id="cd-assign">
            <option value="">Select team member...</option>
            ${(State.data.staff || [])
              .map(
                (s) =>
                  `<option value="${s.id}" ${c.assignedToId === s.id ? "selected" : ""}>${s.name} (${s.role})</option>`,
              )
              .join("")}
          </select>
          <button class="btn btn-primary btn-sm mt-2" onclick="assignComplaint('${c.id}')"><i class="fa-solid fa-user-check"></i> Assign</button>
        </div>
      </div>`
        : ""
    }
    <div class="divider"></div>
    <div class="info-label mb-3">Comments & Updates (${c.comments.length})</div>
    <div class="comment-thread" id="comment-thread-${c.id}">
      ${
        c.comments.length === 0
          ? '<p class="text-muted text-sm">No comments yet.</p>'
          : c.comments
              .map(
                (cm) => `
          <div class="comment-item">
            <div class="comment-avatar">${initials(cm.authorName)}</div>
            <div class="comment-bubble ${cm.role === "admin" ? "admin" : ""}">
              <div class="comment-meta">
                <span class="comment-author">${cm.authorName}</span>
                <span class="comment-role">${cm.role}</span>
                <span class="comment-time">${timeAgo(cm.createdAt)}</span>
              </div>
              <div class="comment-text">${cm.text}</div>
            </div>
          </div>`,
              )
              .join("")
      }
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <input type="text" class="form-input" id="new-comment" placeholder="Add a comment or update..." style="flex:1">
      <button class="btn btn-primary" onclick="addComment('${c.id}')"><i class="fa-solid fa-paper-plane"></i></button>
    </div>`;
  Modal.open("complaint-detail-modal");
}

async function submitComplaint() {
  const title = el("cp-title").value.trim();
  const category = el("cp-category").value;
  const priority = el("cp-priority").value;
  const description = el("cp-desc").value.trim();
  if (!title || !category || !description) {
    Toast.error("Validation", "Please fill all required fields");
    return;
  }
  try {
    const flat = State.data.flats.find((f) =>
      f.residents.includes(State.user.id),
    );
    await API.post("/complaints", {
      title,
      description,
      category,
      priority,
      residentId: State.user.id,
    });
    Toast.success("Submitted", "Your complaint has been registered");
    Modal.close("complaint-modal");
    renderComplaints();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function updateComplaintStatus(id, status) {
  try {
    await API.put(`/complaints/${id}`, { status });
    Toast.success(
      "Updated",
      `Complaint status changed to ${status.replace("_", " ")}`,
    );
    Modal.close("complaint-detail-modal");
    refreshSocietyCache();
    renderComplaints();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function assignComplaint(id) {
  const assignedToId = el("cd-assign")?.value;
  if (!assignedToId) {
    Toast.warning("Assign", "Please select a team member");
    return;
  }
  try {
    await API.put(`/complaints/${id}`, { assignedToId });
    Toast.success("Assigned", "Complaint assigned successfully");
    Modal.close("complaint-detail-modal");
    refreshSocietyCache();
    renderComplaints();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function addComment(id) {
  const text = el("new-comment")?.value.trim();
  if (!text) return;
  try {
    await API.post(`/complaints/${id}/comments`, {
      text,
      authorId: State.user.id,
      authorName: State.user.name,
      role: State.user.role,
    });
    el("new-comment").value = "";
    Toast.success("Comment Added", "");
    Modal.close("complaint-detail-modal");
    renderComplaints();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function deleteComplaint(id) {
  Modal.confirm(
    "Delete Complaint",
    "Are you sure you want to delete this complaint?",
    async () => {
      try {
        await API.delete(`/complaints/${id}`);
        Toast.success("Deleted", "");
        renderComplaints();
      } catch (err) {
        Toast.error("Error", err.message);
      }
    },
  );
}

function filterComplaints() {
  const search = el("comp-search")?.value.toLowerCase() || "";
  const status = el("comp-status-filter")?.value || "";
  const cat = el("comp-cat-filter")?.value || "";
  const filtered = State.data.complaints.filter((c) => {
    const ms =
      !search ||
      c.title.toLowerCase().includes(search) ||
      c.residentName.toLowerCase().includes(search) ||
      c.flatNo.toLowerCase().includes(search);
    const mst = !status || c.status === status;
    const mc = !cat || c.category === cat || c.apiCategory === cat;
    return ms && mst && mc;
  });
  el("complaints-list").innerHTML = renderComplaintCards(filtered);
}

// ============ NOTICES PAGE ============
async function renderNotices() {
  try {
    const notices = await API.get("/notices");
    State.data.notices = notices;
    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Notice Board</h1>
          <p class="page-subtitle">${notices.length} active announcements</p>
        </div>
        ${State.user.role === "admin" ? `<button class="btn btn-primary btn-sm" onclick="openNoticeModal()"><i class="fa-solid fa-plus"></i> Post Notice</button>` : ""}
      </div>

      <div class="filter-bar">
        <div class="tabs">
          <div class="tab active" onclick="filterNoticesByPriority(event, '')">All</div>
          <div class="tab" onclick="filterNoticesByPriority(event, 'urgent')">🔴 Urgent</div>
          <div class="tab" onclick="filterNoticesByPriority(event, 'important')">🟡 Important</div>
          <div class="tab" onclick="filterNoticesByPriority(event, 'normal')">🟢 Normal</div>
        </div>
      </div>

      <div id="notices-list" style="display:flex;flex-direction:column;gap:12px">
        ${renderNoticeCards(notices)}
      </div>

      ${getNoticeModal()}
      ${getNoticeDetailModal()}`;

    setupModalClose("notice-modal");
    setupModalClose("notice-detail-modal");
  } catch (err) {
    showError(err.message || "Failed to load notices");
  }
}

function renderNoticeCards(notices) {
  if (notices.length === 0)
    return emptyState(
      "fa-bullhorn",
      "No notices posted",
      "All announcements from the society committee will appear here.",
    );
  return notices
    .map(
      (n) => `
    <div class="notice-card ${n.priority}" onclick="openNoticeDetail('${n.id}')">
      <div class="notice-card-header">
        <div class="notice-card-title">${n.title}</div>
        <div style="flex-shrink:0">
          <span class="badge badge-${n.priority}">${n.priority}</span>
        </div>
      </div>
      <div class="notice-preview">${n.content.substring(0, 160)}${n.content.length > 160 ? "..." : ""}</div>
      <div class="notice-card-meta">
        <span><i class="fa-solid fa-user"></i> ${n.authorName}</span>
        <span><i class="fa-solid fa-calendar"></i> ${formatDate(n.createdAt)}</span>
        <span><i class="fa-solid fa-check-double"></i> ${n.acknowledgedBy.length} acknowledged</span>
        ${
          State.user.role === "admin"
            ? `
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();deleteNotice('${n.id}')" style="margin-left:auto;color:var(--red-500)"><i class="fa-solid fa-trash"></i></button>`
            : ""
        }
      </div>
    </div>`,
    )
    .join("");
}

function getNoticeModal() {
  return `
    <div class="modal-overlay" id="notice-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <span class="modal-title">Post New Notice</span>
          <div class="modal-close" onclick="Modal.close('notice-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Title <span class="required">*</span></label>
            <input type="text" class="form-input" id="n-title" placeholder="Notice title...">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-input" id="n-category">
                <option value="general">📢 General</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="event">🎉 Event</option>
                <option value="finance">💰 Finance</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select class="form-input" id="n-priority">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Content <span class="required">*</span></label>
            <textarea class="form-input" id="n-content" rows="8" placeholder="Write your notice here..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('notice-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitNotice()"><i class="fa-solid fa-bullhorn"></i> Post Notice</button>
        </div>
      </div>
    </div>`;
}

function getNoticeDetailModal() {
  return `<div class="modal-overlay" id="notice-detail-modal"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title" id="ndm-title"></span><div class="modal-close" onclick="Modal.close('notice-detail-modal')"><i class="fa-solid fa-times"></i></div></div><div class="modal-body" id="ndm-body"></div></div></div>`;
}

function openNoticeModal() {
  Modal.open("notice-modal");
}

function openNoticeDetail(id) {
  const n = State.data.notices.find((x) => x.id === id);
  if (!n) return;
  el("ndm-title").textContent = n.title;
  el("ndm-body").innerHTML = `
    <div class="flex items-center gap-2 mb-4">
      <span class="badge badge-${n.priority}">${n.priority}</span>
      <span class="badge" style="background:var(--primary-50);color:var(--primary-600)">${n.category || "general"}</span>
      <span class="text-muted text-sm" style="margin-left:auto">${formatDate(n.createdAt)}</span>
    </div>
    <div style="background:var(--gray-50);border-radius:var(--radius-md);padding:20px;margin-bottom:16px;white-space:pre-line;line-height:1.8;font-size:14px;color:var(--gray-700)">${n.content}</div>
    <div class="flex items-center gap-3" style="padding:12px 0;border-top:1px solid var(--gray-100)">
      <div class="user-avatar" style="width:32px;height:32px;font-size:12px">${initials(n.createdBy || n.authorName || "Admin")}</div>
      <div><div class="font-semibold text-sm">${n.createdBy || n.authorName || "Admin"}</div><div class="text-xs text-muted">Posted ${timeAgo(n.createdAt)}</div></div>
      <div style="margin-left:auto;text-align:right">
        <div class="text-sm font-semibold">${n.acknowledgedBy.length} residents</div>
        <div class="text-xs text-muted">acknowledged</div>
      </div>
    </div>
    ${
      State.user.role === "resident" &&
      !n.acknowledgedBy.includes(State.user.id)
        ? `
      <button class="btn btn-success w-full mt-3" onclick="acknowledgeNotice('${n.id}')"><i class="fa-solid fa-check"></i> Mark as Read & Acknowledge</button>`
        : State.user.role === "resident"
          ? `<div class="text-center text-sm" style="color:var(--green-600);padding:12px"><i class="fa-solid fa-check-circle"></i> You have acknowledged this notice</div>`
          : ""
    }`;
  Modal.open("notice-detail-modal");
}

async function submitNotice() {
  const title = el("n-title").value.trim();
  const content = el("n-content").value.trim();
  const category = el("n-category").value;
  const priority = el("n-priority").value;
  if (!title || !content) {
    Toast.error("Validation", "Title and content are required");
    return;
  }
  try {
    await API.post("/notices", {
      title,
      content,
      category,
      priority,
      authorId: State.user.id,
      authorName: State.user.name,
    });
    Toast.success("Posted", "Notice published to all residents");
    Modal.close("notice-modal");
    renderNotices();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}


async function acknowledgeNotice(id) {
  try {
    await API.post(`/notices/${id}/acknowledge`, { userId: State.user.id });
    Toast.success("Acknowledged", "Notice marked as read");
    Modal.close("notice-detail-modal");
    renderNotices();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function deleteNotice(id) {
  Modal.confirm(
    "Remove Notice",
    "This notice will be hidden from all residents.",
    async () => {
      try {
        await API.delete(`/notices/${id}`);
        Toast.success("Removed", "Notice removed");
        renderNotices();
      } catch (err) {
        Toast.error("Error", err.message);
      }
    },
  );
}

function filterNoticesByPriority(event, priority) {
  qsa(".tabs .tab").forEach((t) =>
    t.classList.toggle("active", t === event.target),
  );
  const filtered = !priority
    ? State.data.notices
    : State.data.notices.filter((n) => n.priority === priority);
  el("notices-list").innerHTML = renderNoticeCards(filtered);
}

// ============ BILLING PAGE ============
async function renderBilling() {
  try {
    const endpoint =
      State.user.role === "resident"
        ? `/billing?residentId=${State.user.id}`
        : "/billing";
    const [bills, stats] = await Promise.all([
      API.get(endpoint),
      API.get("/billing/stats"),
    ]);
    State.data.bills = bills;
    const billMonths = [
      ...new Set(bills.map((b) => b.month).filter(Boolean)),
    ].sort().reverse();
    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Maintenance Billing</h1>
          <p class="page-subtitle">Track and manage society dues</p>
        </div>
        ${State.user.role === "admin" ? `<button class="btn btn-primary btn-sm" onclick="openGenerateBillsModal()"><i class="fa-solid fa-file-circle-plus"></i> Generate Bills</button>` : ""}
      </div>

      <div class="stats-grid" style="margin-bottom:24px">
        ${statCard("Total Collected", formatCurrency(stats.totalRevenue), "fa-indian-rupee-sign", "green", `${stats.paid} bills paid`, "up")}
        ${statCard("Pending Amount", formatCurrency(stats.pendingRevenue), "fa-clock", "orange", `${stats.unpaid} bills unpaid`, "down")}
        ${statCard("Overdue Bills", stats.overdue, "fa-triangle-exclamation", stats.overdue > 0 ? "red" : "green", "Past due date", stats.overdue > 0 ? "down" : "neutral")}
        ${statCard("Total Bills", stats.totalBills, "fa-file-invoice", "indigo", "All time generated", "neutral")}
      </div>

      <div class="card" style="margin-bottom:16px">
        <div class="card-body" style="padding:16px 20px">
          <div class="filter-bar" style="margin-bottom:0">
            <select class="form-input" style="width:auto" id="bill-status-filter" onchange="filterBills()">
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select class="form-input" style="width:auto" id="bill-month-filter" onchange="filterBills()">
              <option value="">All Months</option>
              ${billMonths
                .map((m) => {
                  const label = new Date(m + "-01").toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  });
                  return `<option value="${m}">${label}</option>`;
                })
                .join("")}
            </select>
          </div>
        </div>
      </div>

      <div id="bills-list" style="display:flex;flex-direction:column;gap:10px">
        ${renderBillCards(bills)}
      </div>

      ${getGenerateBillsModal()}
      ${getPayBillModal()}`;

    setupModalClose("generate-bills-modal");
    setupModalClose("pay-bill-modal");
  } catch (err) {
    showError(err.message || "Failed to load billing");
  }
}

function renderBillCards(bills) {  
  if (bills.length === 0)
    return emptyState(
      "fa-file-invoice",
      "No bills found",
      "Bills will appear here once generated for the month.",
    );
  return bills
    .map(
      (b) => `
    <div class="bill-card ${b.status}">
      <div class="bill-info">
        <div class="bill-flat">Flat ${b.flatNo}</div>
        <div class="bill-month">${b.residentName} · ${new Date(b.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
        <div style="margin-top:8px;font-size:12px;color:var(--gray-500)">
          Maintenance: ${formatCurrency(b.maintenanceAmount)} + Water: ${formatCurrency(b.waterCharges)}
          ${b.parkingCharges > 0 ? ` + Parking: ${formatCurrency(b.parkingCharges)}` : ""}
          ${b.penalty > 0 ? ` + Penalty: ${formatCurrency(b.penalty)}` : ""}
        </div>
      </div>
      <div class="bill-amount">
        ${statusBadge(b.status)}
        <div class="bill-total mt-2">${formatCurrency(b.totalAmount)}</div>
        <div class="bill-due">Due: ${formatDate(b.dueDate)}</div>
        ${b.status === "paid" ? `<div class="text-xs" style="color:var(--green-600)"><i class="fa-solid fa-check-circle"></i> Paid ${formatDate(b.paidDate)} via ${b.paymentMethod}</div>` : ""}
        ${b.status !== "paid" ? `<button class="btn btn-primary btn-sm mt-2" onclick="openPayBillModal('${b.id}')"><i class="fa-solid fa-credit-card"></i> Pay Now</button>` : ""}
      </div>
    </div>`,
    )
    .join("");
}

function getGenerateBillsModal() {
  return `
    <div class="modal-overlay" id="generate-bills-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Generate Monthly Bills</span>
          <div class="modal-close" onclick="Modal.close('generate-bills-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Month <span class="required">*</span></label>
            <input type="month" class="form-input" id="gb-month">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Base Maintenance (₹)</label>
              <input type="number" class="form-input" id="gb-maintenance" value="2500">
            </div>
            <div class="form-group">
              <label class="form-label">Water Charges (₹)</label>
              <input type="number" class="form-input" id="gb-water" value="500">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Parking Charges (₹) <span style="font-weight:400;color:var(--gray-500)">(per vehicle)</span></label>
            <input type="number" class="form-input" id="gb-parking" value="500">
          </div>
          <div style="background:var(--orange-50);border:1px solid var(--orange-200);border-radius:var(--radius-md);padding:12px;font-size:13px;color:var(--orange-700)">
            <i class="fa-solid fa-circle-info" style="margin-right:6px"></i>
            Bills will be generated for all occupied flats. Flats without parking vehicles won't be charged parking fees.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('generate-bills-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="generateBills()"><i class="fa-solid fa-bolt"></i> Generate Bills</button>
        </div>
      </div>
    </div>`;
}

function getPayBillModal() {
  return `
    <div class="modal-overlay" id="pay-bill-modal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <span class="modal-title">Pay Maintenance Bill</span>
          <div class="modal-close" onclick="Modal.close('pay-bill-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <input type="hidden" id="pb-bill-id">
          <div id="pb-bill-info" style="background:var(--gray-50);border-radius:var(--radius-md);padding:16px;margin-bottom:16px"></div>
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select class="form-input" id="pb-method">
              <option value="UPI">UPI (PhonePe/GPay/Paytm)</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash at Office</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Transaction ID <span style="font-weight:400;color:var(--gray-400)">(optional)</span></label>
            <input type="text" class="form-input" id="pb-txn" placeholder="e.g. UPI20240407001">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('pay-bill-modal')">Cancel</button>
          <button class="btn btn-success" onclick="payBill()"><i class="fa-solid fa-check"></i> Confirm Payment</button>
        </div>
      </div>
    </div>`;
}

function openGenerateBillsModal() {
  const now = new Date();
  el("gb-month").value =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  Modal.open("generate-bills-modal");
}

function openPayBillModal(id) {
  const bill = State.data.bills.find((b) => b.id === id);
  if (!bill) return;
  el("pb-bill-id").value = id;
  el("pb-bill-info").innerHTML = `
    <div class="flex justify-between"><span class="text-muted text-sm">Flat</span><span class="font-semibold">${bill.flatNo}</span></div>
    <div class="flex justify-between mt-1"><span class="text-muted text-sm">Month</span><span>${new Date(bill.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span></div>
    <div class="flex justify-between mt-2" style="border-top:1px solid var(--gray-200);padding-top:10px"><span class="font-semibold">Total Amount</span><span style="font-size:20px;font-weight:700;color:var(--primary-600)">${formatCurrency(bill.totalAmount)}</span></div>`;
  Modal.open("pay-bill-modal");
}

async function generateBills() {
  const month = el("gb-month").value;
  const maintenanceAmount = parseInt(el("gb-maintenance").value);
  const waterCharges = parseInt(el("gb-water").value);
  const parkingCharges = parseInt(el("gb-parking").value);
  if (!month) {
    Toast.error("Validation", "Please select a month");
    return;
  }
  try {
    const res = await API.post("/billing/generate", {
      month,
      maintenanceAmount,
      waterCharges,
      parkingCharges,
    });
    Toast.success(
      "Bills Generated",
      `${res.generated} bills created for ${month}`,
    );
    Modal.close("generate-bills-modal");
    renderBilling();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function payBill() {
  const id = el("pb-bill-id").value;
  const paymentMethod = el("pb-method").value;
  const transactionId = el("pb-txn").value;
  try {
    await API.put(`/billing/${id}/pay`, { paymentMethod, transactionId });
    Toast.success("Payment Recorded", "Bill marked as paid successfully");
    Modal.close("pay-bill-modal");
    renderBilling();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

function filterBills() {
  const status = el("bill-status-filter")?.value || "";
  const month = el("bill-month-filter")?.value || "";
  const filtered = State.data.bills.filter((b) => {
    const ms = !status || b.status === status;
    const mm = !month || b.month === month;
    return ms && mm;
  });
  el("bills-list").innerHTML = renderBillCards(filtered);
}

// ============ COMMUNITY MANAGEMENT ============
async function renderCommunity() {
  try {
    const response = await API.get("/community/posts?limit=100");
    const posts = Array.isArray(response) ? response : (response.data || []);
    State.data.community = posts;
    
    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title"><i class="fa-solid fa-users-rays" style="color:var(--purple-500)"></i> Community feed</h1>
          <p class="page-subtitle">${posts.length} posts from residents</p>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-ghost btn-sm" onclick="renderCommunity()"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
          <button class="btn btn-primary btn-sm" onclick="Modal.open('create-community-modal')"><i class="fa-solid fa-plus"></i> Create Post</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Posts</span>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Content</th>
                <th>Media</th>
                <th>Engagement</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="community-list">
              ${renderCommunityCards(posts)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Community Post Modal -->
      <div class="modal-overlay" id="create-community-modal">
        <div class="modal modal-md">
          <div class="modal-header">
            <span class="modal-title">Create Community Post</span>
            <div class="modal-close" onclick="Modal.close('create-community-modal')"><i class="fa-solid fa-times"></i></div>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Post Content <span class="required">*</span></label>
              <textarea class="form-input" id="cp-content" rows="4" placeholder="What would you like to share with the community?"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Image URL (Optional)</label>
              <input type="text" class="form-input" id="cp-image" placeholder="https://example.com/image.jpg">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="Modal.close('create-community-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="createCommunityPost()">Post</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    showError(err.message || "Failed to load community posts");
  }
}

function renderCommunityCards(posts) {
  if (!posts || posts.length === 0) {
    return `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500)">No community posts found.</td></tr>`;
  }
  
  return posts.map(post => {
    const authorName = post.user_name || 'Unknown User';
    const avatar = post.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;
    const unit = post.unit || 'No unit';
    const hasImage = post.image ? '<span style="color:var(--blue-500)"><i class="fa-solid fa-image"></i> Image</span>' : '<span class="text-muted">Text only</span>';
    const date = post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown';
    
    return `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <img src="${avatar}" alt="${authorName}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">
            <div>
              <div class="font-semibold">${authorName}</div>
              <div class="text-xs text-muted">${unit}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${post.content}">
            ${post.content}
          </div>
        </td>
        <td>${hasImage}</td>
        <td>
          <span style="margin-right:12px"><i class="fa-solid fa-heart" style="color:var(--red-400)"></i> ${post.likes_count || 0}</span>
          <span><i class="fa-solid fa-comment" style="color:var(--blue-400)"></i> ${post.comments_count || 0}</span>
        </td>
        <td class="text-muted">${date}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="deleteCommunityPost(${post.id})" style="color:var(--red-500)" title="Delete Post">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function deleteCommunityPost(id) {
  Modal.confirm("Delete Post", "Are you sure you want to delete this community post?", async () => {
    try {
      await API.delete(`/community/posts/${id}`);
      Toast.success("Deleted", "Post has been removed");
      renderCommunity();
    } catch (err) {
      Toast.error("Error", err.message || "Failed to delete post");
    }
  });
}

async function createCommunityPost() {
  const content = el("cp-content").value.trim();
  const image = el("cp-image").value.trim();
  
  if (!content) return Toast.error("Error", "Post content is required");
  
  try {
    const payload = { content };
    if (image) payload.image = image;
    
    await API.post("/community/posts", payload);
    Toast.success("Success", "Post created successfully");
    Modal.close("create-community-modal");
    renderCommunity();
  } catch (err) {
    Toast.error("Error", err.message || "Failed to create post");
  }
}


// ============ EVENT MANAGEMENT ============
async function renderEvents() {
  try {
    const response = await API.get("/events?t=" + Date.now());
    let events = [];
    if (Array.isArray(response)) events = response;
    else if (response.events && Array.isArray(response.events)) events = response.events;
    else if (response.data && Array.isArray(response.data.events)) events = response.data.events;
    else if (response.data && Array.isArray(response.data)) events = response.data;
    
    State.data.events = events;
    
    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title"><i class="fa-solid fa-calendar-star" style="color:var(--orange-500)"></i> Event Management</h1>
          <p class="page-subtitle">${events.length} upcoming and past events</p>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-ghost btn-sm" onclick="renderEvents()"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
          <button class="btn btn-primary btn-sm" onclick="Modal.open('create-event-modal')"><i class="fa-solid fa-plus"></i> Create Event</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Society Events</span>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Location</th>
                <th>Attendees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="events-list">
              ${renderEventCards(events)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Event Modal -->
      <div class="modal-overlay" id="create-event-modal">
        <div class="modal modal-md">
          <div class="modal-header">
            <span class="modal-title">Create Event</span>
            <div class="modal-close" onclick="Modal.close('create-event-modal')"><i class="fa-solid fa-times"></i></div>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Event Title <span class="required">*</span></label>
              <input type="text" class="form-input" id="ev-title" placeholder="e.g. Diwali Celebration">
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <input type="text" class="form-input" id="ev-category" placeholder="e.g. Festival, Meeting, Sports" value="Event">
            </div>
            <div class="form-group">
              <label class="form-label">Organizer</label>
              <input type="text" class="form-input" id="ev-organizer" placeholder="e.g. Cultural Committee">
            </div>
            <div class="form-group">
              <label class="form-label">Price / Fees</label>
              <input type="text" class="form-input" id="ev-price" placeholder="e.g. Free, â‚¹500/person" value="Free">
            </div>
            <div class="form-group">
              <label class="form-label">Tags (comma separated)</label>
              <input type="text" class="form-input" id="ev-tags" placeholder="e.g. Festival, Diya, Celebration">
            </div>
            <div class="form-group">
              <label class="form-label">Description <span class="required">*</span></label>
              <textarea class="form-input" id="ev-description" rows="3" placeholder="Details about the event..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Date & Time <span class="required">*</span></label>
              <input type="datetime-local" class="form-input" id="ev-date">
            </div>
            <div class="form-group">
              <label class="form-label">Location <span class="required">*</span></label>
              <input type="text" class="form-input" id="ev-location" placeholder="e.g. Clubhouse">
            </div>
            <div class="form-group">
              <label class="form-label">Cover Image</label>
              <div style="display:flex; gap:8px;">
                <input type="text" class="form-input" id="ev-image" placeholder="Enter URL or upload image" style="flex:1;">
                <input type="file" id="ev-image-file" style="display:none;" accept="image/*" onchange="handleEventImageUpload(this)">
                <button type="button" class="btn btn-ghost" onclick="document.getElementById('ev-image-file').click()" id="ev-upload-btn">
                  <i class="fa-solid fa-upload"></i> Upload
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="Modal.close('create-event-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="submitSocietyEvent()">Create Event</button>
          </div>
        </div>
      </div>

      <!-- Edit Event Modal -->
      <div class="modal-overlay" id="edit-event-modal">
        <div class="modal modal-md">
          <div class="modal-header">
            <h3 class="modal-title">Edit Event</h3>
            <div class="modal-close" onclick="Modal.close('edit-event-modal')"><i class="fa-solid fa-times"></i></div>
          </div>
          <div class="modal-body">
            <input type="hidden" id="edit-ev-id">
            <div class="form-group">
              <label class="form-label">Event Title <span class="required">*</span></label>
              <input type="text" class="form-input" id="edit-ev-title" placeholder="e.g. Diwali Celebration">
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <input type="text" class="form-input" id="edit-ev-category" placeholder="e.g. Festival, Meeting, Sports">
            </div>
            <div class="form-group">
              <label class="form-label">Organizer</label>
              <input type="text" class="form-input" id="edit-ev-organizer" placeholder="e.g. Cultural Committee">
            </div>
            <div class="form-group">
              <label class="form-label">Price / Fees</label>
              <input type="text" class="form-input" id="edit-ev-price" placeholder="e.g. Free, ₹500/person">
            </div>
            <div class="form-group">
              <label class="form-label">Tags (comma separated)</label>
              <input type="text" class="form-input" id="edit-ev-tags" placeholder="e.g. Festival, Diya, Celebration">
            </div>
            <div class="form-group">
              <label class="form-label">Description <span class="required">*</span></label>
              <textarea class="form-input" id="edit-ev-description" rows="3" placeholder="Details about the event..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Date & Time <span class="required">*</span></label>
              <input type="datetime-local" class="form-input" id="edit-ev-date">
            </div>
            <div class="form-group">
              <label class="form-label">Location <span class="required">*</span></label>
              <input type="text" class="form-input" id="edit-ev-location" placeholder="e.g. Clubhouse">
            </div>
            <div class="form-group">
              <label class="form-label">Cover Image</label>
              <div style="display:flex; gap:8px;">
                <input type="text" class="form-input" id="edit-ev-image" placeholder="Enter URL or upload image" style="flex:1;">
                <input type="file" id="edit-ev-image-file" style="display:none;" accept="image/*" onchange="handleEventImageUploadEdit(this)">
                <button type="button" class="btn btn-ghost" onclick="document.getElementById('edit-ev-image-file').click()" id="edit-ev-upload-btn">
                  <i class="fa-solid fa-upload"></i> Upload
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="Modal.close('edit-event-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="updateSocietyEvent()">Update Event</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    showError(err.message || "Failed to load events");
  }
}

function renderEventCards(events) {
  if (!events || events.length === 0) {
    return `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500)">No events found.</td></tr>`;
  }
  
  return events.map(ev => {
    const date = ev.event_date ? new Date(ev.event_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown';
    const attendees = Array.isArray(ev.attendees) ? ev.attendees.length : (ev.attendees || ev.attendees_count || 0);
    
    return `
      <tr>
        <td class="font-semibold">${ev.title}</td>
        <td>
          <div style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${ev.description}">
            ${ev.description || ''}
          </div>
        </td>
        <td><span class="badge badge-info"><i class="fa-regular fa-clock"></i> ${date}</span></td>
        <td><i class="fa-solid fa-location-dot text-muted"></i> ${ev.location}</td>
        <td><i class="fa-solid fa-users text-muted"></i> ${attendees} going</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="openEditEventModal(${ev.id})" style="color:var(--blue-500)" title="Edit Event">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="deleteEvent(${ev.id})" style="color:var(--red-500)" title="Delete Event">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function deleteEvent(id) {
  Modal.confirm("Delete Event", "Are you sure you want to cancel and delete this event?", async () => {
    try {
      await API.delete(`/events/${id}`);
      Toast.success("Deleted", "Event has been deleted");
      renderEvents();
    } catch (err) {
      Toast.error("Error", err.message || "Failed to delete event");
    }
  });
}


async function handleEventImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  
  const btn = document.getElementById("ev-upload-btn");
  const urlInput = document.getElementById("ev-image");
  const originalHtml = btn.innerHTML;
  
  try {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "events");
    
    const headers = {};
    if (State.token) {
      headers["Authorization"] = `Bearer ${State.token}`;
    }
    
    // We use raw fetch here because API.request hardcodes Content-Type: application/json
    const response = await fetch(`${API.base}/upload/file`, {
      method: "POST",
      headers: headers,
      body: formData
    });
    
    const result = await response.json();
    if (result.status && result.data && result.data.url) {
      urlInput.value = result.data.url;
      Toast.success("Success", "Image uploaded to AWS S3 successfully");
    } else {
      throw new Error(result.message || "Upload failed");
    }
  } catch (err) {
    Toast.error("Error", err.message || "Failed to upload image");
    console.error("Upload error:", err);
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    input.value = ""; // Reset input so same file can be selected again
  }
}

async function submitSocietyEvent() {
  const title = el("ev-title").value.trim();
  const description = el("ev-description").value.trim();
  const date = el("ev-date").value;
  const location = el("ev-location").value.trim();
  const image = el("ev-image").value.trim();
  
  const category = el("ev-category").value.trim();
  const organizer = el("ev-organizer").value.trim();
  const price = el("ev-price").value.trim();
  const tags = el("ev-tags").value.trim();
  
  if (!title || !description || !date || !location) {
    return Toast.error("Error", "All fields are required");
  }
  
  try {
    const dateParts = date.split('T');
    const payload = {
      title,
      description,
      event_date: dateParts[0],
      event_time: dateParts[1] ? dateParts[1] + ':00' : null,
      location,
      category: category || 'Event',
      organizer: organizer || null,
      price: price || 'Free',
      tags: tags || null
    };
    
    if (image) payload.cover_image = image;
    
    await API.post("/events", payload);
    Toast.success("Success", "Event created successfully");
    Modal.close("create-event-modal");
    renderEvents();
  } catch (err) {
    Toast.error("Error", err.message || "Failed to create event");
  }
}

function openEditEventModal(id) {
  const event = State.data.events.find(e => e.id === id);
  if (!event) return;
  
  el("edit-ev-id").value = event.id;
  el("edit-ev-title").value = event.title || '';
  el("edit-ev-category").value = event.category || '';
  
  if (event.event_date) {
    // format to YYYY-MM-DDTHH:mm
    let dt = event.event_date;
    if (event.event_time) {
      dt += 'T' + event.event_time;
    } else {
      dt += 'T00:00';
    }
    el("edit-ev-date").value = dt.substring(0, 16);
  } else {
    el("edit-ev-date").value = '';
  }
  
  el("edit-ev-location").value = event.location || '';
  el("edit-ev-organizer").value = event.organizer || '';
  el("edit-ev-price").value = event.price || '';
  el("edit-ev-tags").value = event.tags || '';
  el("edit-ev-image").value = event.cover_image || '';
  el("edit-ev-description").value = event.description || '';
  
  Modal.open("edit-event-modal");
}

async function updateSocietyEvent() {
  const id = el("edit-ev-id").value;
  const title = el("edit-ev-title").value.trim();
  const description = el("edit-ev-description").value.trim();
  const date = el("edit-ev-date").value;
  const location = el("edit-ev-location").value.trim();
  const image = el("edit-ev-image").value.trim();
  
  const category = el("edit-ev-category").value.trim();
  const organizer = el("edit-ev-organizer").value.trim();
  const price = el("edit-ev-price").value.trim();
  const tags = el("edit-ev-tags").value.trim();
  
  if (!title || !description || !date) {
    Toast.error("Validation Error", "Title, description and date are required");
    return;
  }
  
  try {
    const dateParts = date.split('T');
    const payload = {
      title,
      description,
      event_date: dateParts[0],
      event_time: dateParts[1] ? dateParts[1] + ':00' : null,
      location,
      category: category || 'Event',
      organizer: organizer || null,
      price: price || 'Free',
      tags: tags || null
    };
    
    if (image) payload.cover_image = image;
    
    await API.put(`/events/${id}`, payload);
    Toast.success("Success", "Event updated successfully");
    Modal.close("edit-event-modal");
    renderEvents();
  } catch (err) {
    Toast.error("Error", err.message || "Failed to update event");
  }
}

async function handleEventImageUploadEdit(input) {
  const file = input.files[0];
  if (!file) return;
  
  const btn = document.getElementById("edit-ev-upload-btn");
  const urlInput = document.getElementById("edit-ev-image");
  const originalHtml = btn.innerHTML;
  
  try {
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "events");
    
    const token = State.token || localStorage.getItem('token');
    const response = await fetch(`${API.base}/upload/file`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: fd
    });
    
    const result = await response.json();
    if (result.status && result.data?.url) {
      urlInput.value = result.data.url;
      Toast.success("Success", "Image uploaded");
    } else {
      throw new Error(result.message || "Upload failed");
    }
  } catch (err) {
    Toast.error("Error", err.message || "Failed to upload image");
  } finally {
    btn.innerHTML = originalHtml;
    input.value = "";
  }
}

// ============ SECURITY PANEL ============
async function renderSecurity() {
  try {
    const [visitors, flats, alerts, contacts] = await Promise.all([
      API.get("/visitors/today"),
      API.get("/residents/flats/all"),
      API.get("/security/alerts").catch(() => []),
      API.get("/security/emergency-contacts").catch(() => []),
    ]);
    State.data.visitors = visitors;
    State.data.flats = flats;

    const pending = visitors.filter((v) => v.status === "pending");
    const approved = visitors.filter(
      (v) => v.status === "approved" || v.status === "entered" || v.status === "exited",
    );
    const openAlerts = alerts.filter((a) => a.status === "open" || a.status === "in_progress");

    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title"><i class="fa-solid fa-shield-halved" style="color:var(--primary-500)"></i> Security Panel</h1>
          <p class="page-subtitle">Gate management · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <div class="flex gap-2">
          <div style="background:var(--orange-100);color:var(--orange-700);padding:8px 16px;border-radius:var(--radius-md);font-size:14px;font-weight:600">
            <i class="fa-solid fa-clock"></i> ${pending.length} Pending
          </div>
          <div style="background:var(--green-100);color:var(--green-700);padding:8px 16px;border-radius:var(--radius-md);font-size:14px;font-weight:600">
            <i class="fa-solid fa-users"></i> ${visitors.length} Today
          </div>
          ${openAlerts.length > 0 ? `<div style="background:var(--red-100);color:var(--red-700);padding:8px 16px;border-radius:var(--radius-md);font-size:14px;font-weight:600">
            <i class="fa-solid fa-triangle-exclamation"></i> ${openAlerts.length} Alert${openAlerts.length !== 1 ? "s" : ""}
          </div>` : ""}
        </div>
      </div>

      <!-- Tabs for Security Panel -->
      <div class="tabs" style="margin-bottom:20px" id="security-tabs">
        <div class="tab active" id="sec-tab-gate" onclick="switchSecurityTab('gate')">Gate Management</div>
        <div class="tab" id="sec-tab-alerts" onclick="switchSecurityTab('alerts')">
          Security Alerts ${openAlerts.length > 0 ? `<span style="background:var(--red-500);color:white;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;margin-left:4px">${openAlerts.length}</span>` : ""}
        </div>
        <div class="tab" id="sec-tab-contacts" onclick="switchSecurityTab('contacts')">Emergency Contacts</div>
      </div>

      <!-- TAB: Gate Management -->
      <div id="sec-content-gate" class="page-transition">
        <div class="guard-panel">
          <div class="guard-panel-left">
            <div class="card">
              <div class="card-header"><span class="card-title"><i class="fa-solid fa-user-plus" style="color:var(--primary-500)"></i> Log Visitor</span></div>
              <div class="card-body">
                <div class="form-group">
                  <label class="form-label">Visitor Name <span class="required">*</span></label>
                  <input type="text" class="form-input" id="sg-name" placeholder="Full name">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone <span class="required">*</span></label>
                  <input type="tel" class="form-input" id="sg-phone" placeholder="10-digit mobile">
                </div>
                <div class="form-group">
                  <label class="form-label">Visiting Flat <span class="required">*</span></label>
                  <select class="form-input" id="sg-flat">
                    <option value="">Select flat...</option>
                    ${flats
                      .filter((f) => f.status === "occupied")
                      .map((f) => `<option value="${f.id}">${f.flatNo} — ${f.owner ? f.owner.name : "Resident"}</option>`)
                      .join("")}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Purpose <span class="required">*</span></label>
                  <select class="form-input" id="sg-purpose">
                    <option value="">Select purpose</option>
                    <option>Personal Visit</option><option>Delivery</option><option>Courier</option>
                    <option>Maid</option><option>Plumber</option><option>Electrician</option>
                    <option>Cook</option><option>Driver</option><option>Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Vehicle No. <span style="color:var(--gray-400);font-weight:400">(if any)</span></label>
                  <input type="text" class="form-input" id="sg-vehicle" placeholder="MH12AB1234">
                </div>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-warning flex-1" onclick="logVisitorSecurity(false)"><i class="fa-solid fa-bell"></i> Request Approval</button>
                  <button class="btn btn-success flex-1" onclick="logVisitorSecurity(true)"><i class="fa-solid fa-door-open"></i> Direct Entry</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            ${
              pending.length > 0
                ? `
              <div class="card" style="margin-bottom:16px;border:2px solid var(--orange-300)">
                <div class="card-header" style="background:var(--orange-50)">
                  <span class="card-title" style="color:var(--orange-700)"><i class="fa-solid fa-clock-rotate-left"></i> Awaiting Approval (${pending.length})</span>
                </div>
                <div class="card-body" style="padding:12px;display:flex;flex-direction:column;gap:10px">
                  ${pending.map((v) => renderSecurityVisitorCard(v, true)).join("")}
                </div>
              </div>`
                : ""
            }

            <div class="card">
              <div class="card-header">
                <span class="card-title"><i class="fa-solid fa-list-check" style="color:var(--primary-500)"></i> Today's Log</span>
                <button class="btn btn-ghost btn-sm" onclick="renderSecurity()"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
              </div>
              <div class="card-body" style="padding:12px">
                <div class="visitor-live-list">
                  ${
                    approved.length === 0
                      ? '<div class="empty-state" style="padding:30px"><div class="empty-state-icon" style="font-size:36px">👮</div><p class="text-muted text-sm">No visitors logged today</p></div>'
                      : approved.map((v) => renderSecurityVisitorCard(v, false)).join("")
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Security Alerts -->
      <div id="sec-content-alerts" class="hidden page-transition">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div></div>
          ${State.user.role === "admin" || State.user.role === "guard" ? `<button class="btn btn-danger btn-sm" onclick="openReportAlertModal()"><i class="fa-solid fa-triangle-exclamation"></i> Report Alert</button>` : ""}
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-triangle-exclamation" style="color:var(--red-500)"></i> Security Alerts</span>
            <span class="text-muted text-sm">${alerts.length} total</span>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Type</th><th>Description</th><th>Severity</th><th>Status</th><th>Reported By</th><th>Time</th><th>Actions</th></tr></thead>
              <tbody id="alerts-tbody">
                ${renderAlertRows(alerts)}
              </tbody>
            </table>
          </div>
          ${alerts.length === 0 ? emptyState("fa-shield-check", "No security alerts", "All clear! No alerts have been reported.") : ""}
        </div>

        <!-- Report Alert Modal -->
        <div class="modal-overlay" id="report-alert-modal">
          <div class="modal modal-sm">
            <div class="modal-header">
              <span class="modal-title">Report Security Alert</span>
              <div class="modal-close" onclick="Modal.close('report-alert-modal')"><i class="fa-solid fa-times"></i></div>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Alert Type <span class="required">*</span></label>
                <select class="form-input" id="ra-type">
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="unauthorized_access">Unauthorized Access</option>
                  <option value="emergency">Emergency</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Severity</label>
                <select class="form-input" id="ra-severity">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Location <span style="color:var(--gray-400);font-weight:400">(optional)</span></label>
                <input type="text" class="form-input" id="ra-location" placeholder="e.g. Gate 2, Parking Lot B">
              </div>
              <div class="form-group">
                <label class="form-label">Description <span class="required">*</span></label>
                <textarea class="form-input" id="ra-description" rows="4" placeholder="Describe the security incident..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" onclick="Modal.close('report-alert-modal')">Cancel</button>
              <button class="btn btn-danger" onclick="submitSecurityAlert()"><i class="fa-solid fa-triangle-exclamation"></i> Report Alert</button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Emergency Contacts -->
      <div id="sec-content-contacts" class="hidden page-transition">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div></div>
          ${State.user.role === "admin" ? `<button class="btn btn-primary btn-sm" onclick="openAddContactModal()"><i class="fa-solid fa-plus"></i> Add Contact</button>` : ""}
        </div>
        <div class="grid-3" id="emergency-contacts-grid">
          ${renderEmergencyContactCards(contacts)}
        </div>
        ${contacts.length === 0 ? emptyState("fa-phone-volume", "No emergency contacts", "Add emergency contacts like police, fire, hospital for quick access.") : ""}

        <!-- Add Emergency Contact Modal -->
        <div class="modal-overlay" id="add-contact-modal">
          <div class="modal modal-sm">
            <div class="modal-header">
              <span class="modal-title">Add Emergency Contact</span>
              <div class="modal-close" onclick="Modal.close('add-contact-modal')"><i class="fa-solid fa-times"></i></div>
            </div>
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Contact Name <span class="required">*</span></label>
                  <input type="text" class="form-input" id="ec-name" placeholder="e.g. Police Station">
                </div>
                <div class="form-group">
                  <label class="form-label">Type <span class="required">*</span></label>
                  <select class="form-input" id="ec-type">
                    <option value="police">🚔 Police</option>
                    <option value="fire">🚒 Fire</option>
                    <option value="ambulance">🚑 Ambulance</option>
                    <option value="hospital">🏥 Hospital</option>
                    <option value="other">📞 Other</option>
                  </select>
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Phone <span class="required">*</span></label>
                  <input type="tel" class="form-input" id="ec-phone" placeholder="10-digit number">
                </div>
                <div class="form-group">
                  <label class="form-label">Email <span style="color:var(--gray-400);font-weight:400">(optional)</span></label>
                  <input type="email" class="form-input" id="ec-email" placeholder="contact@example.com">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" onclick="Modal.close('add-contact-modal')">Cancel</button>
              <button class="btn btn-primary" onclick="submitEmergencyContact()"><i class="fa-solid fa-check"></i> Save Contact</button>
            </div>
          </div>
        </div>
      </div>`;

    setupModalClose("report-alert-modal");
    setupModalClose("add-contact-modal");
    window._secAlerts = alerts;
    window._secContacts = contacts;
  } catch (err) {
    showError(err.message || "Failed to load security panel");
  }
}

function renderSecurityVisitorCard(v, isPending) {
  return `
    <div class="visitor-quick-card ${isPending ? "pending" : ""}">
      <div class="visitor-card-header">
        <div>
          <div class="visitor-name">${v.name}</div>
          <div class="visitor-phone">${v.phone}</div>
        </div>
        ${statusBadge(v.status)}
      </div>
      <div class="visitor-meta">
        <div class="visitor-meta-item"><i class="fa-solid fa-building"></i> Flat ${v.flatNo} — ${v.residentName}</div>
        <div class="visitor-meta-item"><i class="fa-solid fa-tag"></i> ${v.purpose}</div>
        ${v.entryTime ? `<div class="visitor-meta-item"><i class="fa-solid fa-clock"></i> In: ${formatTime(v.entryTime)}</div>` : ""}
        ${v.exitTime ? `<div class="visitor-meta-item"><i class="fa-solid fa-door-open"></i> Out: ${formatTime(v.exitTime)}</div>` : ""}
      </div>
      ${
        isPending
          ? `
        <div class="visitor-actions">
          <button class="btn btn-success flex-1" onclick="approveVisitorSec('${v.id}')"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-danger flex-1" onclick="rejectVisitorSec('${v.id}')"><i class="fa-solid fa-times"></i> Reject</button>
        </div>`
          : v.status === "approved" || v.status === "entered"
            ? `
        <div class="visitor-actions">
          <button class="btn btn-ghost flex-1" onclick="exitVisitorSec('${v.id}')"><i class="fa-solid fa-door-open"></i> Log Exit</button>
        </div>`
            : ""
      }
    </div>`;
  }

async function logVisitorSecurity(isDirect) {
  const name = el("sg-name").value.trim();
  const phone = el("sg-phone").value.trim();
  const flatId = el("sg-flat").value;
  const purpose = el("sg-purpose").value;
  const vehicleNo = el("sg-vehicle").value.trim();
  if (!name || !phone || !flatId || !purpose) {
    Toast.error("Validation", "Please fill all required fields");
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    Toast.error("Invalid Phone", "Enter a valid 10-digit phone number");
    return;
  }
  try {
    await API.post("/visitors", {
      name,
      phone,
      purpose,
      flatId,
      vehicleNo,
      isPreApproved: isDirect,
      guardId: State.user.id,
    });
    Toast.success(
      isDirect ? "Entry Logged" : "Approval Requested",
      isDirect ? `${name} has entered` : `Waiting for resident approval`,
    );
    el("sg-name").value = "";
    el("sg-phone").value = "";
    el("sg-flat").value = "";
    el("sg-purpose").value = "";
    el("sg-vehicle").value = "";
    renderSecurity();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function approveVisitorSec(id) {
  await approveVisitor(id);
  renderSecurity();
}
async function rejectVisitorSec(id) {
  await rejectVisitor(id);
  renderSecurity();
}
async function exitVisitorSec(id) {
  try {
    await API.put(`/visitors/${id}/exit`, {});
    Toast.info("Exit Logged", "Visitor exit recorded");
    renderSecurity();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

function switchSecurityTab(tab) {
  document.querySelectorAll("#security-tabs .tab").forEach(t => t.classList.remove("active"));
  document.getElementById("sec-tab-" + tab).classList.add("active");
  document.getElementById("sec-content-gate").classList.add("hidden");
  document.getElementById("sec-content-alerts").classList.add("hidden");
  document.getElementById("sec-content-contacts").classList.add("hidden");
  document.getElementById("sec-content-" + tab).classList.remove("hidden");
}

function renderAlertRows(alerts) {
  return alerts.map(a => `
    <tr>
      <td><span class="badge" style="background:var(--red-50);color:var(--red-700)">${a.alertType.replace("_", " ")}</span></td>
      <td style="max-width:250px" class="truncate">${a.description}</td>
      <td><span class="badge badge-${a.severity}">${a.severity}</span></td>
      <td><span class="badge badge-${a.status === 'open' ? 'pending' : (a.status === 'resolved' ? 'approved' : a.status)}">${a.status.replace("_", " ")}</span></td>
      <td>${a.reportedBy}</td>
      <td>${formatDateTime(a.createdAt)}</td>
      <td>
        ${a.status !== 'resolved' && a.status !== 'closed' && (State.user.role === 'admin' || State.user.role === 'guard') ? `
        <select class="form-input" style="padding:2px 8px;font-size:12px;height:auto;width:auto" onchange="updateAlertStatus('${a.id}', this.value)">
          <option value="" disabled selected>Update...</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>` : a.resolvedBy ? `<span class="text-xs text-muted">by ${a.resolvedBy}</span>` : ""}
      </td>
    </tr>
  `).join("");
}

function openReportAlertModal() {
  Modal.open('report-alert-modal');
}

async function submitSecurityAlert() {
  const alertType = el("ra-type").value;
  const severity = el("ra-severity").value;
  const location = el("ra-location").value.trim();
  const description = el("ra-description").value.trim();
  
  if (!description) {
    Toast.error("Validation", "Description is required");
    return;
  }
  
  try {
    await API.post("/security/alerts", { alertType, severity, location, description });
    Toast.success("Alert Reported", "Security team has been notified");
    Modal.close('report-alert-modal');
    renderSecurity();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function updateAlertStatus(id, status) {
  try {
    await API.put(`/security/alerts/${id}/status`, { status });
    Toast.success("Status Updated", `Alert marked as ${status.replace("_", " ")}`);
    renderSecurity();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

function renderEmergencyContactCards(contacts) {
  return contacts.map(c => `
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:12px">
      <div style="width:48px;height:48px;border-radius:50%;background:var(--blue-50);color:var(--blue-600);display:flex;align-items:center;justify-content:center;font-size:20px">
        <i class="fa-solid fa-${c.contactType === 'police' ? 'shield-halved' : c.contactType === 'fire' ? 'fire-extinguisher' : c.contactType === 'ambulance' ? 'truck-medical' : c.contactType === 'hospital' ? 'hospital' : 'phone'}"></i>
      </div>
      <div style="flex:1">
        <div style="font-weight:600;color:var(--gray-800)">${c.name}</div>
        <div style="font-size:12px;color:var(--gray-500);text-transform:capitalize">${c.contactType}</div>
      </div>
      <a href="tel:${c.phone}" class="btn btn-primary" style="padding:8px 12px;border-radius:50%"><i class="fa-solid fa-phone"></i></a>
    </div>
  `).join("");
}

function openAddContactModal() {
  Modal.open('add-contact-modal');
}

async function submitEmergencyContact() {
  const name = el("ec-name").value.trim();
  const contactType = el("ec-type").value;
  const phone = el("ec-phone").value.trim();
  const email = el("ec-email").value.trim();
  
  if (!name || !phone) {
    Toast.error("Validation", "Name and phone are required");
    return;
  }
  
  try {
    await API.post("/security/emergency-contacts", { name, contactType, phone, email });
    Toast.success("Contact Added", "Emergency contact saved");
    Modal.close('add-contact-modal');
    renderSecurity();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

// ============ AMENITIES ============
async function renderAmenities() {
  try {
    const [amenities, bookings] = await Promise.all([
      API.get("/amenities").catch(() => []),
      API.get("/amenities/bookings").catch(() => []),
    ]);
    State.data.amenities = amenities;
    State.data.amenityBookings = bookings;

    const pc = el("page-content");
    pc.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title"><i class="fa-solid fa-dumbbell" style="color:var(--primary-500)"></i> Amenities Management</h1>
          <p class="page-subtitle">Manage society facilities and bookings</p>
        </div>
        ${State.user.role === "admin" ? `<button class="btn btn-primary btn-sm" onclick="Modal.open('add-amenity-modal')"><i class="fa-solid fa-plus"></i> Add Amenity</button>` : ""}
      </div>

      <div class="tabs" style="margin-bottom:20px" id="amenity-tabs">
        <div class="tab active" id="am-tab-facilities" onclick="switchAmenityTab('facilities')">Facilities</div>
        <div class="tab" id="am-tab-bookings" onclick="switchAmenityTab('bookings')">Bookings</div>
      </div>

      <div id="am-content-facilities" class="page-transition">
        <div class="grid-3">
          ${amenities.length === 0 ? emptyState("fa-swimming-pool", "No amenities added", "Add clubhouses, swimming pools, courts, etc.") : amenities.map(renderAmenityCard).join("")}
        </div>
      </div>

      <div id="am-content-bookings" class="hidden page-transition">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Booking Requests</span>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Resident</th><th>Amenity</th><th>Date & Time</th><th>Status</th><th>Fee</th><th>Actions</th></tr></thead>
              <tbody>
                ${bookings.length === 0 ? `<tr><td colspan="6" class="text-center text-muted" style="padding:24px">No bookings found</td></tr>` : bookings.map(renderBookingRow).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      ${State.user.role === "admin" ? getAddAmenityModal() : ""}
      ${State.user.role === "admin" ? getEditAmenityModal() : ""}
    `;
    setupModalClose("add-amenity-modal");
    setupModalClose("edit-amenity-modal");
  } catch (err) {
    showError(err.message || "Failed to load amenities");
  }
}

function switchAmenityTab(tab) {
  document.querySelectorAll("#amenity-tabs .tab").forEach(t => t.classList.remove("active"));
  document.getElementById("am-tab-" + tab).classList.add("active");
  document.getElementById("am-content-facilities").classList.add("hidden");
  document.getElementById("am-content-bookings").classList.add("hidden");
  document.getElementById("am-content-" + tab).classList.remove("hidden");
}

function renderAmenityCard(a) {
  return `
    <div class="card" style="display:flex;flex-direction:column;height:100%;position:relative">
      ${State.user.role === 'admin' ? `
      <div style="position:absolute;top:12px;right:12px;display:flex;gap:8px;z-index:10">
        <button class="btn btn-sm btn-ghost" style="background:rgba(255,255,255,0.9);box-shadow:0 2px 4px rgba(0,0,0,0.1)" onclick="openEditAmenityModal('${a.id}')"><i class="fa-solid fa-pen text-primary"></i></button>
        <button class="btn btn-sm btn-ghost" style="background:rgba(255,255,255,0.9);box-shadow:0 2px 4px rgba(0,0,0,0.1)" onclick="deleteAmenity('${a.id}')"><i class="fa-solid fa-trash text-danger"></i></button>
      </div>` : ""}
      ${a.imageUrl ? `<div style="height:140px;background:url('${a.imageUrl}') center/cover;border-radius:var(--radius-lg) var(--radius-lg) 0 0"></div>` : `<div style="height:140px;background:var(--gray-100);display:flex;align-items:center;justify-content:center;color:var(--gray-400);font-size:32px;border-radius:var(--radius-lg) var(--radius-lg) 0 0"><i class="fa-solid fa-image"></i></div>`}
      <div style="padding:16px;flex:1;display:flex;flex-direction:column">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <h3 style="margin:0;font-size:16px;font-weight:600;padding-right:${State.user.role==='admin'?'0':'0'}">${a.name}</h3>
          <span class="badge badge-${a.isActive ? 'approved' : 'suspended'}">${a.isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <p style="font-size:13px;color:var(--gray-500);margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${a.description || "No description provided."}</p>
        <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;font-size:13px"><span class="text-muted"><i class="fa-solid fa-users"></i> Capacity</span> <span>${a.capacity} pax</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px"><span class="text-muted"><i class="fa-solid fa-indian-rupee-sign"></i> Booking Fee</span> <span>${a.bookingFee > 0 ? formatCurrency(a.bookingFee) : "Free"}</span></div>
        </div>
      </div>
    </div>`;
}

function renderBookingRow(b) {
  return `
    <tr>
      <td><div class="font-semibold">${b.residentName}</div></td>
      <td>${b.amenityName}</td>
      <td>
        <div class="font-medium">${formatDate(b.bookingDate)}</div>
        <div class="text-xs text-muted">${b.startTime} - ${b.endTime}</div>
      </td>
      <td><span class="badge badge-${b.status === 'confirmed' ? 'approved' : b.status === 'requested' ? 'pending' : b.status === 'cancelled' ? 'suspended' : b.status === 'already_booked' ? 'warning' : 'neutral'}">${b.status.replace("_", " ")}</span></td>
      <td>${b.totalAmount > 0 ? formatCurrency(b.totalAmount) : "Free"}</td>
      <td>
        ${b.status === 'requested' && State.user.role === 'admin' ? `
          <button class="btn btn-sm btn-success" title="Approve" onclick="updateBookingStatus('${b.id}', 'confirmed')"><i class="fa-solid fa-check"></i></button>
          <button class="btn btn-sm" style="background:var(--orange-500);color:white;border-color:var(--orange-600)" title="Already Booked" onclick="updateBookingStatus('${b.id}', 'already_booked')"><i class="fa-solid fa-ban"></i></button>
          <button class="btn btn-sm btn-danger" title="Cancel" onclick="updateBookingStatus('${b.id}', 'cancelled')"><i class="fa-solid fa-xmark"></i></button>
        ` : ""}
      </td>
    </tr>
  `;
}

function getAddAmenityModal() {
  return `
    <div class="modal-overlay" id="add-amenity-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Add New Amenity</span>
          <div class="modal-close" onclick="Modal.close('add-amenity-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Name <span class="required">*</span></label>
            <input type="text" class="form-input" id="am-name" placeholder="e.g. Swimming Pool">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Capacity (persons)</label>
              <input type="number" class="form-input" id="am-cap" value="10" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Booking Fee (₹)</label>
              <input type="number" class="form-input" id="am-fee" value="0" min="0">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Image URL <span style="color:var(--gray-400);font-weight:400">(optional)</span></label>
            <input type="url" class="form-input" id="am-img" placeholder="https://example.com/image.jpg">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input" id="am-desc" rows="3" placeholder="Rules, timings, etc."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('add-amenity-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitAmenity()"><i class="fa-solid fa-plus"></i> Add Amenity</button>
        </div>
      </div>
    </div>`;
}

async function submitAmenity() {
  const name = el("am-name").value.trim();
  const capacity = el("am-cap").value;
  const bookingFee = el("am-fee").value;
  const imageUrl = el("am-img").value.trim();
  const description = el("am-desc").value.trim();

  if (!name) {
    Toast.error("Validation", "Name is required");
    return;
  }

  try {
    await API.post("/amenities", { name, capacity, bookingFee, imageUrl, description });
    Toast.success("Added", "Amenity added successfully");
    Modal.close('add-amenity-modal');
    renderAmenities();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

function getEditAmenityModal() {
  return `
    <div class="modal-overlay" id="edit-amenity-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Edit Amenity</span>
          <div class="modal-close" onclick="Modal.close('edit-amenity-modal')"><i class="fa-solid fa-times"></i></div>
        </div>
        <div class="modal-body">
          <input type="hidden" id="edit-am-id">
          <div class="form-group">
            <label class="form-label">Name <span class="required">*</span></label>
            <input type="text" class="form-input" id="edit-am-name">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Capacity (persons)</label>
              <input type="number" class="form-input" id="edit-am-cap" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Booking Fee (₹)</label>
              <input type="number" class="form-input" id="edit-am-fee" min="0">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Image URL <span style="color:var(--gray-400);font-weight:400">(optional)</span></label>
            <input type="url" class="form-input" id="edit-am-img">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input" id="edit-am-desc" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" id="edit-am-active"> Is Active (Available for booking)
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('edit-amenity-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitEditAmenity()"><i class="fa-solid fa-check"></i> Save Changes</button>
        </div>
      </div>
    </div>`;
}

function openEditAmenityModal(id) {
  const amenity = State.data.amenities.find(a => a.id === id);
  if (!amenity) return;
  
  el("edit-am-id").value = amenity.id;
  el("edit-am-name").value = amenity.name;
  el("edit-am-cap").value = amenity.capacity;
  el("edit-am-fee").value = amenity.bookingFee;
  el("edit-am-img").value = amenity.imageUrl || "";
  el("edit-am-desc").value = amenity.description || "";
  el("edit-am-active").checked = amenity.isActive;
  
  Modal.open('edit-amenity-modal');
}

async function submitEditAmenity() {
  const id = el("edit-am-id").value;
  const name = el("edit-am-name").value.trim();
  const capacity = el("edit-am-cap").value;
  const bookingFee = el("edit-am-fee").value;
  const imageUrl = el("edit-am-img").value.trim();
  const description = el("edit-am-desc").value.trim();
  const isActive = el("edit-am-active").checked;

  if (!name) {
    Toast.error("Validation", "Name is required");
    return;
  }

  try {
    await API.put(`/amenities/${id}`, { name, capacity, bookingFee, imageUrl, description, isActive });
    Toast.success("Updated", "Amenity updated successfully");
    Modal.close('edit-amenity-modal');
    renderAmenities();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function deleteAmenity(id) {
  if (!confirm("Are you sure you want to delete this amenity? This action cannot be undone.")) return;
  
  try {
    await API.delete(`/amenities/${id}`);
    Toast.success("Deleted", "Amenity deleted successfully");
    renderAmenities();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function updateBookingStatus(id, status) {
  try {
    await API.put(`/amenities/bookings/${id}/status`, { status });
    Toast.success("Updated", `Booking ${status}`);
    renderAmenities();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

// ============ HELPERS ============
function emptyState(icon, title, text, btnAction) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="empty-state-title">${title}</div>
      ${text ? `<p class="empty-state-text">${text}</p>` : ""}
      ${btnAction ? `<button class="btn btn-primary" onclick="${btnAction}"><i class="fa-solid fa-plus"></i> Get Started</button>` : ""}
    </div>`;
}

function showError(msg) {
  const pc = el("page-content");
  if (pc)
    pc.innerHTML = `
    <div class="empty-state" style="padding:80px 20px">
      <div class="empty-state-icon" style="color:var(--red-400)"><i class="fa-solid fa-circle-exclamation"></i></div>
      <div class="empty-state-title">Something went wrong</div>
      <p class="empty-state-text">${typeof msg === "string" ? msg : msg?.message || "Please try again"}</p>
      <button class="btn btn-primary" onclick="refreshSocietyCache();navigateTo('${State.currentPage}')"><i class="fa-solid fa-rotate-right"></i> Retry</button>
    </div>`;
  Toast.error("Error", typeof msg === "string" ? msg : msg?.message || "Error");
}

function setupModalClose(id) {
  const overlay = el(id);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) Modal.close(id);
    });
  }
}

// ============ INIT ============
function init() {
  const savedToken = localStorage.getItem("gh_token");
  const savedUser = localStorage.getItem("gh_user");

  if (savedToken && savedUser) {
    State.token = savedToken;
    try {
      State.user = JSON.parse(savedUser);
      if (typeof SocietyBridge !== "undefined") {
        State.user = SocietyBridge.normalizeUser(State.user);
      }

      // Trust the saved session and render immediately
      // (Backend doesn't have /auth/me endpoint, so we skip verification)
      if (
        State.user.role === "super_admin" ||
        State.user.role === "superadmin"
      ) {
        renderSuperAdminApp();
      } else {
        renderApp();
      }

    } catch (e) {
      localStorage.removeItem("gh_token");
      localStorage.removeItem("gh_user");
      State.token = null;
      State.user = null;
      renderLogin();
    }
  } else {
    renderLogin();
  }
}

// ============================================================
// LANDING PAGE
// ============================================================

function renderLanding() {
  // Navigate back to the main website
  window.location.href = "/";
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitSocietyRegistration(e) {
  e.preventDefault();
  const btn = el("reg-submit-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

  const body = {
    societyName: el("reg-society-name").value.trim(),
    address: el("reg-address").value.trim(),
    city: el("reg-city").value.trim(),
    state: el("reg-state").value.trim(),
    towers: el("reg-towers").value,
    totalFlats: el("reg-flats").value,
    contactName: el("reg-contact-name").value.trim(),
    contactEmail: el("reg-email").value.trim(),
    contactPhone: el("reg-phone").value.trim(),
    gst: el("reg-gst").value.trim(),
    pan: el("reg-pan").value.trim(),
    message: el("reg-message").value.trim(),
  };

  if (!/^\d{10}$/.test(body.contactPhone)) {
    Toast.error("Invalid Phone", "Please enter a valid 10-digit mobile number");
    btn.disabled = false;
    btn.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Submit Registration';
    return;
  }

  try {
    const res = await API.post("/public/society-registrations", body);
    // Show success state
    el("register-form-body").innerHTML = `
      <div class="register-success">
        <div class="register-success-icon"><i class="fa-solid fa-circle-check"></i></div>
        <h3>Registration Submitted!</h3>
        <p>Thank you, <strong>${body.contactName}</strong>. Your society registration has been received.</p>
        <p>Our team will verify your details within <strong>24-48 hours</strong> and contact you at <strong>${body.contactEmail}</strong>.</p>
        <div class="register-ref">${res.id}</div>
        <p style="font-size:12px;color:var(--gray-400)">Save this Reference ID for tracking</p>
        <button class="hero-btn-primary" onclick="scrollToSection('hero')" style="margin-top:8px">
          <i class="fa-solid fa-arrow-left"></i> Back to Home
        </button>
      </div>`;
    Toast.success(
      "Registration Submitted!",
      "We will contact you within 24 hours.",
    );
    // Animate the steps
    const steps = document.querySelectorAll(".register-step-item");
    steps.forEach((s, i) => {
      setTimeout(() => s.classList.add("active-step"), i * 180);
    });
  } catch (err) {
    Toast.error("Submission Failed", err.message);
    btn.disabled = false;
    btn.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Submit Registration';
  }
}

// ============================================================
// SUPER ADMIN APP
// ============================================================

function renderSuperAdminApp() {
  document.title = "Super Admin — MyGateBell";
  State.saPage = State.saPage || "sa-dashboard";

  document.body.innerHTML = `
    <div class="superadmin-layout">
      <aside class="sa-sidebar" id="sa-sidebar">
        <div class="sa-sidebar-brand">
          <div class="sa-brand-row">
            <div class="sa-brand-icon"><i class="fa-solid fa-building-shield"></i></div>
            <div class="sa-brand-name">MyGateBell</div>
          </div>
          <div class="sa-role-pill"><i class="fa-solid fa-crown"></i> Super Admin</div>
        </div>
        <nav class="sa-nav">
          <div class="sa-nav-section-label">Overview</div>
          <div class="sa-nav-item ${State.saPage === "sa-dashboard" ? "active" : ""}" onclick="saNavigate('sa-dashboard')">
            <i class="fa-solid fa-chart-pie"></i> Dashboard
          </div>
          <div class="sa-nav-section-label" style="margin-top:8px">Societies</div>
          <div class="sa-nav-item ${State.saPage === "sa-registrations" ? "active" : ""}" onclick="saNavigate('sa-registrations')">
            <i class="fa-solid fa-inbox"></i> Registrations
            <span class="sa-nav-badge" id="sa-badge-regs">—</span>
          </div>
          <div class="sa-nav-item ${State.saPage === "sa-societies" ? "active" : ""}" onclick="saNavigate('sa-societies')">
            <i class="fa-solid fa-building"></i> All Societies
          </div>
          <div class="sa-nav-item ${State.saPage === "sa-add-society" ? "active" : ""}" onclick="saNavigate('sa-add-society')">
            <i class="fa-solid fa-plus-circle"></i> Add Society
          </div>
          <div class="sa-nav-section-label" style="margin-top:8px">Administration</div>
          <div class="sa-nav-item ${State.saPage === "sa-admins" ? "active" : ""}" onclick="saNavigate('sa-admins')">
            <i class="fa-solid fa-users-gear"></i> Society Admins
          </div>
        </nav>
        <div class="sa-sidebar-footer">
          <div class="sa-user-card" onclick="doLogout()">
            <div class="sa-user-avatar">${initials(State.user?.name || "Admin")}</div>
            <div>
              <div class="sa-user-name">${State.user?.name || "Super Admin"}</div>
              <div class="sa-user-role">Super Administrator</div>
            </div>
            <i class="fa-solid fa-arrow-right-from-bracket" style="margin-left:auto;color:var(--gray-600);font-size:13px"></i>
          </div>
        </div>
      </aside>
      <div class="sa-main">
        <div class="sa-topbar">
          <div>
            <div class="sa-topbar-title" id="sa-topbar-title">Dashboard</div>
            <div class="sa-topbar-subtitle">MyGateBell Management Console</div>
          </div>
          <div class="sa-topbar-right">
            <button class="btn btn-sm btn-ghost" onclick="doLogout()">
              <i class="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </div>
        <div class="sa-page" id="sa-page-content">
          <div class="skeleton skeleton-card" style="height:120px"></div>
        </div>
      </div>
    </div>
    <div id="toast-container"></div>
    ${renderSAModals()}`;

  saNavigate(State.saPage);
  saLoadBadges();
}

async function saLoadBadges() {
  try {
    const stats = await API.get("/superadmin/stats");
    const badge = el("sa-badge-regs");
    if (badge && stats) {
      const count = (stats.newLeads || 0) + (stats.underReview || 0);
      badge.textContent = count > 0 ? count : "0";
    }
  } catch (e) {
    console.warn("Failed to load SA badges:", e);
  }
}

function saNavigate(page) {
  State.saPage = page;
  const titles = {
    "sa-dashboard": "Dashboard",
    "sa-registrations": "Society Registrations",
    "sa-societies": "All Societies",
    "sa-add-society": "Add New Society",
    "sa-admins": "Society Admins",
  };
  document
    .querySelectorAll(".sa-nav-item")
    .forEach((n) =>
      n.classList.toggle(
        "active",
        n.textContent.trim().startsWith(titles[page]?.substring(0, 6) || "___"),
      ),
    );
  // Re-render sidebar active state
  document.querySelectorAll(".sa-nav-item").forEach((n) => {
    const onclick = n.getAttribute("onclick");
    if (onclick) n.classList.toggle("active", onclick.includes(page));
  });
  if (el("sa-topbar-title"))
    el("sa-topbar-title").textContent = titles[page] || page;
  const pc = el("sa-page-content");
  if (pc)
    pc.innerHTML =
      '<div class="skeleton skeleton-card" style="height:120px;margin-bottom:16px"></div><div class="skeleton skeleton-card" style="height:200px"></div>';

  setTimeout(async () => {
    switch (page) {
      case "sa-dashboard":
        await renderSADashboard();
        break;
      case "sa-registrations":
        await renderSARegistrations();
        break;
      case "sa-societies":
        await renderSASocieties();
        break;
      case "sa-add-society":
        renderSAAddSociety();
        break;
      case "sa-admins":
        await renderSAAdmins();
        break;
    }
  }, 180);
}

async function renderSADashboard() {
  const pc = el("sa-page-content");
  if (!pc) {
    console.error("Page content element not found");
    return;
  }

  try {

    // Show loading state
    pc.innerHTML =
      '<div class="skeleton skeleton-card" style="height:200px"></div>';

    const stats = await API.get("/superadmin/stats");
    if (!stats) throw new Error("No statistics data received");

    pc.innerHTML = `
      <div class="sa-stats-grid">
        <div class="sa-stat-card">
          <div class="sa-stat-icon feature-icon-blue"><i class="fa-solid fa-building"></i></div>
          <div>
            <div class="sa-stat-value">${stats.totalSocieties || 0}</div>
            <div class="sa-stat-label">Total Societies</div>
            <div class="sa-stat-sub">${stats.approved || 0} approved · ${stats.pending || 0} pending</div>
          </div>
        </div>
        <div class="sa-stat-card">
          <div class="sa-stat-icon feature-icon-orange"><i class="fa-solid fa-inbox"></i></div>
          <div>
            <div class="sa-stat-value">${(stats.newLeads || 0) + (stats.underReview || 0)}</div>
            <div class="sa-stat-label">Pending Leads</div>
            <div class="sa-stat-sub">${stats.newLeads || 0} new · ${stats.underReview || 0} under review</div>
          </div>
        </div>
        <div class="sa-stat-card">
          <div class="sa-stat-icon feature-icon-green"><i class="fa-solid fa-users-gear"></i></div>
          <div>
            <div class="sa-stat-value">${stats.totalAdmins || 0}</div>
            <div class="sa-stat-label">Active Admins</div>
            <div class="sa-stat-sub">Society administrators</div>
          </div>
        </div>
        <div class="sa-stat-card">
          <div class="sa-stat-icon feature-icon-purple"><i class="fa-solid fa-house-user"></i></div>
          <div>
            <div class="sa-stat-value">${stats.totalResidents || 0}</div>
            <div class="sa-stat-label">Total Residents</div>
            <div class="sa-stat-sub">Across all societies</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;margin-bottom:20px">
        <div class="sa-table-card">
          <div class="sa-table-header">
            <div class="sa-table-title"><i class="fa-solid fa-chart-line" style="color:var(--primary-500)"></i> Signup Trend (Last 6 Months)</div>
          </div>
          <div style="padding:20px"><div style="height:180px"><canvas id="sa-trend-chart"></canvas></div></div>
        </div>
        <div class="sa-table-card">
          <div class="sa-table-header">
            <div class="sa-table-title"><i class="fa-solid fa-chart-pie" style="color:var(--orange-500)"></i> Plan Distribution</div>
          </div>
          <div style="padding:20px"><div style="height:180px"><canvas id="sa-plan-chart"></canvas></div></div>
        </div>
      </div>

      <div class="sa-table-card">
        <div class="sa-table-header">
          <div class="sa-table-title"><i class="fa-solid fa-building" style="color:var(--primary-500)"></i> Recent Societies</div>
          <button class="btn btn-sm btn-primary" onclick="saNavigate('sa-societies')">View All</button>
        </div>
        <div style="overflow-x:auto">
          <table class="sa-table">
            <thead><tr>
              <th>Society</th><th>Code</th><th>City</th><th>Plan</th><th>Status</th><th>Created</th>
            </tr></thead>
            <tbody id="sa-dash-societies"></tbody>
          </table>
        </div>
      </div>`;

    // We derive stats client-side from the societies list
    let societies = [];
    try {
      societies = await API.get("/superadmin/societies");
      const tbody = el("sa-dash-societies");
      if (tbody && societies) {
        tbody.innerHTML = societies
          .slice(0, 5)
          .map(
            (s) => `
          <tr>
            <td><div class="society-name">${s.name}</div><div style="font-size:11px;color:var(--gray-400)">${s.contactEmail}</div></td>
            <td><span class="society-code">${s.code}</span></td>
            <td>${s.city}, ${s.state}</td>
            <td><span class="badge badge-${s.plan}">${s.plan}</span></td>
            <td><span class="badge badge-${s.status}">${s.status}</span></td>
            <td>${formatDate(s.createdAt)}</td>
          </tr>`,
          )
          .join("");
      }
    } catch (err) {
      console.warn("Failed to load societies:", err);
      const tbody = el("sa-dash-societies");
      if (tbody)
        tbody.innerHTML =
          '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--gray-400)">Failed to load societies</td></tr>';
    }

    // Charts
    setTimeout(() => {
      try {
        const trendCtx = el("sa-trend-chart");
        if (trendCtx && stats.trend && stats.trend.length > 0) {
          new Chart(trendCtx, {
            type: "bar",
            data: {
              labels: stats.trend.map((t) => t.month),
              datasets: [
                {
                  data: stats.trend.map((t) => t.count),
                  backgroundColor: "rgba(99,102,241,0.7)",
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            },
          });
        }
        const planCtx = el("sa-plan-chart");
        if (planCtx && stats.planDist && stats.planDist.length > 0) {
          new Chart(planCtx, {
            type: "doughnut",
            data: {
              labels: stats.planDist.map(
                (p) => p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
              ),
              datasets: [
                {
                  data: stats.planDist.map((p) => p.count),
                  backgroundColor: ["#d1d5db", "#818cf8", "#fed7aa"],
                  borderWidth: 0,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom", labels: { font: { size: 11 } } },
              },
            },
          });
        }
      } catch (chartErr) {
        console.warn("Chart rendering failed:", chartErr);
      }
    }, 100);
  } catch (err) {
    console.error("Super Admin dashboard error:", err);
    pc.innerHTML = `
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:48px;margin-bottom:16px">⚠️</div>
        <h3 style="margin-bottom:8px;color:var(--red-600)">Failed to Load Dashboard</h3>
        <p style="color:var(--gray-500);margin-bottom:20px">${err.message}</p>
        <button class="btn btn-primary" onclick="renderSADashboard()">
          <i class="fa-solid fa-rotate-right"></i> Retry
        </button>
      </div>`;
  }
}

async function renderSARegistrations() {
  try {
    const regs = await API.get("/superadmin/registrations");
    const pc = el("sa-page-content");

    const statusTabs = ["all", "new", "under_review", "approved", "rejected"];
    let activeTab = State.saRegTab || "all";

    const renderRegTable = (filter) => {
      State.saRegTab = filter;
      const filtered = filter === "all" ? regs : regs.filter((r) => r.status === filter);
      if (filtered.length === 0)
        return `<div class="empty-state" style="padding:48px">${emptyState("fa-inbox", "No registrations", "No society registrations found for this filter.")}</div>`;
      return `<div style="overflow-x:auto"><table class="sa-table">
        <thead><tr><th>Society</th><th>Contact</th><th>City</th><th>Flats</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
        <tbody>${filtered.map((r) => `
          <tr>
            <td>
              <div class="society-name">${r.societyName}</div>
              <div style="font-size:11px;color:var(--gray-400)">${r.message ? r.message.substring(0, 50) + "…" : "—"}</div>
            </td>
            <td>
              <div style="font-weight:600;font-size:13px">${r.contactName}</div>
              <div style="font-size:11px;color:var(--gray-400)">${r.contactEmail}</div>
              <div style="font-size:11px;color:var(--gray-400)">${r.contactPhone}</div>
            </td>
            <td>${r.city}${r.state ? ", " + r.state : ""}</td>
            <td>${r.totalFlats} flats · ${r.towers} tower${r.towers > 1 ? "s" : ""}</td>
            <td><span class="badge badge-${r.status}">${r.status.replace("_", " ")}</span></td>
            <td>${timeAgo(r.createdAt)}</td>
            <td>
              <div class="sa-action-btns">
                <button class="sa-icon-btn" title="View Details" onclick="saViewReg('${r.id}')"><i class="fa-solid fa-eye"></i></button>
                ${r.status === "new" ? `<button class="sa-icon-btn success" title="Mark Under Review" onclick="saUpdateReg('${r.id}','under_review')"><i class="fa-solid fa-magnifying-glass"></i></button>` : ""}
                ${r.status === "under_review" ? `<button class="sa-icon-btn success" title="Review & approve" onclick="saOpenApproveRegistrationModal('${r.id}')"><i class="fa-solid fa-rocket"></i></button>` : ""}
                ${(r.status === "new" || r.status === "under_review") ? `<button class="sa-icon-btn danger" title="Reject" onclick="saUpdateReg('${r.id}','rejected')"><i class="fa-solid fa-ban"></i></button>` : ""}
              </div>
            </td>
          </tr>`).join("")}</tbody>
      </table></div>`;
    };

    pc.innerHTML = `
      <div class="sa-table-card">
        <div class="sa-table-header">
          <div class="sa-table-title"><i class="fa-solid fa-inbox" style="color:var(--primary-500)"></i> Society Registration Leads</div>
          <div style="font-size:13px;color:var(--gray-400)">${regs.length} total registrations</div>
        </div>
        <div style="padding:12px 16px;border-bottom:1px solid var(--gray-100);display:flex;gap:6px;flex-wrap:wrap">
          ${statusTabs.map((t) => `
            <button class="btn btn-sm ${activeTab === t ? "btn-primary" : "btn-ghost"}" id="reg-tab-${t}" onclick="saFilterRegs('${t}')">
              ${t === "all" ? "All" : t.replace("_", " ")} ${t === "all" ? regs.length : regs.filter((r) => r.status === t).length ? `(${regs.filter((r) => r.status === t).length})` : ""}
            </button>`).join("")}
        </div>
        <div id="reg-table-body">${renderRegTable(activeTab)}</div>
      </div>`;

    window._saRegs = regs;
    window._saRenderRegTable = renderRegTable;
  } catch (err) {
    showError("Failed to load registrations");
  }
}

function saFilterRegs(tab) {
  State.saRegTab = tab;
  const filtered =
    tab === "all"
      ? window._saRegs
      : window._saRegs.filter((r) => r.status === tab);
  document
    .querySelectorAll('[id^="reg-tab-"]')
    .forEach((b) => b.classList.remove("btn-primary"));
  document
    .querySelectorAll('[id^="reg-tab-"]')
    .forEach((b) => b.classList.add("btn-ghost"));
  const activeBtn = el("reg-tab-" + tab);
  if (activeBtn) {
    activeBtn.classList.remove("btn-ghost");
    activeBtn.classList.add("btn-primary");
  }
  const tbody = el("reg-table-body");
  if (tbody) tbody.innerHTML = window._saRenderRegTable(tab);
}

async function saUpdateReg(id, status) {
  try {
    await API.put(`/superadmin/registrations/${id}`, { status });
    Toast.success("Updated", `Registration status → ${status.replace("_", " ")}`);
    // Update local array and re-render in place — no full page reload
    if (window._saRegs) {
      const reg = window._saRegs.find((r) => String(r.id) === String(id));
      if (reg) reg.status = status;
    }
    const tbody = el("reg-table-body");
    if (tbody && window._saRenderRegTable)
      tbody.innerHTML = window._saRenderRegTable(State.saRegTab || "all");
    saLoadBadges();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

function saShowRegApproveSuccessModal(res) {
  const already = res.already_approved === true;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay open";
  overlay.id = "reg-success-modal";
  const credBlock = already
    ? `<p style="font-size:14px;color:var(--gray-600);text-align:left">This lead was already approved. Society is linked (code <strong style="font-family:monospace;color:var(--orange-600)">${res.code || "—"}</strong>). No new password was issued — use the admin credentials you already shared.</p>`
    : `<div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:16px;text-align:left">
            <div style="font-size:11px;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:12px">Admin Credentials</div>
            <div style="margin-bottom:8px"><span style="font-size:12px;color:var(--gray-400)">Login Phone:</span> <strong style="color:var(--gray-800)">${res.admin_phone}</strong></div>
            <div><span style="font-size:12px;color:var(--gray-400)">Temporary Password:</span> <strong style="color:var(--primary-600)">${res.password ?? "—"}</strong></div>
            <div style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--gray-200)"><span style="font-size:12px;color:var(--gray-400)">Society Code:</span> <strong style="color:var(--orange-600);font-family:monospace">${res.code}</strong></div>
          </div>`;
  overlay.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <span class="modal-title">${already ? "Already active" : "Society Activated!"}</span>
          <button class="modal-close" onclick="Modal.close('reg-success-modal')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" style="text-align:center">
          <i class="fa-solid fa-circle-check" style="color:var(--green-500);font-size:48px;margin-bottom:16px"></i>
          <h3>${res.society_name}${already ? "" : " is now Live"}</h3>
          <p style="font-size:14px;color:var(--gray-600);margin-bottom:20px">${already ? "No duplicate society was created." : "The society has been created and the admin account is active."}</p>
          ${credBlock}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-block" onclick="Modal.close('reg-success-modal');">Got it</button>
        </div>
      </div>`;
  document.body.appendChild(overlay);
}

function saOpenApproveRegistrationModal(id) {
  const reg = window._saRegs?.find((r) => String(r.id) === String(id));
  if (!reg) return;
  if (reg.status !== "under_review") {
    Toast.warning("Review first", "Mark this lead as Under Review before approving.");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay open";
  overlay.id = "reg-approve-modal";
  overlay.innerHTML = `
    <div class="modal" style="max-width:720px">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-rocket" style="color:var(--green-600)"></i> Approve &amp; activate — edit details</span>
        <button class="modal-close" onclick="Modal.close('reg-approve-modal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body" style="max-height:70vh;overflow-y:auto">
        <p style="font-size:13px;color:var(--gray-600);margin:0 0 16px">Adjust society and admin details below, then approve. Leave password blank to auto-generate one.</p>
        <h4 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--gray-500);margin:0 0 10px">Society</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group" style="grid-column:1/-1"><label class="form-label">Society name *</label><input type="text" class="form-input" id="apv-societyName" required></div>
          <div class="form-group" style="grid-column:1/-1"><label class="form-label">Address</label><input type="text" class="form-input" id="apv-address"></div>
          <div class="form-group"><label class="form-label">City *</label><input type="text" class="form-input" id="apv-city" required></div>
          <div class="form-group"><label class="form-label">State</label><input type="text" class="form-input" id="apv-state"></div>
          <div class="form-group"><label class="form-label">Pincode</label><input type="text" class="form-input" id="apv-pincode"></div>
          <div class="form-group"><label class="form-label">Plan</label>
            <select class="form-input" id="apv-plan">
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Towers</label><input type="number" class="form-input" id="apv-towers" min="1" step="1"></div>
          <div class="form-group"><label class="form-label">Total flats</label><input type="number" class="form-input" id="apv-totalFlats" min="0" step="1"></div>
          <div class="form-group"><label class="form-label">GST</label><input type="text" class="form-input" id="apv-gst"></div>
          <div class="form-group"><label class="form-label">PAN</label><input type="text" class="form-input" id="apv-pan"></div>
        </div>
        <h4 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--gray-500);margin:20px 0 10px">Society administrator</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group" style="grid-column:1/-1"><label class="form-label">Full name *</label><input type="text" class="form-input" id="apv-contactName" required></div>
          <div class="form-group"><label class="form-label">Email *</label><input type="email" class="form-input" id="apv-contactEmail" required></div>
          <div class="form-group"><label class="form-label">Phone *</label><input type="tel" class="form-input" id="apv-contactPhone" required></div>
          <div class="form-group" style="grid-column:1/-1"><label class="form-label">Admin password (optional)</label><input type="text" class="form-input" id="apv-adminPassword" placeholder="Leave blank to auto-generate (min 8 chars if set)" autocomplete="off"></div>
        </div>
        <div id="apv-err" style="display:none;margin-top:12px;padding:10px 12px;background:var(--red-50);border:1px solid var(--red-200);border-radius:var(--radius-md);font-size:13px;color:var(--red-800)"></div>
      </div>
      <div class="modal-footer" style="display:flex;gap:10px;justify-content:flex-end">
        <button type="button" class="btn btn-ghost" onclick="Modal.close('reg-approve-modal')">Cancel</button>
        <button type="button" class="btn btn-success" id="apv-submit-btn"><i class="fa-solid fa-circle-check"></i> Approve &amp; activate</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) Modal.close("reg-approve-modal");
  });

  const v = (hid) => document.getElementById(hid);
  v("apv-societyName").value = reg.societyName || "";
  v("apv-address").value = reg.address || "";
  v("apv-city").value = reg.city || "";
  v("apv-state").value = reg.state || "";
  v("apv-pincode").value = reg.pincode || "";
  v("apv-towers").value = reg.towers != null ? String(reg.towers) : "1";
  v("apv-totalFlats").value = reg.totalFlats != null ? String(reg.totalFlats) : "0";
  v("apv-gst").value = reg.gst || "";
  v("apv-pan").value = reg.pan || "";
  v("apv-contactName").value = reg.contactName || "";
  v("apv-contactEmail").value = reg.contactEmail || "";
  v("apv-contactPhone").value = reg.contactPhone || "";
  v("apv-plan").value = reg.plan && ["starter", "professional", "enterprise"].includes(reg.plan) ? reg.plan : "starter";

  const errEl = v("apv-err");
  const btn = v("apv-submit-btn");
  btn.onclick = async () => {
    errEl.style.display = "none";
    const societyName = v("apv-societyName").value.trim();
    const city = v("apv-city").value.trim();
    const contactName = v("apv-contactName").value.trim();
    const contactEmail = v("apv-contactEmail").value.trim();
    const contactPhone = v("apv-contactPhone").value.trim();
    const adminPassword = v("apv-adminPassword").value.trim();
    if (!societyName || !city || !contactName || !contactEmail || !contactPhone) {
      errEl.textContent = "Please fill all required fields (society name, city, admin name, email, phone).";
      errEl.style.display = "block";
      return;
    }
    if (adminPassword && adminPassword.length < 8) {
      errEl.textContent = "Admin password must be at least 8 characters, or leave blank.";
      errEl.style.display = "block";
      return;
    }
    const body = {
      societyName,
      address: v("apv-address").value.trim(),
      city,
      state: v("apv-state").value.trim(),
      pincode: v("apv-pincode").value.trim(),
      towers: parseInt(v("apv-towers").value, 10) || 1,
      totalFlats: parseInt(v("apv-totalFlats").value, 10) || 0,
      gst: v("apv-gst").value.trim() || null,
      pan: v("apv-pan").value.trim() || null,
      contactName,
      contactEmail,
      contactPhone,
      plan: v("apv-plan").value,
    };
    if (adminPassword) body.adminPassword = adminPassword;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Approving…';
    try {
      const res = await API.post(`/superadmin/registrations/${id}/approve`, body);
      Modal.close("reg-approve-modal");
      if (window._saRegs) {
        const r2 = window._saRegs.find((r) => String(r.id) === String(id));
        if (r2) {
          r2.status = "approved";
          Object.assign(r2, {
            societyName: body.societyName,
            address: body.address,
            city: body.city,
            state: body.state,
            pincode: body.pincode,
            towers: body.towers,
            totalFlats: body.totalFlats,
            gst: body.gst,
            pan: body.pan,
            contactName: body.contactName,
            contactEmail: body.contactEmail,
            contactPhone: body.contactPhone,
          });
        }
      }
      const tbody = el("reg-table-body");
      if (tbody && window._saRenderRegTable)
        tbody.innerHTML = window._saRenderRegTable(State.saRegTab || "all");
      saLoadBadges();
      saShowRegApproveSuccessModal(res);
    } catch (err) {
      errEl.textContent = err.message || "Approval failed";
      errEl.style.display = "block";
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Approve &amp; activate';
    }
  };
}

function saViewReg(id) {
  const reg = window._saRegs?.find((r) => String(r.id) === String(id));
  if (!reg) return;

  const isApproved = reg.status === "approved";
  const isRejected = reg.status === "rejected";
  const canAct     = !isApproved && !isRejected;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay open";
  overlay.id = "reg-view-modal";
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-inbox" style="color:var(--primary-500)"></i> ${reg.societyName}</span>
        <button class="modal-close" onclick="Modal.close('reg-view-modal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        ${isApproved ? `
          <div style="background:var(--green-50);border:1px solid var(--green-200);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:16px;font-size:13px;color:var(--green-800)">
            <i class="fa-solid fa-circle-check"></i> This registration has been <strong>approved</strong>. The society is live in the All Societies page.
          </div>` : ""}
        <div class="society-detail-grid">
          <div class="society-detail-item"><label>Society Name</label><span>${reg.societyName}</span></div>
          <div class="society-detail-item"><label>Status</label><span class="badge badge-${reg.status}">${reg.status.replace("_", " ")}</span></div>
          <div class="society-detail-item"><label>City / State</label><span>${reg.city}${reg.state ? ", " + reg.state : ""}</span></div>
          <div class="society-detail-item"><label>Pincode</label><span>${reg.pincode || "—"}</span></div>
          <div class="society-detail-item"><label>Towers</label><span>${reg.towers}</span></div>
          <div class="society-detail-item"><label>Total Flats</label><span>${reg.totalFlats}</span></div>
          <div class="society-detail-item"><label>Contact Name</label><span>${reg.contactName}</span></div>
          <div class="society-detail-item"><label>Phone</label><span>${reg.contactPhone}</span></div>
          <div class="society-detail-item"><label>Email</label><span>${reg.contactEmail}</span></div>
          <div class="society-detail-item"><label>Submitted</label><span>${formatDateTime(reg.createdAt)}</span></div>
          ${reg.gst ? `<div class="society-detail-item"><label>GST</label><span>${reg.gst}</span></div>` : ""}
          ${reg.pan ? `<div class="society-detail-item"><label>PAN</label><span>${reg.pan}</span></div>` : ""}
        </div>
        ${reg.message ? `<div style="background:var(--gray-50);border-radius:var(--radius-md);padding:12px 16px;font-size:13px;color:var(--gray-600);border:1px solid var(--gray-200);margin-top:12px"><strong>Message:</strong> ${reg.message}</div>` : ""}
      </div>
      <div class="modal-footer">
        ${reg.status === "new" ? `<button class="btn btn-warning" id="rv-review-btn"><i class="fa-solid fa-magnifying-glass"></i> Mark Under Review</button>` : ""}
        ${reg.status === "under_review" ? `<button class="btn btn-success" id="rv-approve-btn"><i class="fa-solid fa-rocket"></i> Edit details &amp; approve</button>` : ""}
        ${canAct ? `<button class="btn btn-primary" id="rv-prefill-btn"><i class="fa-solid fa-pen-to-square"></i> Open in Add Society</button>` : ""}
        ${canAct ? `<button class="btn btn-danger" id="rv-reject-btn"><i class="fa-solid fa-ban"></i> Reject</button>` : ""}
        ${isApproved ? `<button class="btn btn-primary" id="rv-view-society-btn"><i class="fa-solid fa-building"></i> View in All Societies</button>` : ""}
        <button class="btn btn-ghost" onclick="Modal.close('reg-view-modal')">Close</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) Modal.close("reg-view-modal"); });

  const reviewBtn      = document.getElementById("rv-review-btn");
  const approveBtn     = document.getElementById("rv-approve-btn");
  const prefillBtn     = document.getElementById("rv-prefill-btn");
  const rejectBtn      = document.getElementById("rv-reject-btn");
  const viewSocietyBtn = document.getElementById("rv-view-society-btn");

  if (reviewBtn)      reviewBtn.onclick      = async () => { Modal.close("reg-view-modal"); await saUpdateReg(reg.id, "under_review"); };
  if (approveBtn)     approveBtn.onclick     = () => { Modal.close("reg-view-modal"); saOpenApproveRegistrationModal(reg.id); };
  if (prefillBtn)     prefillBtn.onclick     = () => { 
    Modal.close("reg-view-modal"); 
    State.saAddSocietyPrefill = { ...reg, registrationId: reg.id }; 
    saNavigate("sa-add-society"); 
  };
  if (rejectBtn)      rejectBtn.onclick      = async () => { Modal.close("reg-view-modal"); await saUpdateReg(reg.id, "rejected"); };
  if (viewSocietyBtn) viewSocietyBtn.onclick = () => { Modal.close("reg-view-modal"); saNavigate("sa-societies"); };
}

async function renderSASocieties() {
  try {
    const societies = await API.get("/superadmin/societies");
    const pc = el("sa-page-content");
    pc.innerHTML = `
      <div class="sa-table-card">
        <div class="sa-table-header">
          <div class="sa-table-title"><i class="fa-solid fa-building" style="color:var(--primary-500)"></i> All Societies</div>
          <button class="btn btn-sm btn-primary" onclick="saNavigate('sa-add-society')"><i class="fa-solid fa-plus"></i> Add Society</button>
        </div>
        <div style="overflow-x:auto">
          <table class="sa-table">
            <thead><tr>
              <th>Society</th><th>Code</th><th>Location</th><th>Flats</th><th>Plan</th><th>Status</th><th>Admin</th><th>Actions</th>
            </tr></thead>
            <tbody>
              ${societies
                .map(
                  (s) => `
                <tr>
                  <td>
                    <div class="society-name">${s.name}</div>
                    <div style="font-size:11px;color:var(--gray-400)">${s.contactEmail}</div>
                  </td>
                  <td><span class="society-code">${s.code}</span></td>
                  <td>${s.city}${s.state ? ", " + s.state : ""}</td>
                  <td>${s.totalFlats} / ${s.towers} tower${s.towers > 1 ? "s" : ""}</td>
                  <td><span class="badge badge-${s.plan}">${s.plan}</span></td>
                  <td><span class="badge badge-${s.status}">${s.status}</span></td>
                  <td>${s.adminId ? '<span style="color:var(--green-600);font-size:12px"><i class="fa-solid fa-check-circle"></i> Assigned</span>' : '<span style="color:var(--orange-500);font-size:12px"><i class="fa-solid fa-circle-exclamation"></i> None</span>'}</td>
                  <td>
                    <div class="sa-action-btns">
                      <button class="sa-icon-btn" title="View & Manage" onclick="saViewSociety('${s.id}')"><i class="fa-solid fa-eye"></i></button>
                      ${s.status !== "approved" ? `<button class="sa-icon-btn success" title="Approve" onclick="saApproveSociety('${s.id}')"><i class="fa-solid fa-check"></i></button>` : ""}
                      ${s.status === "approved" && s.adminId ? `<button class="sa-icon-btn" title="Edit Admin" onclick="saEditSocietyAdmin('${s.id}')"><i class="fa-solid fa-pen"></i></button>` : ""}
                      ${!s.adminId ? `<button class="sa-icon-btn" title="Create Admin" onclick="saCreateAdmin('${s.id}','${s.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-user-plus"></i></button>` : ""}
                      ${s.status !== "suspended" ? `<button class="sa-icon-btn danger" title="Suspend" onclick="saSuspendSociety('${s.id}')"><i class="fa-solid fa-ban"></i></button>` : ""}
                      <button class="sa-icon-btn danger" title="Delete" onclick="saDeleteSociety('${s.id}','${s.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch (err) {
    showError("Failed to load societies");
  }
}

async function saViewSociety(id) {
  try {
    const s = await API.get(`/superadmin/societies/${id}`);
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "society-view-modal";
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">${s.name}</span>
          <button class="modal-close" id="society-view-close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="society-code-display">
            <label>Society Code</label>
            <div class="code-value">${s.code}</div>
          </div>
          ${s.inviteLink ? `<div class="invite-link-box"><i class="fa-solid fa-link" style="color:var(--primary-500);flex-shrink:0"></i> ${s.inviteLink}</div>` : ""}
          <div class="society-detail-grid" style="margin-top:16px">
            <div class="society-detail-item"><label>Name</label><span>${s.name}</span></div>
            <div class="society-detail-item"><label>Status</label><span class="badge badge-${s.status}">${s.status}</span></div>
            <div class="society-detail-item"><label>City</label><span>${s.city}</span></div>
            <div class="society-detail-item"><label>State</label><span>${s.state || "—"}</span></div>
            <div class="society-detail-item"><label>Towers</label><span>${s.towers}</span></div>
            <div class="society-detail-item"><label>Total Flats</label><span>${s.totalFlats}</span></div>
            <div class="society-detail-item"><label>Plan</label><span class="badge badge-${s.plan}">${s.plan}</span></div>
            <div class="society-detail-item"><label>Residents</label><span>${s.userCount || 0}</span></div>
            <div class="society-detail-item"><label>Contact</label><span>${s.contactName}</span></div>
            <div class="society-detail-item"><label>Phone</label><span>${s.contactPhone || "—"}</span></div>
            <div class="society-detail-item"><label>Email</label><span>${s.contactEmail}</span></div>
            <div class="society-detail-item"><label>Created</label><span>${formatDate(s.createdAt)}</span></div>
            ${s.gst ? `<div class="society-detail-item"><label>GST</label><span>${s.gst}</span></div>` : ""}
            ${s.pan ? `<div class="society-detail-item"><label>PAN</label><span>${s.pan}</span></div>` : ""}
          </div>
          ${
            s.admin
              ? `
            <div style="margin-top:16px;padding:14px 16px;background:var(--green-50);border:1px solid var(--green-200);border-radius:var(--radius-md)">
              <div style="font-size:12px;font-weight:700;color:var(--green-700);margin-bottom:6px"><i class="fa-solid fa-user-shield"></i> Society Admin Assigned</div>
              <div style="font-size:13px;color:var(--gray-700)">${s.admin.name} · ${s.admin.email} · ${s.admin.phone}</div>
            </div>`
              : `
            <div style="margin-top:16px;padding:14px 16px;background:var(--orange-50);border:1px solid var(--orange-200);border-radius:var(--radius-md)">
              <div style="font-size:13px;color:var(--orange-700)"><i class="fa-solid fa-circle-exclamation"></i> No admin assigned yet.</div>
            </div>`
          }
        </div>
        <div class="modal-footer">
          ${s.status !== "approved" ? `<button class="btn btn-success" id="society-approve-btn"><i class="fa-solid fa-check"></i> Approve</button>` : ""}
          ${!s.adminId ? `<button class="btn btn-primary" id="society-create-admin-btn"><i class="fa-solid fa-user-plus"></i> Create Admin</button>` : ""}
          <button class="btn btn-ghost" id="society-close-btn">Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Open the modal with animation
    setTimeout(() => overlay.classList.add("open"), 10);

    // Define close function
    const closeModal = () => {
      overlay.classList.remove("open");
      setTimeout(() => overlay.remove(), 300);
      document.body.style.overflow = "";
    };

    // Close button handlers
    const closeBtn = document.getElementById("society-close-btn");
    const closeIcon = document.getElementById("society-view-close-btn");

    if (closeBtn) closeBtn.onclick = closeModal;
    if (closeIcon) closeIcon.onclick = closeModal;

    // Background click to close
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    // Action buttons
    const approveBtn = document.getElementById("society-approve-btn");
    const createAdminBtn = document.getElementById("society-create-admin-btn");

    if (approveBtn) {
      approveBtn.onclick = async () => {
        await saApproveSociety(s.id);
        closeModal();
      };
    }

    if (createAdminBtn) {
      createAdminBtn.onclick = () => {
        saCreateAdmin(s.id, s.name);
        closeModal();
      };
    }
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function saApproveSociety(id) {
  try {
    // Status update logic needs to be added to AdminController->updateSociety
    await API.put(`/superadmin/societies/${id}/approve`, {});
    Toast.success("Approved!", "Society has been approved and is now active");
    await renderSASocieties();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function saSuspendSociety(id) {
  Modal.confirm(
    "Suspend Society",
    "This will prevent society users from logging in. Continue?",
    async () => {
      try {
        await API.put(`/superadmin/societies/${id}/suspend`, {});
        Toast.warning("Suspended", "Society has been suspended");
        await renderSASocieties();
      } catch (err) {
        Toast.error("Error", err.message);
      }
    },
  );
}

async function saDeleteSociety(id, name) {
  Modal.confirm(
    `Delete "${name}"`,
    "This permanently deletes the society and all associated data. This cannot be undone!",
    async () => {
      try {
        await API.delete(`/superadmin/societies/${id}`);
        Toast.error("Deleted", `"${name}" has been permanently deleted`);
        await renderSASocieties();
      } catch (err) {
        Toast.error("Error", err.message);
      }
    },
  );
}

// ── SUPER ADMIN: ADD SOCIETY ────────────────────────────────
let saAddStep = 1;
const SA_TOTAL_STEPS = 3;

function renderSAAddSociety() {
  saAddStep = 1;
  const prefill = State.saAddSocietyPrefill || {};
  const pc = el("sa-page-content");
  pc.innerHTML = `
    <div class="sa-table-card">
      <div class="sa-table-header">
        <div class="sa-table-title"><i class="fa-solid fa-plus-circle" style="color:var(--primary-500)"></i> Add New Society</div>
        <button class="btn btn-sm btn-ghost" onclick="saNavigate('sa-societies')"><i class="fa-solid fa-arrow-left"></i> Back</button>
      </div>

      <div id="add-soc-step-body" style="padding:28px 32px">
        ${renderAddSocietyForm(prefill)}
      </div>
    </div>`;
  if (prefill.registrationId) State.saAddRegId = prefill.registrationId;
  State.saAddSocietyPrefill = null; // Clear prefill after use
}

function renderAddSocietyForm(prefill = {}) {
  return `
    <div style="max-width:800px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
        <!-- Society Details -->
        <div>
          <h3 style="font-family:var(--font-display);font-size:17px;font-weight:700;margin-bottom:20px;color:var(--gray-800)">
            <i class="fa-solid fa-building" style="color:var(--primary-500)"></i> Society Information
          </h3>
          <div class="form-group">
            <label class="form-label">Society Name *</label>
            <input type="text" class="form-input" id="as-name" placeholder="e.g. Greenwood Heights" value="${prefill.name || ""}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Address *</label>
            <input type="text" class="form-input" id="as-address" placeholder="Street, Sector, Locality" value="${prefill.address || ""}" required>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
              <label class="form-label">City *</label>
              <input type="text" class="form-input" id="as-city" placeholder="e.g. Mumbai" value="${prefill.city || ""}" required>
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" class="form-input" id="as-state" placeholder="e.g. Maharashtra" value="${prefill.state || ""}">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
              <label class="form-label">Pincode</label>
              <input type="text" class="form-input" id="as-pincode" placeholder="e.g. 400001" value="${prefill.pincode || ""}">
            </div>
            <div class="form-group">
              <label class="form-label">Plan</label>
              <select class="form-input" id="as-plan">
                <option value="starter" ${(prefill.plan || "professional") === "starter" ? "selected" : ""}>Starter</option>
                <option value="professional" ${(prefill.plan || "professional") === "professional" ? "selected" : ""}>Professional</option>
                <option value="enterprise" ${(prefill.plan || "") === "enterprise" ? "selected" : ""}>Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Admin Details -->
        <div style="background:var(--gray-50);padding:20px;border-radius:var(--radius-lg);border:1px solid var(--gray-200)">
          <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:20px;color:var(--gray-800)">
            <i class="fa-solid fa-user-shield" style="color:var(--green-600)"></i> Initial Administrator
          </h3>
          <div class="form-group">
            <label class="form-label">Admin Full Name *</label>
            <input type="text" class="form-input" id="as-cname" placeholder="Full name" value="${prefill.contactName || prefill.contact_person || ""}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Admin Email *</label>
            <input type="email" class="form-input" id="as-cemail" placeholder="email@address.com" value="${prefill.contactEmail || prefill.contact_email || ""}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Admin Phone *</label>
            <input type="tel" class="form-input" id="as-cphone" placeholder="10-digit mobile" value="${prefill.contactPhone || prefill.contact_phone || ""}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Initial Password *</label>
            <input type="text" class="form-input" id="as-password" value="Admin@${Math.floor(1000 + Math.random() * 9000)}">
            <div style="font-size:11px;color:var(--gray-400);margin-top:4px"><i class="fa-solid fa-info-circle"></i> Share with admin — they should change on first login</div>
          </div>
        </div>
      </div>
      
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--gray-100);display:flex;justify-content:flex-end;gap:12px">
        <button class="btn btn-ghost" onclick="saNavigate('sa-societies')">Cancel</button>
        <button class="btn btn-primary" id="as-submit-btn" onclick="saCreateSocietyFull()">
          <i class="fa-solid fa-check-circle"></i> Create & Activate Society
        </button>
      </div>
    </div>`;
}

async function saCreateSocietyFull() {
  const name = el("as-name")?.value.trim();
  const city = el("as-city")?.value.trim();
  const email = el("as-cemail")?.value.trim();
  const adminName = el("as-cname")?.value.trim();
  const adminPhone = el("as-cphone")?.value.trim();
  const adminPass = el("as-password")?.value.trim();

  if (!name || !city || !email || !adminName || !adminPhone || !adminPass) {
    Toast.error(
      "Validation",
      "Name, city, admin email, name, phone and password are all required",
    );
    return;
  }

  const btn = el("as-submit-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

  const address = el("as-address")?.value.trim();
  if (!address) {
    Toast.error("Validation", "Address is required");
    btn.disabled = false;
    btn.innerHTML =
      '<i class="fa-solid fa-check-circle"></i> Create & Activate Society';
    return;
  }

  if (adminPass.length < 8) {
    Toast.error(
      "Validation",
      "Initial password must be at least 8 characters (required for admin account).",
    );
    btn.disabled = false;
    btn.innerHTML =
      '<i class="fa-solid fa-check-circle"></i> Create & Activate Society';
    return;
  }

  try {
    const socRes = await API.post("/superadmin/societies", {
      name,
      address,
      city,
      state: el("as-state")?.value.trim() || "",
      country: "India",
      pincode: el("as-pincode")?.value.trim() || "",
      plan: el("as-plan")?.value || "starter",
      contact_person: adminName,
      contact_phone: adminPhone,
      contact_email: email,
      registration_id: State.saAddRegId || null,
    });

    const societyId =
      socRes?.society_id ?? socRes?.societyId ?? socRes?.id ?? null;
    if (societyId == null || societyId === "") {
      throw new Error(
        "Society response did not include an id — cannot create admin. Check the API.",
      );
    }

    try {
      await API.post(`/superadmin/societies/${societyId}/admin`, {
        name: adminName,
        email,
        phone: adminPhone,
        password: adminPass,
      });
    } catch (adminErr) {
      Toast.error(
        "Admin setup failed",
        `${adminErr.message || "Unknown error"} Society #${societyId} was created — open Societies and use “Create Admin” for that society, or delete the orphan row if it was a mistake.`,
      );
      btn.disabled = false;
      btn.innerHTML =
        '<i class="fa-solid fa-check-circle"></i> Create & Activate Society';
      return;
    }

    Toast.success("Success", "Society and Admin created successfully");
    State.saAddRegId = null;
    saNavigate("sa-societies");
  } catch (err) {
    Toast.error("Creation Failed", err.message);
    btn.disabled = false;
    btn.innerHTML =
      '<i class="fa-solid fa-check-circle"></i> Create & Activate Society';
  }
}

function saCreateAdmin(socId, socName) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay open";
  overlay.id = "create-admin-modal";
  overlay.innerHTML = `
    <div class="modal modal-sm">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-user-plus" style="color:var(--primary-500)"></i> Create Admin — ${socName}</span>
        <button class="modal-close" onclick="Modal.close('create-admin-modal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Full Name *</label><input type="text" class="form-input" id="ca-name" placeholder="Admin name"></div>
        <div class="form-group"><label class="form-label">Email *</label><input type="email" class="form-input" id="ca-email" placeholder="admin@society.com"></div>
        <div class="form-group"><label class="form-label">Phone *</label><input type="tel" class="form-input" id="ca-phone" placeholder="10-digit mobile"></div>
        <div class="form-group"><label class="form-label">Password</label><input type="text" class="form-input" id="ca-pass" value="admin@123"></div>
        <div id="ca-result"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="ca-btn" onclick="saCreateAdminSubmit('${socId}')"><i class="fa-solid fa-user-plus"></i> Create Admin</button>
        <button class="btn btn-ghost" onclick="Modal.close('create-admin-modal')">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) Modal.close("create-admin-modal");
  });
}

async function saCreateAdminSubmit(socId) {
  const name = el("ca-name")?.value.trim();
  const email = el("ca-email")?.value.trim();
  const phone = el("ca-phone")?.value.trim();
  const password = el("ca-pass")?.value.trim() || "admin@123";
  if (!name || !email || !phone) {
    Toast.error("Validation", "All fields required");
    return;
  }
  const btn = el("ca-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  try {
    await API.post(`/superadmin/societies/${socId}/admin`, {
      name,
      email,
      phone,
      password,
    });
    el("ca-result").innerHTML =
      `<div style="background:var(--green-50);border:1px solid var(--green-200);border-radius:var(--radius-md);padding:12px;margin-top:12px;font-size:13px;color:var(--green-800)"><i class="fa-solid fa-check-circle"></i> Admin created! Credentials: <strong>${phone}</strong> / <strong>${password}</strong></div>`;
    Toast.success("Admin Created", `${name} can now login`);
    btn.innerHTML = "Done";
    setTimeout(() => {
      Modal.close("create-admin-modal");
      renderSASocieties();
    }, 2000);
  } catch (err) {
    Toast.error("Error", err.message);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Admin';
  }
}

/**
 * Open modal to edit the admin for an approved society.
 * Fetches the society detail to get current admin info and shows a pre-filled form.
 */
async function saEditSocietyAdmin(socId) {
  try {
    const s = await API.get(`/superadmin/societies/${socId}`);
    
    // Remove any existing overlay first to prevent stacking
    const existing = document.getElementById("edit-admin-modal");
    if (existing) existing.remove();
    
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "edit-admin-modal";
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title"><i class="fa-solid fa-pen" style="color:var(--primary-500)"></i> Edit Admin — ${s.name}</span>
          <button class="modal-close" id="ea-close-icon"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div style="background:var(--blue-50);border:1px solid var(--blue-200);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:16px;font-size:13px;color:var(--blue-800)">
            <i class="fa-solid fa-circle-info"></i> Update the society admin details below. The admin uses these credentials to login.
          </div>
          <div class="form-group">
            <label class="form-label">Admin Full Name *</label>
            <input type="text" class="form-input" id="ea-name" value="${s.admin ? s.admin.name : ''}" placeholder="Admin full name">
          </div>
          <div class="form-group">
            <label class="form-label">Admin Email *</label>
            <input type="email" class="form-input" id="ea-email" value="${s.admin ? s.admin.email : ''}" placeholder="admin@society.com">
          </div>
          <div class="form-group">
            <label class="form-label">Admin Phone *</label>
            <input type="tel" class="form-input" id="ea-phone" value="${s.admin ? s.admin.phone : ''}" placeholder="10-digit mobile">
          </div>
          <div class="form-group">
            <label class="form-label">New Password <span style="font-weight:400;color:var(--gray-400)">(leave blank to keep current)</span></label>
            <input type="text" class="form-input" id="ea-password" placeholder="Min 8 chars to update" autocomplete="off">
          </div>
          <div id="ea-err" style="display:none;margin-top:12px;padding:10px 12px;background:var(--red-50);border:1px solid var(--red-200);border-radius:var(--radius-md);font-size:13px;color:var(--red-800)"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="ea-save-btn"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>
          <button class="btn btn-ghost" id="ea-cancel-btn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Proper close function that removes the DOM element
    const closeEditAdminModal = () => {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
    };

    // Open with animation
    setTimeout(() => overlay.classList.add("open"), 10);

    // Wire up close buttons
    document.getElementById("ea-close-icon").onclick = closeEditAdminModal;
    document.getElementById("ea-cancel-btn").onclick = closeEditAdminModal;
    
    // Backdrop click to close
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeEditAdminModal();
    });

    const errEl = document.getElementById("ea-err");
    const btn = document.getElementById("ea-save-btn");
    btn.onclick = async () => {
      const name = document.getElementById("ea-name").value.trim();
      const email = document.getElementById("ea-email").value.trim();
      const phone = document.getElementById("ea-phone").value.trim();
      const password = document.getElementById("ea-password").value.trim();

      errEl.style.display = "none";
      if (!name || !email || !phone) {
        errEl.textContent = "Name, email, and phone are required.";
        errEl.style.display = "block";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = "Please enter a valid email address.";
        errEl.style.display = "block";
        return;
      }
      if (phone.replace(/\D/g, '').length < 10) {
        errEl.textContent = "Please enter a valid 10-digit phone number.";
        errEl.style.display = "block";
        return;
      }
      if (password && password.length < 8) {
        errEl.textContent = "Password must be at least 8 characters.";
        errEl.style.display = "block";
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      try {
        const body = { name, email, phone };
        if (password) body.password = password;
        await API.put(`/superadmin/societies/${socId}/admin`, body);
        closeEditAdminModal();
        Toast.success("Updated", "Admin details updated successfully");
        await renderSASocieties();
      } catch (err) {
        errEl.textContent = err.message || "Update failed";
        errEl.style.display = "block";
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
      }
    };
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

async function renderSAAdmins() {
  try {
    const admins = await API.get("/superadmin/admins");
    const pc = el("sa-page-content");
    pc.innerHTML = `
      <div class="sa-table-card">
        <div class="sa-table-header">
          <div class="sa-table-title"><i class="fa-solid fa-users-gear" style="color:var(--primary-500)"></i> Society Administrators</div>
          <div style="font-size:13px;color:var(--gray-400)">${admins.length} admins total</div>
        </div>
        <div style="overflow-x:auto">
          <table class="sa-table">
            <thead><tr>
              <th>Admin</th><th>Phone</th><th>Society</th><th>Status</th><th>Created</th><th>Actions</th>
            </tr></thead>
            <tbody>
              ${
                admins.length === 0
                  ? `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-400)">No admins yet</td></tr>`
                  : admins
                      .map(
                        (a) => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="user-avatar" style="width:32px;height:32px;font-size:11px;flex-shrink:0">${initials(a.name)}</div>
                      <div>
                        <div style="font-weight:600;font-size:13px">${a.name}</div>
                        <div style="font-size:11px;color:var(--gray-400)">${a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>${a.phone}</td>
                  <td>${a.society ? `<div style="font-weight:600;font-size:13px">${a.society.name}</div><span class="society-code">${a.society.code}</span>` : '<span style="color:var(--gray-400)">—</span>'}</td>
                  <td><span class="badge badge-${a.isActive ? "approved" : "suspended"}">${a.isActive ? "Active" : "Inactive"}</span></td>
                  <td>${formatDate(a.createdAt)}</td>
                  <td>
                    <button class="sa-icon-btn ${a.status === "active" ? "danger" : "success"}" title="${a.status === "active" ? "Deactivate" : "Activate"}" onclick="saToggleAdmin('${a.id}')">
                      <i class="fa-solid fa-${a.status === "active" ? "ban" : "check"}"></i>
                    </button>
                  </td>
                </tr>`,
                      )
                      .join("")
              }
            </tbody>
          </table>
        </div>
      </div>`;
  } catch (err) {
    showError("Failed to load admins");
  }
}

async function saToggleAdmin(id) {
  try {
    // Backend needs a specific status toggle endpoint or standard PUT
    await API.put(`/superadmin/admins/${id}/toggle`, {});
    Toast.info("Updated", `Admin status changed`);
    await renderSAAdmins();
  } catch (err) {
    Toast.error("Error", err.message);
  }
}

function renderSAModals() {
  return ""; // Modals are created dynamically
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") Modal.closeAll();
});

// Start app
init();


// ============ GUARD MANAGEMENT ============

// State for guard management
const GuardMgmt = {
  guards: [],
  attendance: [],
  attendanceSummary: null,
  total: 0,
  page: 1,
  search: '',
  statusFilter: '',
  activeTab: 'guards',
  attPage: 1,
  attGuardId: '',
  attDateFrom: '',
  attDateTo: '',
  attStatus: '',
  attTotal: 0,
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}
function getFirstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

async function renderGuards() {
  GuardMgmt.activeTab = GuardMgmt.activeTab || 'guards';
  if (!GuardMgmt.attDateFrom) GuardMgmt.attDateFrom = getFirstOfMonth();
  if (!GuardMgmt.attDateTo)   GuardMgmt.attDateTo   = getToday();

  const pc = el('page-content');
  pc.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Guard Management</h1>
        <p class="page-subtitle">Manage security guards and view attendance records</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-sm" onclick="openAddGuardModal()">
          <i class="fa-solid fa-plus"></i> Add Guard
        </button>
      </div>
    </div>

    <div class="card" style="margin-bottom:0">
      <div style="display:flex;border-bottom:1px solid var(--gray-200);padding:0 20px">
        <button id="tab-guards" onclick="switchGuardTab('guards')"
          style="padding:14px 20px;background:none;border:none;border-bottom:2px solid ${GuardMgmt.activeTab==='guards'?'var(--primary-500)':'transparent'};
          color:${GuardMgmt.activeTab==='guards'?'var(--primary-600)':'var(--gray-500)'};font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px">
          <i class="fa-solid fa-users"></i> Guards
        </button>
        <button id="tab-attendance" onclick="switchGuardTab('attendance')"
          style="padding:14px 20px;background:none;border:none;border-bottom:2px solid ${GuardMgmt.activeTab==='attendance'?'var(--primary-500)':'transparent'};
          color:${GuardMgmt.activeTab==='attendance'?'var(--primary-600)':'var(--gray-500)'};font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px">
          <i class="fa-solid fa-clock"></i> Attendance
        </button>
      </div>
      <div id="guard-tab-content" class="card-body" style="padding:20px">
        <div class="skeleton skeleton-card" style="height:200px"></div>
      </div>
    </div>

    ${guardModalsHTML()}
  `;

  if (GuardMgmt.activeTab === 'guards') {
    await loadGuardsTab();
  } else {
    await loadAttendanceTab();
  }
}

function switchGuardTab(tab) {
  GuardMgmt.activeTab = tab;
  renderGuards();
}

// ── Guards list tab ──────────────────────────────────────────────────────────

async function loadGuardsTab() {
  const content = el('guard-tab-content');
  if (!content) return;

  try {
    const params = new URLSearchParams({ page: GuardMgmt.page, limit: 20 });
    if (GuardMgmt.search)       params.set('search', GuardMgmt.search);
    if (GuardMgmt.statusFilter) params.set('status', GuardMgmt.statusFilter);

    // guardApiRequest tries /admin/guards first, falls back to patch file automatically
    const json   = await guardApiRequest(`/admin/guards?${params}`);
    const raw    = json.data ?? json;
    const guards     = Array.isArray(raw) ? raw : (raw.data ?? []);
    const pagination = raw.pagination ?? {};
    GuardMgmt.guards = guards;
    GuardMgmt.total  = pagination.total ?? guards.length;

  } catch (err) {
    el('guard-tab-content').innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;color:var(--red-400)"></i><p>${err.message}</p></div>`;
    return;
  }

  const content2 = el('guard-tab-content');
  if (!content2) return;

  content2.innerHTML = `
    <!-- Toolbar -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center">
      <div style="position:relative;flex:1;min-width:200px">
        <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);font-size:13px"></i>
        <input id="guard-search" type="text" placeholder="Search name or phone…"
          value="${GuardMgmt.search}"
          onkeyup="guardSearchDebounce(this.value)"
          style="width:100%;padding:8px 12px 8px 32px;border:1px solid var(--gray-300);border-radius:8px;font-size:13px;box-sizing:border-box">
      </div>
      <select onchange="GuardMgmt.statusFilter=this.value;GuardMgmt.page=1;loadGuardsTab()"
        style="padding:8px 12px;border:1px solid var(--gray-300);border-radius:8px;font-size:13px">
        <option value="" ${!GuardMgmt.statusFilter?'selected':''}>All Status</option>
        <option value="active"   ${GuardMgmt.statusFilter==='active'  ?'selected':''}>Active</option>
        <option value="inactive" ${GuardMgmt.statusFilter==='inactive'?'selected':''}>Inactive</option>
        <option value="blocked"  ${GuardMgmt.statusFilter==='blocked' ?'selected':''}>Blocked</option>
      </select>
      <span style="font-size:13px;color:var(--gray-500);white-space:nowrap">${GuardMgmt.total} guard${GuardMgmt.total!==1?'s':''}</span>
    </div>

    <!-- Table -->
    ${GuardMgmt.guards.length === 0
      ? emptyState('fa-shield-halved', 'No guards found', 'Add a guard to get started')
      : `<div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="background:var(--gray-50);border-bottom:2px solid var(--gray-200)">
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Guard</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Contact</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Status</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Today</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${GuardMgmt.guards.map(guardRow).join('')}
            </tbody>
          </table>
        </div>
        ${renderGuardPagination()}`
    }
  `;
}

let guardSearchTimer = null;
function guardSearchDebounce(val) {
  clearTimeout(guardSearchTimer);
  guardSearchTimer = setTimeout(() => {
    GuardMgmt.search = val;
    GuardMgmt.page = 1;
    loadGuardsTab();
  }, 400);
}

function guardRow(g) {
  const todayLabel = guardTodayBadge(g);
  const statusClass = { active: 'approved', inactive: 'pending', blocked: 'rejected' }[g.status] || 'pending';
  return `
    <tr style="border-bottom:1px solid var(--gray-100)" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''">
      <td style="padding:12px 14px">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="user-avatar" style="width:36px;height:36px;font-size:13px;background:var(--green-100);color:var(--green-700);flex-shrink:0">
            ${g.profile_image
              ? `<img src="${g.profile_image}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`
              : initials(g.name)}
          </div>
          <div>
            <div style="font-weight:600;color:var(--gray-800)">${g.name}</div>
            <div style="font-size:11px;color:var(--gray-400)">${g.app_user_id || ''}</div>
          </div>
        </div>
      </td>
      <td style="padding:12px 14px">
        <div style="font-size:13px;color:var(--gray-700)">${g.phone}</div>
        <div style="font-size:11px;color:var(--gray-400)">${g.email || '—'}</div>
      </td>
      <td style="padding:12px 14px"><span class="badge badge-${statusClass}">${g.status}</span></td>
      <td style="padding:12px 14px">${todayLabel}</td>
      <td style="padding:12px 14px">
        <div style="display:flex;gap:8px">
          <button onclick="openEditGuardModal(${JSON.stringify(g).replace(/"/g,'&quot;')})"
            style="padding:5px 10px;border:1px solid var(--gray-300);border-radius:6px;background:white;font-size:12px;cursor:pointer;color:var(--primary-600)">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button onclick="deleteGuard(${g.id},'${g.name}')"
            style="padding:5px 10px;border:1px solid var(--red-200);border-radius:6px;background:white;font-size:12px;cursor:pointer;color:var(--red-600)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
}

function guardTodayBadge(g) {
  if (!g.today_in_time && !g.today_status) {
    return '<span style="font-size:12px;color:var(--gray-400)">Not marked</span>';
  }
  if (g.today_in_time && !g.today_out_time) {
    return `<span class="badge badge-approved"><span class="badge-dot"></span>On duty since ${formatTime(g.today_in_time)}</span>`;
  }
  if (g.today_in_time && g.today_out_time) {
    return `<span class="badge badge-pending"><span class="badge-dot"></span>Shift complete</span>`;
  }
  return '<span style="font-size:12px;color:var(--gray-400)">—</span>';
}

async function guardApiRequest(path) {
  // Try the main route first; if 404, fall back to the standalone patch file
  const base = 'https://app.mygatebell.com/backend';
  const token = window.State?.token || localStorage.getItem('gh_token') || localStorage.getItem('auth_token') || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Primary: /api/admin/guards[/attendance]
  const primary = `${base}${path}`;
  let res = await fetch(primary, { method: 'GET', headers });
  let json = await res.json().catch(() => ({}));

  if (!res.ok || json.status === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json;
}

function renderGuardPagination() {
  const total = GuardMgmt.total;
  const page  = GuardMgmt.page;
  const limit = 20;
  if (total <= limit) return '';
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;margin-top:8px;font-size:13px;color:var(--gray-500)">
      <span>Showing ${start}–${end} of ${total}</span>
      <div style="display:flex;gap:6px">
        <button onclick="GuardMgmt.page--;loadGuardsTab()" ${page<=1?'disabled':''} style="padding:6px 12px;border:1px solid var(--gray-300);border-radius:6px;background:white;cursor:${page<=1?'not-allowed':'pointer'};opacity:${page<=1?0.4:1}">← Prev</button>
        <button onclick="GuardMgmt.page++;loadGuardsTab()" ${end>=total?'disabled':''} style="padding:6px 12px;border:1px solid var(--gray-300);border-radius:6px;background:white;cursor:${end>=total?'not-allowed':'pointer'};opacity:${end>=total?0.4:1}">Next →</button>
      </div>
    </div>`;
}

// ── Attendance tab ───────────────────────────────────────────────────────────

async function loadAttendanceTab() {
  const content = el('guard-tab-content');
  if (!content) return;

  // Load guard list for filter dropdown (once), using guardApiRequest with fallback
  if (!GuardMgmt.allGuards) {
    try {
      const j = await guardApiRequest('/admin/guards?limit=100');
      const raw = j.data ?? j;
      GuardMgmt.allGuards = Array.isArray(raw) ? raw : (raw.data ?? []);
    } catch { GuardMgmt.allGuards = []; }
  }

  let records = [], summary = null;
  try {
    const params = new URLSearchParams({
      page: GuardMgmt.attPage, limit: 30,
      date_from: GuardMgmt.attDateFrom,
      date_to:   GuardMgmt.attDateTo,
    });
    if (GuardMgmt.attGuardId) params.set('guard_id', GuardMgmt.attGuardId);
    if (GuardMgmt.attStatus)  params.set('status',   GuardMgmt.attStatus);

    const json = await guardApiRequest(`/admin/guards/attendance?${params}`);
    const raw  = json.data ?? json;
    records  = Array.isArray(raw) ? raw : (raw.data ?? []);
    summary  = raw.summary ?? null;
    GuardMgmt.attendanceSummary = summary;
    GuardMgmt.attTotal = raw.pagination?.total ?? records.length;
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;color:var(--red-400)"></i>
      <p style="font-weight:600">${err.message}</p>
      <button onclick="loadAttendanceTab()" style="margin-top:14px;padding:8px 18px;background:var(--primary-500);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer">
        <i class="fa-solid fa-rotate-right"></i> Retry
      </button></div>`;
    return;
  }

  const presentRate = summary && summary.total_records > 0
    ? Math.round((summary.present_count / summary.total_records) * 100) : 0;

  content.innerHTML = `
    <!-- Summary cards -->
    ${summary ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:20px">
      ${attSummaryCard('Total Records', summary.total_records, 'var(--primary-500)', 'fa-list')}
      ${attSummaryCard('Present', summary.present_count, 'var(--green-600)', 'fa-circle-check')}
      ${attSummaryCard('Absent', summary.absent_count, 'var(--red-500)', 'fa-circle-xmark')}
      <div style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:10px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:12px;color:var(--blue-600);font-weight:500">Attendance Rate</span>
          <i class="fa-solid fa-chart-line" style="color:var(--blue-400);font-size:12px"></i>
        </div>
        <div style="font-size:24px;font-weight:700;color:var(--blue-700)">${presentRate}%</div>
        <div style="margin-top:6px;height:4px;background:var(--blue-100);border-radius:4px">
          <div style="height:4px;background:var(--blue-500);border-radius:4px;width:${presentRate}%;transition:width 0.4s"></div>
        </div>
      </div>
    </div>` : ''}

    <!-- Filters -->
    <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:10px;padding:14px;margin-bottom:16px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--gray-500);display:block;margin-bottom:4px">GUARD</label>
          <select onchange="GuardMgmt.attGuardId=this.value;GuardMgmt.attPage=1;loadAttendanceTab()"
            style="width:100%;padding:7px 10px;border:1px solid var(--gray-300);border-radius:7px;font-size:13px">
            <option value="">All Guards</option>
            ${(GuardMgmt.allGuards||[]).map(g=>`<option value="${g.id}" ${GuardMgmt.attGuardId==g.id?'selected':''}>${g.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--gray-500);display:block;margin-bottom:4px">FROM</label>
          <input type="date" value="${GuardMgmt.attDateFrom}"
            onchange="GuardMgmt.attDateFrom=this.value;GuardMgmt.attPage=1;loadAttendanceTab()"
            style="width:100%;padding:7px 10px;border:1px solid var(--gray-300);border-radius:7px;font-size:13px;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--gray-500);display:block;margin-bottom:4px">TO</label>
          <input type="date" value="${GuardMgmt.attDateTo}"
            onchange="GuardMgmt.attDateTo=this.value;GuardMgmt.attPage=1;loadAttendanceTab()"
            style="width:100%;padding:7px 10px;border:1px solid var(--gray-300);border-radius:7px;font-size:13px;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--gray-500);display:block;margin-bottom:4px">STATUS</label>
          <select onchange="GuardMgmt.attStatus=this.value;GuardMgmt.attPage=1;loadAttendanceTab()"
            style="width:100%;padding:7px 10px;border:1px solid var(--gray-300);border-radius:7px;font-size:13px">
            <option value="" ${!GuardMgmt.attStatus?'selected':''}>All Status</option>
            <option value="present"  ${GuardMgmt.attStatus==='present' ?'selected':''}>Present</option>
            <option value="absent"   ${GuardMgmt.attStatus==='absent'  ?'selected':''}>Absent</option>
            <option value="half_day" ${GuardMgmt.attStatus==='half_day'?'selected':''}>Half Day</option>
            <option value="off"      ${GuardMgmt.attStatus==='off'     ?'selected':''}>Off</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    ${records.length === 0
      ? emptyState('fa-clock', 'No attendance records', 'Try adjusting your date range or filters')
      : `<div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="background:var(--gray-50);border-bottom:2px solid var(--gray-200)">
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Guard</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Date</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Status</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Check In</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Check Out</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--gray-500)">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(attRow).join('')}
            </tbody>
          </table>
        </div>
        ${renderAttPagination()}`
    }
  `;
}

function attSummaryCard(label, value, color, icon) {
  return `
    <div style="background:white;border:1px solid var(--gray-200);border-radius:10px;padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:12px;color:var(--gray-500);font-weight:500">${label}</span>
        <i class="fa-solid ${icon}" style="color:${color};font-size:12px"></i>
      </div>
      <div style="font-size:26px;font-weight:700;color:var(--gray-800)">${value}</div>
    </div>`;
}

function attRow(r) {
  const statusMap = { present:'approved', absent:'rejected', half_day:'pending', off:'pending' };
  const statusClass = statusMap[r.status] || 'pending';
  const dur = calcShiftDuration(r.in_time, r.out_time);
  const dateStr = new Date(r.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  return `
    <tr style="border-bottom:1px solid var(--gray-100)" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''">
      <td style="padding:12px 14px">
        <div style="font-weight:600;color:var(--gray-800)">${r.guard_name}</div>
        <div style="font-size:11px;color:var(--gray-400)">${r.guard_phone || ''}</div>
      </td>
      <td style="padding:12px 14px;font-size:13px;color:var(--gray-700)">${dateStr}</td>
      <td style="padding:12px 14px"><span class="badge badge-${statusClass}">${r.status.replace('_',' ')}</span></td>
      <td style="padding:12px 14px;font-size:13px;color:var(--gray-700)">${formatTime(r.in_time) || '—'}</td>
      <td style="padding:12px 14px;font-size:13px;color:var(--gray-700)">${formatTime(r.out_time) || '—'}</td>
      <td style="padding:12px 14px;font-size:13px;color:var(--gray-600)">${dur}</td>
    </tr>`;
}

function calcShiftDuration(inTime, outTime) {
  if (!inTime || !outTime) return '—';
  const diff = new Date(outTime) - new Date(inTime);
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function renderAttPagination() {
  const total = GuardMgmt.attTotal;
  const page  = GuardMgmt.attPage;
  const limit = 30;
  if (total <= limit) return '';
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;margin-top:8px;font-size:13px;color:var(--gray-500)">
      <span>Showing ${start}–${end} of ${total}</span>
      <div style="display:flex;gap:6px">
        <button onclick="GuardMgmt.attPage--;loadAttendanceTab()" ${page<=1?'disabled':''} style="padding:6px 12px;border:1px solid var(--gray-300);border-radius:6px;background:white;cursor:${page<=1?'not-allowed':'pointer'};opacity:${page<=1?0.4:1}">← Prev</button>
        <button onclick="GuardMgmt.attPage++;loadAttendanceTab()" ${end>=total?'disabled':''} style="padding:6px 12px;border:1px solid var(--gray-300);border-radius:6px;background:white;cursor:${end>=total?'not-allowed':'pointer'};opacity:${end>=total?0.4:1}">Next →</button>
      </div>
    </div>`;
}

// ── Add / Edit Guard modals ──────────────────────────────────────────────────

function openAddGuardModal() {
  const m = el('guard-form-modal');
  if (!m) return;
  el('guard-modal-title').textContent = 'Add New Guard';
  el('guard-form-id').value = '';
  el('guard-form-name').value = '';
  el('guard-form-phone').value = '';
  el('guard-form-phone').disabled = false;
  el('guard-form-email').value = '';
  el('guard-form-password').value = '';
  el('guard-form-password').required = true;
  el('guard-form-status').value = 'active';
  el('guard-phone-hint').style.display = 'none';
  el('guard-password-row').style.display = '';
  el('guard-form-error').textContent = '';
  Modal.open('guard-form-modal');
}

function openEditGuardModal(g) {
  const m = el('guard-form-modal');
  if (!m) return;
  el('guard-modal-title').textContent = 'Edit Guard';
  el('guard-form-id').value    = g.id;
  el('guard-form-name').value  = g.name || '';
  el('guard-form-phone').value = g.phone || '';
  el('guard-form-phone').disabled = true;
  el('guard-form-email').value  = g.email || '';
  el('guard-form-password').value = '';
  el('guard-form-password').required = false;
  el('guard-form-status').value = g.status || 'active';
  el('guard-phone-hint').style.display = '';
  el('guard-password-row').style.display = 'none';
  el('guard-form-error').textContent = '';
  Modal.open('guard-form-modal');
}

async function submitGuardForm(e) {
  e.preventDefault();
  const errEl = el('guard-form-error');
  errEl.textContent = '';

  const id       = el('guard-form-id').value;
  const name     = el('guard-form-name').value.trim();
  const phone    = el('guard-form-phone').value.trim().replace(/\D/g,'');
  const email    = el('guard-form-email').value.trim();
  const password = el('guard-form-password').value;
  const status   = el('guard-form-status').value;
  const isEdit   = !!id;

  // Validate
  if (!name) { errEl.textContent = 'Name is required.'; return; }
  if (!isEdit && phone.length < 10) { errEl.textContent = 'Enter a valid 10-digit phone number.'; return; }
  if (!isEdit && password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

  const btn = el('guard-form-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';

  try {
    if (isEdit) {
      await API.put(`/admin/users/${id}`, { name, email, status });
      Toast.success('Updated', `${name} updated successfully`);
    } else {
      await API.post('/admin/users', { name, phone, email, password, role: 'guard', status });
      Toast.success('Guard Added', `${name} has been created`);
    }
    Modal.close('guard-form-modal');
    GuardMgmt.page = 1;
    await loadGuardsTab();
  } catch (err) {
    errEl.textContent = err.message || 'Operation failed. Please try again.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = isEdit ? '<i class="fa-solid fa-floppy-disk"></i> Save Changes' : '<i class="fa-solid fa-plus"></i> Create Guard';
  }
}

async function deleteGuard(id, name) {
  Modal.confirm(
    'Remove Guard',
    `Remove <strong>${name}</strong>? Their historical records will be preserved but they will no longer be able to log in.`,
    async () => {
      try {
        await API.delete(`/admin/users/${id}`);
        Toast.success('Removed', `${name} has been removed`);
        GuardMgmt.page = 1;
        await loadGuardsTab();
      } catch (err) {
        Toast.error('Error', err.message);
      }
    }
  );
}

// ── Modal HTML injected into the page ────────────────────────────────────────

function guardModalsHTML() {
  return `
  <!-- Add / Edit Guard Modal -->
  <div class="modal-overlay" id="guard-form-modal" onclick="if(event.target===this)Modal.close('guard-form-modal')">
    <div class="modal modal-sm" style="max-width:460px;width:100%">
      <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--gray-200)">
        <h3 class="modal-title" id="guard-modal-title" style="margin:0;font-size:17px;font-weight:700">Add Guard</h3>
        <button onclick="Modal.close('guard-form-modal')" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--gray-500);line-height:1">&times;</button>
      </div>
      <form onsubmit="submitGuardForm(event)">
        <input type="hidden" id="guard-form-id">
        <div class="modal-body" style="padding:20px 22px;display:flex;flex-direction:column;gap:14px">
          <div id="guard-form-error" style="color:var(--red-600);font-size:13px;min-height:18px;font-weight:500"></div>

          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:5px;display:block">
              Full Name <span style="color:var(--red-500)">*</span>
            </label>
            <input id="guard-form-name" type="text" required placeholder="e.g. Ramesh Kumar"
              style="width:100%;padding:9px 12px;border:1px solid var(--gray-300);border-radius:8px;font-size:14px;box-sizing:border-box">
          </div>

          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:5px;display:block">
              Phone <span style="color:var(--red-500)">*</span>
            </label>
            <input id="guard-form-phone" type="tel" required placeholder="10-digit mobile number"
              style="width:100%;padding:9px 12px;border:1px solid var(--gray-300);border-radius:8px;font-size:14px;box-sizing:border-box">
            <p id="guard-phone-hint" style="font-size:11px;color:var(--gray-400);margin:4px 0 0;display:none">
              Phone number cannot be changed after creation
            </p>
          </div>

          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:5px;display:block">
              Email
            </label>
            <input id="guard-form-email" type="email" placeholder="guard@example.com"
              style="width:100%;padding:9px 12px;border:1px solid var(--gray-300);border-radius:8px;font-size:14px;box-sizing:border-box">
          </div>

          <div id="guard-password-row" class="form-group" style="margin:0">
            <label class="form-label" style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:5px;display:block">
              Password <span style="color:var(--red-500)">*</span>
            </label>
            <input id="guard-form-password" type="password" placeholder="Min 6 characters"
              style="width:100%;padding:9px 12px;border:1px solid var(--gray-300);border-radius:8px;font-size:14px;box-sizing:border-box">
          </div>

          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:5px;display:block">
              Status
            </label>
            <select id="guard-form-status"
              style="width:100%;padding:9px 12px;border:1px solid var(--gray-300);border-radius:8px;font-size:14px">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="padding:14px 22px;border-top:1px solid var(--gray-200);display:flex;gap:10px;justify-content:flex-end">
          <button type="button" onclick="Modal.close('guard-form-modal')"
            style="padding:9px 18px;border:1px solid var(--gray-300);border-radius:8px;background:white;font-size:14px;cursor:pointer;color:var(--gray-700)">
            Cancel
          </button>
          <button type="submit" id="guard-form-submit" class="btn btn-primary"
            style="padding:9px 18px;font-size:14px">
            <i class="fa-solid fa-plus"></i> Create Guard
          </button>
        </div>
      </form>
    </div>
  </div>`;
}
