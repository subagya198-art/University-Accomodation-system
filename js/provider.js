const provider = requireAuth("provider");
// requireAuth already redirects to login.html if this isn't a logged-in provider.

const listingsList = document.getElementById("listings-list");
const formPanelSlot = document.getElementById("form-panel-slot");
const addBtn = document.getElementById("add-listing-btn");

let editingId = null; // null = "add" mode, otherwise the listing being edited

function renderList() {
  const listings = provider ? getProviderListings(provider.id) : [];

  if (listings.length === 0) {
    listingsList.innerHTML = `
      <div class="empty-state">
        You haven't added any listings yet. Click "+ Add new listing" to create your first one.
      </div>`;
    return;
  }

  listingsList.innerHTML = listings
    .map(
      (l) => `
    <div class="listing-row">
      <span class="swatch" style="background: hsl(${l.hue} 45% 55%)"></span>
      <div class="info">
        <div class="title-line">
          <strong>${l.title}</strong>
          <span class="status-pill status-${l.status}">${l.status}</span>
        </div>
        <div class="meta">${l.location} · ${l.type} · ${l.occupancy} · ${l.code}</div>
      </div>
      <div class="price">Rs ${Number(l.price).toLocaleString()}<span style="font-size:11px; color:var(--ink-soft);"> /mo</span></div>
      <div class="actions">
        <button class="icon-btn" data-edit="${l.id}">Edit</button>
        <button class="icon-btn danger" data-delete="${l.id}">Delete</button>
      </div>
    </div>`
    )
    .join("");

  listingsList.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openForm(Number(btn.dataset.edit)));
  });

  listingsList.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.delete);
      if (confirm("Delete this listing? This can't be undone.")) {
        deleteListing(id, provider.id);
        renderList();
      }
    });
  });
}

function amenityCheckboxesHtml(selected = []) {
  return AMENITY_LIST.map(
    (a) => `
    <label>
      <input type="checkbox" value="${a}" ${selected.includes(a) ? "checked" : ""} />
      <span>${a}</span>
    </label>`
  ).join("");
}

function openForm(id = null) {
  editingId = id;
  const listing = id ? getProviderListings(provider.id).find((l) => l.id === id) : null;

  formPanelSlot.innerHTML = `
    <div class="form-panel">
      <h2>${listing ? "Edit listing" : "Add new listing"}</h2>
      <form id="listing-form">
        <div class="form-grid">
          <div class="field span-2">
            <label for="f-title">Title</label>
            <input type="text" id="f-title" required value="${listing ? listing.title : ""}" />
          </div>

          <div class="field span-2">
            <label for="f-location">Location</label>
            <input type="text" id="f-location" required value="${listing ? listing.location : ""}" placeholder="e.g. Sammanthurai Road, Oluvil" />
          </div>

          <div class="field">
            <label for="f-price">Monthly rent (Rs)</label>
            <input type="number" id="f-price" required min="0" value="${listing ? listing.price : ""}" />
          </div>

          <div class="field">
            <label for="f-distance">Distance from campus (km)</label>
            <input type="number" id="f-distance" step="0.1" min="0" value="${listing ? listing.distanceKm : ""}" />
          </div>

          <div class="field">
            <label for="f-type">Room type</label>
            <select id="f-type">
              <option value="Annex" ${listing?.type === "Annex" ? "selected" : ""}>Annex</option>
              <option value="Boarding House" ${listing?.type === "Boarding House" ? "selected" : ""}>Boarding House</option>
              <option value="Apartment" ${listing?.type === "Apartment" ? "selected" : ""}>Apartment</option>
              <option value="Hostel" ${listing?.type === "Hostel" ? "selected" : ""}>Hostel</option>
            </select>
          </div>

          <div class="field">
            <label for="f-occupancy">Occupancy</label>
            <input type="text" id="f-occupancy" required value="${listing ? listing.occupancy : ""}" placeholder="e.g. Single, Shared (2)" />
          </div>

          <div class="field span-2">
            <label for="f-description">Description</label>
            <textarea id="f-description" rows="3" required>${listing ? listing.description : ""}</textarea>
          </div>

          <div class="field span-2">
            <label class="group-label">Amenities</label>
            <div class="amenity-check-grid" id="f-amenities">
              ${amenityCheckboxesHtml(listing ? listing.amenities : [])}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn">${listing ? "Save changes" : "Submit for approval"}</button>
          <button type="button" class="icon-btn" id="cancel-form-btn">Cancel</button>
        </div>
      </form>
    </div>`;

  document.getElementById("cancel-form-btn").addEventListener("click", closeForm);
  document.getElementById("listing-form").addEventListener("submit", handleSubmit);
  formPanelSlot.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeForm() {
  editingId = null;
  formPanelSlot.innerHTML = "";
}

function handleSubmit(e) {
  e.preventDefault();

  const amenities = Array.from(
    document.querySelectorAll("#f-amenities input:checked")
  ).map((el) => el.value);

  const payload = {
    title: document.getElementById("f-title").value.trim(),
    location: document.getElementById("f-location").value.trim(),
    price: Number(document.getElementById("f-price").value),
    distanceKm: Number(document.getElementById("f-distance").value) || 0,
    type: document.getElementById("f-type").value,
    occupancy: document.getElementById("f-occupancy").value.trim(),
    description: document.getElementById("f-description").value.trim(),
    amenities,
  };

  if (editingId) {
    updateListing(editingId, provider.id, payload);
  } else {
    createListing(provider.id, provider.name, provider.email, payload);
  }

  closeForm();
  renderList();
}

addBtn.addEventListener("click", () => openForm(null));

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function renderInquiries() {
  const inquiries = getInquiriesForProvider(provider.id);
  const el = document.getElementById("inquiries-list");

  if (inquiries.length === 0) {
    el.innerHTML = `<div class="empty-state">No inquiries yet.</div>`;
    return;
  }

  el.innerHTML = inquiries
    .map(
      (i) => `
    <div class="inquiry-thread">
      <div class="thread-top">
        <a href="listing.html?id=${i.listingId}" class="thread-listing">${i.listingTitle} <span style="color:var(--ink-soft); font-weight:400; font-size:13px;">· ${i.listingCode}</span></a>
        <span class="thread-date">${fmtDate(i.submittedAt)}</span>
      </div>
      <div class="bubble bubble-sent">
        <div class="who">${i.name} (${i.email})</div>
        ${i.message}
      </div>
      ${
        i.reply
          ? `<div class="bubble bubble-reply">
              <div class="who">You replied</div>
              ${i.reply.message}
            </div>`
          : `<form class="reply-form" data-reply-form="${i.id}">
              <input type="text" placeholder="Write a reply…" required />
              <button type="submit" class="btn">Reply</button>
            </form>`
      }
    </div>`
    )
    .join("");

  el.querySelectorAll("[data-reply-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      replyToInquiry(Number(form.dataset.replyForm), provider.id, input.value.trim());
      renderInquiries();
    });
  });
}

renderList();
renderInquiries();