/**
 * Mock data layer for BAMS.
 *
 * This file stands in for the server. Every function here mirrors an
 * endpoint from the sequence diagram (GET /search, GET /listings/:id,
 * POST /inquiries). When the PHP backend is ready, swap the bodies of
 * these functions for fetch() calls — the pages that call them don't
 * need to change.
 */

/**
 * Shared activity log, used by the admin panel's "Monitor system activity"
 * view. Any part of the app can call logActivity() to record an event.
 */
const ACTIVITY_KEY = "bams_activity";

function logActivity(action, detail) {
  const log = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
  log.unshift({ action, detail, at: new Date().toISOString() });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log.slice(0, 50)));
}

function getActivityLog() {
  return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
}

const LISTINGS = [
  {
    id: 1,
    code: "SEU-014",
    title: "Palm Grove Annex — Girls Only",
    location: "Sammanthurai Road, Oluvil",
    distanceKm: 0.6,
    price: 8500,
    type: "Annex",
    occupancy: "Shared (2)",
    amenities: ["WiFi", "Water", "Furnished", "Kitchen access"],
    status: "approved",
    hue: 168,
    description:
      "Quiet annex five minutes' walk from the main gate. Two furnished rooms share a kitchen and bathroom. Landlady lives on the same property.",
    provider: { name: "Mrs. K. Fareena", contact: "076 221 4409" },
  },
  {
    id: 2,
    code: "SEU-021",
    title: "University View Boarding House",
    location: "Central Road, Oluvil",
    distanceKm: 1.2,
    price: 6000,
    type: "Boarding House",
    occupancy: "Single",
    amenities: ["WiFi", "Water", "Electricity included"],
    status: "approved",
    hue: 24,
    description:
      "Single rooms in a two-storey boarding house. Common bathroom on each floor. Popular with first-year students for the price point.",
    provider: { name: "Mr. S. Rameez", contact: "077 845 1290" },
  },
  {
    id: 3,
    code: "SEU-007",
    title: "Green Corner Residence",
    location: "Kalmunai Road, Oluvil",
    distanceKm: 2.4,
    price: 11000,
    type: "Apartment",
    occupancy: "Shared (3)",
    amenities: ["WiFi", "Water", "Furnished", "Kitchen access", "Parking"],
    status: "approved",
    hue: 200,
    description:
      "Three-bedroom apartment, fully furnished, shared between three students. Includes a small garden and covered bike parking.",
    provider: { name: "Mr. A. Niroshan", contact: "071 302 7765" },
  },
  {
    id: 4,
    code: "SEU-033",
    title: "Beach Road Annex",
    location: "Beach Road, Oluvil",
    distanceKm: 3.1,
    price: 7500,
    type: "Annex",
    occupancy: "Single",
    amenities: ["WiFi", "Water"],
    status: "approved",
    hue: 46,
    description:
      "Standalone annex room a short tuk ride from campus. Basic but well maintained, with a private entrance.",
    provider: { name: "Mrs. N. Thevi", contact: "075 519 8823" },
  },
  {
    id: 5,
    code: "SEU-045",
    title: "Campus Gate Boarding",
    location: "Main Gate Road, Oluvil",
    distanceKm: 0.3,
    price: 9500,
    type: "Boarding House",
    occupancy: "Shared (2)",
    amenities: ["WiFi", "Water", "Furnished", "Study table"],
    status: "approved",
    hue: 340,
    description:
      "Closest listing to the main gate — you can see the campus wall from the balcony. Rooms are shared, furnished with study tables.",
    provider: { name: "Mr. F. Rizwan", contact: "076 664 2201" },
  },
  {
    id: 6,
    code: "SEU-052",
    title: "Lakeview Boys Hostel",
    location: "Tank Road, Oluvil",
    distanceKm: 1.8,
    price: 6500,
    type: "Hostel",
    occupancy: "Shared (4)",
    amenities: ["Water", "Electricity included"],
    status: "approved",
    hue: 210,
    description:
      "Budget hostel-style boarding for four. Communal dining area. A ten-minute walk from the Faculty of Management and Commerce.",
    provider: { name: "Mr. J. Karthik", contact: "070 118 3345" },
  },
  {
    id: 7,
    code: "SEU-061",
    title: "Rose Villa Annex — Girls Only",
    location: "Sammanthurai Road, Oluvil",
    distanceKm: 0.8,
    price: 10000,
    type: "Annex",
    occupancy: "Single",
    amenities: ["WiFi", "Water", "Furnished", "Kitchen access", "Parking"],
    status: "approved",
    hue: 320,
    description:
      "Private single room in a quiet annex with attached bathroom. Landlady provides breakfast on request for an extra fee.",
    provider: { name: "Mrs. R. Sivagami", contact: "077 290 4471" },
  },
  {
    id: 8,
    code: "SEU-058",
    title: "Junction Boarding House",
    location: "Kalmunai Road, Oluvil",
    distanceKm: 2.0,
    price: 7000,
    type: "Boarding House",
    occupancy: "Shared (2)",
    amenities: ["WiFi", "Water"],
    status: "approved",
    hue: 90,
    description:
      "Simple, affordable shared rooms close to the junction shops and bus stop. Frequently booked out — enquire early.",
    provider: { name: "Mr. T. Selvam", contact: "078 663 5590" },
  },
];

