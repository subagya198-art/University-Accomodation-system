const resultsGrid = document.getElementById("results-grid");
const resultsCount = document.getElementById("results-count");
const keywordInput = document.getElementById("keyword");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const roomTypeSelect = document.getElementById("room-type");
const amenityListEl = document.getElementById("amenity-list");

// Build amenity checkboxes from the shared amenity list
AMENITY_LIST.forEach((amenity) => {
  const id = `amenity-${amenity.replace(/\s+/g, "-").toLowerCase()}`;
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${amenity}" id="${id}" /> ${amenity}`;
  amenityListEl.appendChild(label);
});

function currentFilters() {
  const checkedAmenities = Array.from(
    amenityListEl.querySelectorAll("input:checked")
  ).map((el) => el.value);

  return {
    keyword: keywordInput.value,
    minPrice: minPriceInput.value ? Number(minPriceInput.value) : 0,
    maxPrice: maxPriceInput.value ? Number(maxPriceInput.value) : Infinity,
    type: roomTypeSelect.value,
    amenities: checkedAmenities,
  };
}

function renderResults() {
  const results = searchListings(currentFilters()).sort(
    (a, b) => a.distanceKm - b.distanceKm
  );

  resultsCount.textContent = `${results.length} listing${results.length === 1 ? "" : "s"}`;

  if (results.length === 0) {
    resultsGrid.innerHTML = `<div class="empty-state">No listings match those filters yet. Try widening your price range or clearing a filter.</div>`;
    return;
  }

  resultsGrid.innerHTML = results
    .map(
      (l) => `
    <a class="tag-card" href="listing.html?id=${l.id}">
      <div class="tag-stub">
        <span class="tag-swatch" style="background: hsl(${l.hue} 45% 55%)"></span>
        <span class="tag-code">${l.code}</span>
      </div>
      <div class="tag-body">
        <p class="tag-title">${l.title}</p>
        <p class="tag-location">${l.location} · ${l.distanceKm} km from campus</p>
        <div class="tag-meta-row">
          <span class="tag-price">Rs ${l.price.toLocaleString()}<span> /mo</span></span>
          <span class="tag-pill">${l.occupancy}</span>
        </div>
      </div>
    </a>`
    )
    .join("");
}

document.getElementById("search-btn").addEventListener("click", renderResults);
keywordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") renderResults();
});
minPriceInput.addEventListener("input", renderResults);
maxPriceInput.addEventListener("input", renderResults);
roomTypeSelect.addEventListener("change", renderResults);
amenityListEl.addEventListener("change", renderResults);

document.getElementById("reset-btn").addEventListener("click", () => {
  keywordInput.value = "";
  minPriceInput.value = "";
  maxPriceInput.value = "";
  roomTypeSelect.value = "";
  amenityListEl
    .querySelectorAll("input")
    .forEach((el) => (el.checked = false));
  renderResults();
});

renderResults();