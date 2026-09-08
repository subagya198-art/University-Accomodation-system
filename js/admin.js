const admin = requireAuth("admin");
// requireAuth already redirects to login.html if this isn't a logged-in admin.

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function renderPending() {
  const pending = getAllListingsForAdmin().filter((l) => l.status === "pending");
  document.getElementById("pending-count").textContent = pending.length;
  const el = document.getElementById("pending-list");

  if (pending.length === 0) {
    el.innerHTML = `<div class="empty-state">Nothing waiting for review right now.</div>`;
    return;
  }

  el.innerHTML = pending
    .map(
      (l) => `
    <div class="listing-row">
      <span class="swatch" style="background: hsl(${l.hue} 45% 55%)"></span>
      <div class="info">
        <div class="title-line">
          <strong>${l.title}</strong>
          <span class="status-pill status-pending">pending</span>
        </div>
        <div class="meta">${l.location} · ${l.type} · Rs ${Number(l.price).toLocaleString()}/mo · listed by ${l.provider.name} · ${l.code}</div>
      </div>
      <div class="actions">
        <button class="icon-btn" data-approve="${l.id}">Approve</button>
        <button class="icon-btn danger" data-reject="${l.id}">Reject</button>
      </div>
    </div>`
    )
    .join("");

  el.querySelectorAll("[data-approve]").forEach((btn) =>
    btn.addEventListener("click", () => {
      approveListing(Number(btn.dataset.approve));
      renderAll();
    })
  );
  el.querySelectorAll("[data-reject]").forEach((btn) =>
    btn.addEventListener("click", () => {
      rejectListing(Number(btn.dataset.reject));
      renderAll();
    })
  );
}

function renderAllListings() {
  const listings = getAllListingsForAdmin();
  document.getElementById("all-listings-count").textContent = listings.length;
  const el = document.getElementById("all-listings-list");

  if (listings.length === 0) {
    el.innerHTML = `<div class="empty-state">No listings in the system yet.</div>`;
    return;
  }

  el.innerHTML = listings
    .map(
      (l) => `
    <div class="listing-row">
      <span class="swatch" style="background: hsl(${l.hue} 45% 55%)"></span>
      <div class="info">
        <div class="title-line">
          <strong>${l.title}</strong>
          <span class="status-pill status-${l.status}">${l.status}</span>
        </div>
        <div class="meta">${l.location} · ${l.provider.name} · ${l.code}</div>
      </div>
      <div class="price">Rs ${Number(l.price).toLocaleString()}<span style="font-size:11px; color:var(--ink-soft);"> /mo</span></div>
    </div>`
    )
    .join("");
}

function renderUsers() {
  const users = getAllUsers();
  document.getElementById("user-count").textContent = users.length;
  const el = document.getElementById("user-list");

  el.innerHTML = users
    .map(
      (u) => `
    <div class="user-row">
      <div class="info">
        <div class="name-line">
          <strong>${u.name}</strong>
          <span class="role-badge">${u.role}</span>
          <span class="status-pill status-${u.status === "active" ? "approved" : "rejected"}">${u.status}</span>
        </div>
        <div class="email">${u.email}</div>
      </div>
      ${
        u.id === admin.id
          ? `<span class="meta" style="font-size:12px; color:var(--ink-soft);">(you)</span>`
          : `<div class="actions">
              <button class="icon-btn ${u.status === "active" ? "danger" : ""}" data-toggle-user="${u.id}" data-current="${u.status}">
                ${u.status === "active" ? "Suspend" : "Reactivate"}
              </button>
            </div>`
      }
    </div>`
    )
    .join("");

  el.querySelectorAll("[data-toggle-user]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.toggleUser);
      const next = btn.dataset.current === "active" ? "suspended" : "active";
      setUserStatus(id, next);
      renderAll();
    })
  );
}

function renderActivity() {
  const log = getActivityLog();
  document.getElementById("activity-count").textContent = log.length;
  const el = document.getElementById("activity-feed");

  if (log.length === 0) {
    el.innerHTML = `<div class="empty-state">No activity recorded yet.</div>`;
    return;
  }

  el.innerHTML = log
    .map(
      (entry) => `
    <div class="activity-row">
      <span class="time">${timeAgo(entry.at)}</span>
      <span><span class="action">${entry.action}</span> — <span class="detail">${entry.detail}</span></span>
    </div>`
    )
    .join("");
}

function renderAll() {
  renderPending();
  renderAllListings();
  renderUsers();
  renderActivity();
}

renderAll();