const AMENITY_LIST = [
  "WiFi",
  "Water",
  "Furnished",
  "Kitchen access",
  "Parking",
  "Electricity included",
  "Study table",
];

// Listings created/edited by providers live in localStorage, separate
// from the seed LISTINGS array above, and get merged in at read time.
const LISTINGS_KEY = "bams_listings";
const HUES = [168, 24, 200, 46, 340, 210, 320, 90, 280, 12];

function loadProviderListings() {
  return JSON.parse(localStorage.getItem(LISTINGS_KEY) || "[]");
}

function saveProviderListings(listings) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

/** All listings: seed data + anything providers have created in this browser. */
function allListings() {
  return [...LISTINGS, ...loadProviderListings()];
}

/** GET /search?location=&min_price=&max_price=&type=&amenities= */
function searchListings(filters = {}) {
  const {
    keyword = "",
    minPrice = 0,
    maxPrice = Infinity,
    type = "",
    amenities = [],
  } = filters;

  return allListings()
    .filter((l) => l.status === "approved")
    .filter((l) => {
      if (!keyword.trim()) return true;
      const hay = `${l.title} ${l.location}`.toLowerCase();
      return hay.includes(keyword.trim().toLowerCase());
    })
    .filter((l) => l.price >= minPrice && l.price <= maxPrice)
    .filter((l) => !type || l.type === type)
    .filter((l) => amenities.every((a) => l.amenities.includes(a)));
}

/** GET /listings/:id */
function getListing(id) {
  return allListings().find((l) => l.id === Number(id)) || null;
}

/** GET /provider/listings — all listings owned by this provider, any status. */
function getProviderListings(providerId) {
  return loadProviderListings()
    .filter((l) => l.providerId === providerId)
    .sort((a, b) => b.id - a.id);
}

/** POST /listings — provider creates a new listing (status starts "pending"). */
function createListing(providerId, providerName, providerContact, payload) {
  const listings = loadProviderListings();
  const nextNum = 100 + listings.length;

  const newListing = {
    id: Date.now(),
    code: `SEU-${nextNum}`,
    status: "pending",
    providerId,
    hue: HUES[listings.length % HUES.length],
    provider: { name: providerName, contact: providerContact },
    ...payload, // title, location, distanceKm, price, type, occupancy, amenities, description
  };

  listings.push(newListing);
  saveProviderListings(listings);
  logActivity("Listing submitted", `${payload.title} (${newListing.code}) by ${providerName}`);
  return newListing;
}

