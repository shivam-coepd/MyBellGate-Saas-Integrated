/**
 * Society Admin API bridge — maps legacy SPA endpoints to mygate-backend-FULL PHP routes.
 * Aligned with Postman collection request/response shapes.
 */
("use strict");

const SocietyBridge = (() => {
  const LEGACY_PREFIXES = [
    "/dashboard/",
    "/residents",
    "/visitors",
    "/complaints",
    "/notices",
    "/billing",
    "/staff",
  ];

  /** UI complaint labels → API enum (general, maintenance, security, billing, other) */
  const UI_CATEGORY_TO_API = {
    plumbing: "maintenance",
    electrical: "maintenance",
    cleaning: "maintenance",
    lift: "maintenance",
    parking: "other",
    security: "security",
    maintenance: "maintenance",
    general: "general",
    billing: "billing",
    other: "other",
  };

  const API_CATEGORY_TO_UI = {
    maintenance: "maintenance",
    general: "general",
    security: "security",
    billing: "billing",
    other: "other",
  };

  const PURPOSE_TO_VISITOR_TYPE = {
    Delivery: "delivery",
    Courier: "delivery",
    "Personal Visit": "guest",
    Maid: "service",
    Plumber: "service",
    Electrician: "service",
    Carpenter: "service",
    Cook: "service",
    Driver: "service",
    "Official Work": "other",
    Other: "other",
  };

  function isLegacyEndpoint(endpoint) {
    if (endpoint.startsWith("/superadmin") || endpoint.startsWith("/auth/")) {
      return false;
    }
    return LEGACY_PREFIXES.some((p) => endpoint === p || endpoint.startsWith(p));
  }

  function societyId() {
    let u = window.State?.user;
    if (!u) {
      try {
        const savedUser = localStorage.getItem("gh_user") || localStorage.getItem("user");
        if (savedUser) {
          u = JSON.parse(savedUser);
          if (window.State) window.State.user = u;
        }
      } catch (e) {}
    }
    console.log("societyId called with user :- ", u);
    return u?.society_id ?? u?.societyId ?? null;
  }

  function invalidateCache() {
    completeCache = null;
    flatsCache = null;
    residentsCache = null;
    staffCache = null;
  }

  async function rawRequest(method, endpoint, body) {
    const headers = { "Content-Type": "application/json" };
    let token = window.State?.token || localStorage.getItem("gh_token") || localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`https://app.mygatebell.com/backend${endpoint}`, opts);
    let json;
    try {
      json = await res.json();
    } catch {
      throw new Error(`Invalid server response (${res.status})`);
    }
    if (!res.ok || json.status === false) {
      const msg =
        json.message ||
        (Array.isArray(json.errors) ? json.errors.join(", ") : null) ||
        json.error ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }
    if (json.hasOwnProperty("data") && json.status === true) {
      return json.data;
    }
    return json;
  }

  function unwrapList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function mapInvoiceStatus(status) {
    if (status === "paid" || status === "partially_paid") return "paid";
    if (status === "overdue") return "overdue";
    if (status === "cancelled") return "cancelled";
    return "unpaid";
  }

  function mapPaymentMethod(method) {
    const m = (method || "").toLowerCase();
    if (m.includes("upi")) return "upi";
    if (m.includes("net")) return "net_banking";
    if (m.includes("credit")) return "credit_card";
    if (m.includes("debit")) return "debit_card";
    if (m.includes("cash")) return "cash";
    if (m.includes("cheque")) return "cheque";
    return "bank_transfer";
  }

  function mapVisitor(v, flatByResident) {
    const flat = flatByResident?.[v.resident_id];
    const entryTime =
      v.visit_date && v.visit_time
        ? `${v.visit_date}T${v.visit_time}`
        : v.created_at;
    return {
      id: String(v.id),
      name: v.name,
      phone: v.phone,
      purpose: v.purpose,
      flatNo: flat?.flatNo || v.flat_number || "—",
      flatId: flat?.id ? String(flat.id) : null,
      residentId: v.resident_id ? String(v.resident_id) : null,
      residentName: v.resident_name || flat?.ownerName || "—",
      status: v.status,
      visitorType: v.visitor_type || "guest",
      createdAt: v.created_at,
      visitDate: v.visit_date,
      visitTime: v.visit_time,
      entryTime: v.status === "entered" || v.status === "exited" ? entryTime : null,
      exitTime: v.actual_exit_time || null,
    };
  }

  function mapTicket(t) {
    const apiCat = t.category || "other";
    return {
      id: String(t.id),
      ticketNumber: t.ticket_number,
      title: t.title,
      description: t.description,
      category: API_CATEGORY_TO_UI[apiCat] || apiCat,
      apiCategory: apiCat,
      priority: t.priority || "medium",
      status: t.status,
      flatNo: t.flat_number || "—",
      residentName: t.resident_name || "—",
      residentId: t.resident_id ? String(t.resident_id) : null,
      assignedTo: t.assigned_to_name || null,
      assignedToId: t.assigned_to ? String(t.assigned_to) : null,
      createdAt: t.created_at,
      comments: (t.comments || []).map((c) => ({
        id: String(c.id),
        text: c.comment || c.text,
        authorName: c.commenter_name || c.authorName || "User",
        role: c.role || "resident",
        createdAt: c.created_at,
      })),
    };
  }

  function mapAnnouncement(a) {
    const priority =
      a.priority ||
      (a.is_draft == 1 ? "draft" : "general");
    return {
      id: String(a.id),
      title: a.title,
      content: a.content,
      priority,
      isActive: a.is_draft == 0 || a.is_draft === false,
      createdAt: a.created_at,
      createdBy: a.created_by_name || "",
      acknowledgedBy: [],
    };
  }

  function mapInvoice(i) {
    const month = (i.invoice_date || "").slice(0, 7);
    return {
      id: String(i.id),
      invoiceNumber: i.invoice_number,
      flatNo: i.flat_number || "—",
      residentName: i.resident_name || "—",
      residentId: i.resident_id ? String(i.resident_id) : null,
      month: month || new Date().toISOString().slice(0, 7),
      maintenanceAmount: Number(i.total_amount) || 0,
      waterCharges: 0,
      parkingCharges: 0,
      penalty: Number(i.fine_amount) || 0,
      totalAmount: Number(i.total_amount) || 0,
      status: mapInvoiceStatus(i.status),
      dueDate: i.due_date || i.invoice_date,
      paidDate: i.status === "paid" ? i.updated_at : null,
      paymentMethod: null,
    };
  }

  function mapFlat(f) {
    const ownerName = f.owner_name || null;
    const tenantName = f.tenant_name || null;
    const displayName = ownerName || tenantName;
    return {
      id: String(f.id),
      flatNo: f.flat_number || f.flatNo,
      block: f.building_name || f.block || "Block A",
      floor: parseInt(f.floor_number, 10) || 1,
      area: parseInt(f.area_sqft, 10) || 0,
      type: f.type || "2BHK",
      status:
        f.is_occupied == 1 || f.is_occupied === true ? "occupied" : "vacant",
      buildingId: f.building_id ? String(f.building_id) : null,
      ownerId: f.owner_id ? String(f.owner_id) : null,
      tenantId: f.tenant_id ? String(f.tenant_id) : null,
      ownerName: displayName,
      owner: displayName ? { name: displayName, phone: f.owner_phone } : null,
      residents: [
        ...(f.owner_id ? [String(f.owner_id)] : []),
        ...(f.tenant_id ? [String(f.tenant_id)] : []),
      ],
    };
  }

  function mapResident(u, flats) {
    const flat = flats.find(
      (f) =>
        String(f.owner_id) === String(u.id) ||
        String(f.tenant_id) === String(u.id),
    );
    const flatUi = flat ? mapFlat(flat) : { flatNo: "—", block: "—" };
    return {
      id: String(u.id),
      name: u.name,
      email: u.email || "",
      phone: u.phone,
      role: u.role,
      type: u.resident_type || "owner",
      flatId: flat ? String(flat.id) : null,
      flatNo: flatUi.flatNo,
      block: flatUi.block,
      isActive: u.status === "active",
      status: u.status,
      createdAt: u.created_at,
    };
  }

  let completeCache = null;
  let completeCacheAt = 0;
  let flatsCache = null;
  let residentsCache = null;
  let staffCache = null;

  async function getCompleteSociety(force) {
    const sid = societyId();
    console.log("getCompleteSociety called with society id :- ", sid);
    if (!sid) throw new Error("No society linked to this account");
    const now = Date.now();
    if (!force && completeCache && now - completeCacheAt < 45000) {
      return completeCache;
    }
    completeCache = await rawRequest("GET", `/admin/societies/${sid}/complete`);
    completeCacheAt = now;
    return completeCache;
  }

  async function loadRawFlats(force) {
    if (!force && flatsCache) return flatsCache;
    const sid = societyId();
    flatsCache = unwrapList(
      await rawRequest("GET", `/flats/all-by-society/${sid}`),
    );
    return flatsCache;
  }

  async function loadResidents(force) {
    if (!force && residentsCache) return residentsCache;
    const users = unwrapList(
      await rawRequest("GET", "/admin/users?role=resident&limit=500"),
    );
    const flats = await loadRawFlats(force);
    residentsCache = users.map((u) => mapResident(u, flats));
    return residentsCache;
  }

  async function loadStaff(force) {
    if (!force && staffCache) return staffCache;
    const [admins, staff, guards] = await Promise.all([
      rawRequest("GET", "/admin/users?role=admin&limit=50"),
      rawRequest("GET", "/admin/users?role=staff&limit=50"),
      rawRequest("GET", "/admin/users?role=guard&limit=50"),
    ]);
    staffCache = [...unwrapList(admins), ...unwrapList(staff)].map((u) => ({
      id: String(u.id),
      name: u.name,
      role: u.role,
    }));
    return staffCache;
  }

  async function getFlats(force) {
    const flats = await loadRawFlats(force);
    return flats.map((f) => mapFlat(f));
  }

  async function getFlatByResidentMap() {
    const flats = await getFlats();
    const map = {};
    for (const f of flats) {
      if (f.ownerId) map[f.ownerId] = f;
      if (f.tenantId) map[f.tenantId] = f;
    }
    return map;
  }

  async function ensureBuilding(blockName) {
    const sid = societyId();
    const buildings = unwrapList(
      await rawRequest("GET", `/buildings/by-society/${sid}`),
    );
    let building = buildings.find(
      (b) => b.name.toLowerCase() === blockName.toLowerCase(),
    );
    if (!building) {
      const created = await rawRequest("POST", "/buildings", {
        name: blockName,
        society_id: parseInt(sid, 10),
        total_floors: 10,
      });
      building = { id: created.building_id, name: blockName };
      invalidateCache();
    }
    return building;
  }

  async function ensureChargeHead(name, amount) {
    const heads = unwrapList(
      await rawRequest("GET", "/accounting/charge-heads?limit=100"),
    );
    let head = heads.find((h) => h.name === name);
    if (!head) {
      const created = await rawRequest("POST", "/accounting/charge-heads", {
        name,
        charge_type: "fixed",
        amount: amount || 0,
      });
      head = { id: created.charge_head_id, name };
      invalidateCache();
    }
    return head;
  }

  function buildWeeklyVisitors(allVisitors) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const count = allVisitors.filter((v) => {
        const vd = v.visit_date || (v.created_at || "").slice(0, 10);
        return vd === ds;
      }).length;
      days.push({
        day: d.toLocaleDateString("en-IN", { weekday: "short" }),
        count,
      });
    }
    return days;
  }

  async function getDashboardStats() {
    const [data, allVisitors, allTickets, allInvoices] = await Promise.all([
      getCompleteSociety(),
      rawRequest("GET", "/visitors?limit=500").then(unwrapList),
      rawRequest("GET", "/helpdesk/tickets?limit=500").then(unwrapList),
      rawRequest("GET", "/accounting/invoices?limit=500").then(unwrapList),
    ]);

    const us = data.user_statistics || {};
    const vs = data.visitor_statistics || {};
    const hs = data.helpdesk_summary || {};
    const fin = data.financial_summary || {};
    const buildings = data.buildings || [];

    let totalFlats = 0;
    let occupiedFlats = 0;
    for (const b of buildings) {
      totalFlats += parseInt(b.total_flats, 10) || 0;
      occupiedFlats += parseInt(b.occupied_flats, 10) || 0;
    }

    const today = new Date().toISOString().slice(0, 10);
    const visitorsToday = allVisitors.filter((v) => {
      const vd = v.visit_date || (v.created_at || "").slice(0, 10);
      return vd === today;
    }).length;

    const pendingApprovals = allVisitors.filter((v) => v.status === "pending").length;
    const openComplaints =
      (parseInt(hs.open_tickets, 10) || 0) +
      (parseInt(hs.in_progress_tickets, 10) || 0);

    const categoryKeys = [
      "maintenance",
      "security",
      "general",
      "billing",
      "other",
    ];
    const complaintsByCategory = categoryKeys.map((category) => ({
      category,
      count: allTickets.filter((t) => t.category === category).length,
    }));

    return {
      totalResidents: parseInt(us.residents, 10) || 0,
      totalFlats,
      occupiedFlats,
      vacantFlats: Math.max(0, totalFlats - occupiedFlats),
      visitorsToday,
      pendingApprovals,
      openComplaints,
      totalRevenue: parseFloat(fin.paid_revenue) || 0,
      pendingRevenue: parseFloat(fin.pending_revenue) || 0,
      activeNotices: (data.recent_announcements || []).filter(
        (a) => a.is_draft == 0,
      ).length,
      weeklyVisitors: buildWeeklyVisitors(allVisitors),
      complaintsByCategory,
      billStats: {
        paid: allInvoices.filter((i) => i.status === "paid").length,
        unpaid: allInvoices.filter(
          (i) => i.status === "sent" || i.status === "draft",
        ).length,
        overdue: allInvoices.filter((i) => i.status === "overdue").length,
      },
    };
  }

  async function getRecentActivity() {
    const data = await getCompleteSociety();
    const flatByResident = await getFlatByResidentMap();

    const recentVisitors = (data.todays_visitors || [])
      .slice(0, 5)
      .map((v) => mapVisitor(v, flatByResident));

    const recentComplaints = (data.recent_tickets || [])
      .slice(0, 5)
      .map((t) => mapTicket(t));

    const recentNotices = (data.recent_announcements || [])
      .filter((a) => a.is_draft == 0)
      .slice(0, 3)
      .map(mapAnnouncement);

    return { recentVisitors, recentComplaints, recentNotices };
  }

  async function getResidents() {
    return loadResidents();
  }

  async function getVisitors() {
    const list = unwrapList(await rawRequest("GET", "/visitors?limit=500"));
    const flatByResident = await getFlatByResidentMap();
    return list.map((v) => mapVisitor(v, flatByResident));
  }

  async function getVisitorsToday() {
    const today = new Date().toISOString().slice(0, 10);
    const all = await getVisitors();
    return all.filter(
      (v) =>
        (v.visitDate && v.visitDate.startsWith(today)) ||
        (v.createdAt && v.createdAt.startsWith(today)),
    );
  }

  async function getComplaints(query) {
    const tickets = unwrapList(
      await rawRequest("GET", `/helpdesk/tickets?limit=500${query || ""}`),
    );
    const mapped = tickets.map(mapTicket);
    if (query && query.includes("residentId=")) {
      const rid = new URLSearchParams(query.replace(/^\?/, "")).get("residentId");
      if (rid) return mapped.filter((c) => c.residentId === String(rid));
    }
    return mapped;
  }

  async function getComplaintDetail(id) {
    const t = await rawRequest("GET", `/helpdesk/tickets/${id}`);
    return mapTicket(t);
  }

  async function getNotices() {
    const list = unwrapList(
      await rawRequest(
        "GET",
        "/communications/announcements?limit=100&is_draft=0",
      ),
    );
    return list.map(mapAnnouncement);
  }

  async function getBills(residentId) {
    const invoices = unwrapList(
      await rawRequest("GET", "/accounting/invoices?limit=500"),
    );
    let mapped = invoices.map(mapInvoice);
    if (residentId) {
      mapped = mapped.filter((b) => b.residentId === String(residentId));
    }
    return mapped;
  }

  async function getBillingStats() {
    const fin = (await getCompleteSociety()).financial_summary || {};
    const invoices = unwrapList(
      await rawRequest("GET", "/accounting/invoices?limit=500"),
    );
    return {
      totalRevenue: parseFloat(fin.paid_revenue) || 0,
      pendingRevenue: parseFloat(fin.pending_revenue) || 0,
      paid: invoices.filter((i) => i.status === "paid").length,
      unpaid: invoices.filter(
        (i) =>
          i.status === "sent" ||
          i.status === "draft" ||
          i.status === "partially_paid",
      ).length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      totalBills: invoices.length,
    };
  }

  async function resolveResidentForFlat(flatId) {
    const residents = await loadResidents();
    let resident = residents.find((r) => r.flatId === String(flatId));
    if (!resident) {
      const flats = await loadRawFlats();
      const flat = flats.find((f) => String(f.id) === String(flatId));
      if (flat?.owner_id) {
        resident = residents.find((r) => r.id === String(flat.owner_id));
      }
    }
    return resident;
  }

  async function postVisitor(body) {
    const resident = await resolveResidentForFlat(body.flatId);
    if (!resident) {
      throw new Error(
        "No resident linked to this flat. Assign an owner to the flat first.",
      );
    }
    const purpose = body.purpose || "Personal Visit";
    const visitorType =
      PURPOSE_TO_VISITOR_TYPE[purpose] || body.visitorType || "guest";

    const created = await rawRequest("POST", "/visitors", {
      name: body.name,
      phone: body.phone,
      purpose,
      resident_id: parseInt(resident.id, 10),
      visitor_type: visitorType,
      visit_date: new Date().toISOString().slice(0, 10),
      visit_time: new Date().toTimeString().slice(0, 8),
    });

    const visitorId = created.visitor_id;
    const targetStatus = body.isPreApproved ? "approved" : "pending";
    if (visitorId && targetStatus === "approved") {
      await rawRequest("PUT", `/visitors/${visitorId}/status`, {
        status: "approved",
      });
    }
    invalidateCache();
    return created;
  }

  async function handleRequest(method, endpoint, body) {
    const path = endpoint.split("?")[0];
    const query = endpoint.includes("?")
      ? endpoint.slice(endpoint.indexOf("?"))
      : "";

    if (method === "GET" && path === "/dashboard/stats") {
      return getDashboardStats();
    }
    if (method === "GET" && path === "/dashboard/recent-activity") {
      return getRecentActivity();
    }
    if (method === "GET" && path === "/residents") {
      return getResidents();
    }
    if (method === "GET" && path === "/residents/flats/all") {
      return getFlats();
    }
    if (method === "GET" && path === "/staff") {
      return loadStaff();
    }
    if (method === "GET" && path === "/visitors") {
      return getVisitors();
    }
    if (method === "GET" && path === "/visitors/today") {
      return getVisitorsToday();
    }
    if (method === "GET" && path === "/notices") {
      return getNotices();
    }
    if (method === "GET" && path === "/billing/stats") {
      return getBillingStats();
    }
    if (method === "GET" && path === "/billing") {
      const params = new URLSearchParams(query);
      return getBills(params.get("residentId"));
    }
    if (method === "GET" && /^\/complaints\/\d+$/.test(path)) {
      return getComplaintDetail(path.split("/")[2]);
    }
    if (method === "GET" && path.startsWith("/complaints")) {
      return getComplaints(query);
    }

    if (method === "POST" && path === "/visitors") {
      return postVisitor(body);
    }

    if (method === "PUT" && /^\/visitors\/\d+\/approve$/.test(path)) {
      const id = path.split("/")[2];
      invalidateCache();
      return rawRequest("PUT", `/visitors/${id}/status`, { status: "approved" });
    }
    if (method === "PUT" && /^\/visitors\/\d+\/reject$/.test(path)) {
      const id = path.split("/")[2];
      invalidateCache();
      return rawRequest("PUT", `/visitors/${id}/status`, { status: "rejected" });
    }
    if (method === "PUT" && /^\/visitors\/\d+\/exit$/.test(path)) {
      const id = path.split("/")[2];
      invalidateCache();
      return rawRequest("PUT", `/visitors/${id}/status`, { status: "exited" });
    }
    if (method === "DELETE" && /^\/visitors\/\d+$/.test(path)) {
      const id = path.split("/")[2];
      invalidateCache();
      return rawRequest("DELETE", `/visitors/${id}`);
    }

    if (method === "POST" && path === "/residents") {
      const created = await rawRequest("POST", "/admin/users", {
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: body.password || "Pass@123",
        role: "resident",
        status: "active",
      });
      invalidateCache();
      return { id: String(created.user_id) };
    }

    if (method === "PUT" && /^\/residents\/\d+$/.test(path)) {
      const id = path.split("/")[2];
      invalidateCache();
      return rawRequest("PUT", `/admin/users/${id}`, {
        name: body.name,
        email: body.email,
      });
    }

    if (method === "DELETE" && /^\/residents\/\d+$/.test(path)) {
      const id = path.split("/")[2];
      invalidateCache();
      return rawRequest("DELETE", `/admin/users/${id}`);
    }

    if (method === "POST" && path === "/residents/flats") {
      const building = await ensureBuilding(body.block || "Block A");
      const result = await rawRequest("POST", "/flats", {
        building_id: parseInt(building.id, 10),
        flats: [
          {
            flat_number: body.flatNo,
            floor_number: String(body.floor || 1),
            area_sqft: body.area || null,
          },
        ],
      });
      invalidateCache();
      const flat = (result.flats || [])[0];
      return { id: String(flat?.id || "") };
    }

    if (method === "PUT" && /^\/residents\/flats\/\d+$/.test(path)) {
      throw new Error(
        "Flat update is not available via API yet. Contact support or recreate the flat.",
      );
    }

    if (method === "DELETE" && /^\/residents\/flats\/\d+$/.test(path)) {
      throw new Error("Flat delete is not available via API yet.");
    }

    if (method === "POST" && path === "/complaints") {
      const apiCategory =
        UI_CATEGORY_TO_API[body.category] || body.category || "general";
      const payload = {
        title: body.title,
        description: body.description,
        category: apiCategory,
        priority: body.priority || "medium",
      };
      if (body.residentId) {
        payload.resident_id = parseInt(body.residentId, 10);
      }
      invalidateCache();
      return rawRequest("POST", "/helpdesk/tickets", payload);
    }

    if (method === "PUT" && /^\/complaints\/\d+$/.test(path)) {
      const id = path.split("/")[2];
      if (body.status) {
        invalidateCache();
        return rawRequest("PUT", `/helpdesk/tickets/${id}/status`, {
          status: body.status,
        });
      }
      if (body.assignedTo || body.assignedToId) {
        let assigneeId = body.assignedToId;
        if (!assigneeId && body.assignedTo) {
          const staff = await loadStaff();
          const match = staff.find(
            (u) =>
              u.name === body.assignedTo ||
              String(u.id) === String(body.assignedTo),
          );
          if (!match) {
            throw new Error("Select a valid team member to assign.");
          }
          assigneeId = match.id;
        }
        invalidateCache();
        return rawRequest("PUT", `/helpdesk/tickets/${id}/assign`, {
          assigned_to: parseInt(assigneeId, 10),
        });
      }
    }

    if (method === "POST" && /^\/complaints\/\d+\/comments$/.test(path)) {
      const id = path.split("/")[2];
      return rawRequest("POST", `/helpdesk/tickets/${id}/comments`, {
        comment: body.text,
      });
    }

    if (method === "DELETE" && /^\/complaints\/\d+$/.test(path)) {
      const id = path.split("/")[2];
      invalidateCache();
      return rawRequest("PUT", `/helpdesk/tickets/${id}/status`, {
        status: "closed",
      });
    }

    if (method === "POST" && path === "/notices") {
      invalidateCache();
      return rawRequest("POST", "/communications/announcements", {
        title: body.title,
        content: body.content,
        is_draft: 0,
      });
    }

    if (method === "DELETE" && /^\/notices\/\d+$/.test(path)) {
      throw new Error(
        "Published notices cannot be deleted from the portal. Edit content via a new notice if needed.",
      );
    }

    if (method === "POST" && /^\/notices\/\d+\/acknowledge$/.test(path)) {
      return { ok: true };
    }

    if (method === "POST" && path === "/billing/generate") {
      const flats = await loadRawFlats();
      const occupied = flats.filter((f) => f.is_occupied == 1);
      if (occupied.length === 0) {
        throw new Error("No occupied flats found. Add residents to flats first.");
      }
      const maintenanceHead = await ensureChargeHead(
        "Maintenance",
        body.maintenanceAmount || 2500,
      );
      const waterHead = await ensureChargeHead(
        "Water Charges",
        body.waterCharges || 500,
      );
      let generated = 0;
      const invoiceDate = body.month
        ? `${body.month}-01`
        : new Date().toISOString().slice(0, 10);
      const dueDate = body.month
        ? `${body.month}-10`
        : new Date().toISOString().slice(0, 10);

      for (const flat of occupied) {
        const items = [
          {
            charge_head_id: parseInt(maintenanceHead.id, 10),
            quantity: 1,
            unit_price: body.maintenanceAmount || 2500,
            gst_rate: 0,
          },
          {
            charge_head_id: parseInt(waterHead.id, 10),
            quantity: 1,
            unit_price: body.waterCharges || 500,
            gst_rate: 0,
          },
        ];
        if (body.parkingCharges > 0) {
          const parkingHead = await ensureChargeHead(
            "Parking",
            body.parkingCharges,
          );
          items.push({
            charge_head_id: parseInt(parkingHead.id, 10),
            quantity: 1,
            unit_price: body.parkingCharges,
            gst_rate: 0,
          });
        }
        await rawRequest("POST", "/accounting/invoices", {
          flat_id: parseInt(flat.id, 10),
          invoice_date: invoiceDate,
          due_date: dueDate,
          items,
        });
        generated++;
      }
      invalidateCache();
      return { generated };
    }

    if (method === "PUT" && /^\/billing\/\d+\/pay$/.test(path)) {
      const id = path.split("/")[2];
      const invoices = unwrapList(
        await rawRequest("GET", "/accounting/invoices?limit=500"),
      );
      const invoice = invoices.find((i) => String(i.id) === id);
      if (!invoice) throw new Error("Invoice not found");
      const payment = await rawRequest("POST", "/accounting/payments", {
        invoice_id: parseInt(id, 10),
        amount: parseFloat(invoice.total_amount),
        payment_method: mapPaymentMethod(body.paymentMethod),
        transaction_id: body.transactionId || null,
      });
      if (payment.payment_id) {
        await rawRequest(
          "PUT",
          `/accounting/payments/${payment.payment_id}/status`,
          { transaction_status: "success" },
        );
      }
      await rawRequest("PUT", `/accounting/invoices/${id}/status`, {
        status: "paid",
      });
      invalidateCache();
      return payment;
    }

    throw new Error(`Society API mapping not implemented: ${method} ${endpoint}`);
  }

  function normalizeUser(user) {
    if (!user) return user;
    const normalized = { ...user };
    normalized.id = String(user.id ?? user.uid ?? "");
    normalized.uid = user.uid ?? user.id;
    if (user.society) {
      normalized.societyName = user.society.name;
      normalized.societyId = user.society.id;
      normalized.society_id = user.society.id;
    } else {
      normalized.societyName = user.societyName || user.society_name || "";
      normalized.society_id = user.society_id ?? user.societyId;
    }
    return normalized;
  }

  return {
    isLegacyEndpoint,
    handleRequest,
    normalizeUser,
    invalidateCache,
    UI_CATEGORY_TO_API,
  };
})();

window.SocietyBridge = SocietyBridge;
