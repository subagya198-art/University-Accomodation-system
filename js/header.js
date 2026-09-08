/**
 * Shared header behaviour. Include this after auth.js on every page.
 * Expects the header markup to contain:
 *   <nav class="site-nav" id="site-nav">...</nav>
 *   <span id="auth-slot"></span>
 */
(function renderHeader() {
  const user = getCurrentUser();
  const authSlot = document.getElementById("auth-slot");
  const nav = document.getElementById("site-nav");

  if (!authSlot || !nav) return;

  if (!user) {
    authSlot.innerHTML = `<a href="login.html" class="role-pill">Log in</a>`;
  } else {
    authSlot.innerHTML = `
      <span class="role-pill" id="user-pill">
        ${user.name.split(" ")[0]} · ${user.role}
        <a href="#" id="logout-link" style="color:inherit; margin-left:6px; text-decoration:underline;">Logout</a>
      </span>`;

    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
      window.location.href = "index.html";
    });
  }

  // Role-aware nav: only show links relevant to the logged-in role.
  // Links stay visible-but-inert (existing "coming soon" pages) for
  // roles that don't have that page yet.
  const inquiriesLink = nav.querySelector('[data-nav="inquiries"]');
  const providerLink = nav.querySelector('[data-nav="provider"]');
  const adminLink = nav.querySelector('[data-nav="admin"]');

  if (inquiriesLink) inquiriesLink.style.display = user && user.role === "student" ? "" : "none";
  if (providerLink) providerLink.style.display = user && user.role === "provider" ? "" : "none";
  if (adminLink) adminLink.style.display = user && user.role === "admin" ? "" : "none";
})();