/** GET /admin/listings — every listing regardless of status, pending first. */
function getAllListingsForAdmin() {
  const order = { pending: 0, approved: 1, rejected: 2 };
  return allListings()
    .slice()
    .sort((a, b) => order[a.status] - order[b.status] || b.id - a.id);
}

/** PATCH /listings/:id { status: "approved" } */
function approveListing(id) {
  const listings = loadProviderListings();
  const idx = listings.findIndex((l) => l.id === Number(id));
  if (idx === -1) return { ok: false };

  listings[idx].status = "approved";
  saveProviderListings(listings);
  logActivity("Listing approved", `${listings[idx].title} (${listings[idx].code})`);
  return { ok: true };
}

/** PATCH /listings/:id { status: "rejected" } */
function rejectListing(id) {
  const listings = loadProviderListings();
  const idx = listings.findIndex((l) => l.id === Number(id));
  if (idx === -1) return { ok: false };

  listings[idx].status = "rejected";
  saveProviderListings(listings);
  logActivity("Listing rejected", `${listings[idx].title} (${listings[idx].code})`);
  return { ok: true };
}

/** PUT /listings/:id — provider edits their own listing. */
function updateListing(id, providerId, payload) {
  const listings = loadProviderListings();
  const idx = listings.findIndex((l) => l.id === Number(id));

  if (idx === -1 || listings[idx].providerId !== providerId) {
    return { ok: false, error: "Listing not found or not yours to edit." };
  }

  listings[idx] = { ...listings[idx], ...payload };
  saveProviderListings(listings);
  return { ok: true, listing: listings[idx] };
}

/** DELETE /listings/:id — provider deletes their own listing. */
function deleteListing(id, providerId) {
  const listings = loadProviderListings();
  const target = listings.find((l) => l.id === Number(id));

  if (!target || target.providerId !== providerId) {
    return { ok: false, error: "Listing not found or not yours to delete." };
  }

  saveProviderListings(listings.filter((l) => l.id !== Number(id)));
  return { ok: true };
}

/** POST /inquiries { listing_id, student_id, name, email, message } */
function submitInquiry(listingId, payload) {
  const key = "bams_inquiries";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  const listing = getListing(listingId);

  existing.push({
    id: Date.now(),
    listingId: Number(listingId),
    listingTitle: listing ? listing.title : "Listing",
    listingCode: listing ? listing.code : "",
    providerId: listing ? listing.providerId ?? null : null,
    providerName: listing ? listing.provider.name : "",
    ...payload, // studentId, name, email, message
    reply: null,
    submittedAt: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(existing));
  logActivity("Inquiry sent", `${payload.name} → listing #${listingId}`);
  return { ok: true };
}

/** GET /students/:id/inquiries */
function getInquiriesForStudent(studentId) {
  const all = JSON.parse(localStorage.getItem("bams_inquiries") || "[]");
  return all
    .filter((i) => i.studentId === studentId)
    .sort((a, b) => b.id - a.id);
}

/** GET /provider/inquiries — inquiries sent about this provider's listings. */
function getInquiriesForProvider(providerId) {
  const all = JSON.parse(localStorage.getItem("bams_inquiries") || "[]");
  return all
    .filter((i) => i.providerId === providerId)
    .sort((a, b) => b.id - a.id);
}

/** POST /inquiries/:id/reply { message } */
function replyToInquiry(inquiryId, providerId, message) {
  const key = "bams_inquiries";
  const all = JSON.parse(localStorage.getItem(key) || "[]");
  const idx = all.findIndex((i) => i.id === Number(inquiryId));

  if (idx === -1 || all[idx].providerId !== providerId) {
    return { ok: false, error: "Inquiry not found." };
  }

  all[idx].reply = { message, at: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(all));
  logActivity("Provider replied", `${all[idx].providerName} → ${all[idx].name}`);
  return { ok: true };
}