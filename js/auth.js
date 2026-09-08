/**
 * Mock auth layer for BAMS.
 *
 * Mirrors the sequence diagram's POST /register and POST /login endpoints.
 * Users are stored in localStorage under "bams_users" and the active
 * session under "bams_session". When the PHP backend is ready, these
 * functions get replaced with fetch() calls — pages that use them
 * (register.html, login.html, header.js) won't need to change.
 *
 * NOTE: passwords are stored in plain text here on purpose — this is a
 * frontend-only mock. The real backend must hash passwords with PHP's
 * password_hash() before storing anything in MySQL.
 */

const USERS_KEY = "bams_users";
const SESSION_KEY = "bams_session";

function loadUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Seed one admin account the first time the app runs, so the admin
// panel (built later) has something to log in with.
(function seedAdmin() {
  const users = loadUsers();
  if (!users.some((u) => u.role === "admin")) {
    users.push({
      id: 1,
      name: "System Admin",
      email: "admin@bams.lk",
      password: "admin123",
      role: "admin",
      status: "active",
    });
    saveUsers(users);
  }
})();

/** POST /register { name, email, password, role } */
function registerUser({ name, email, password, role }) {
  const users = loadUsers();

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role, // "student" | "provider"
    status: "active",
  };

  users.push(newUser);
  saveUsers(users);
  setSession(newUser);
  logActivity("Account registered", `${name} (${role})`);

  return { ok: true, user: publicUser(newUser) };
}

/** POST /login { email, password } */
function loginUser({ email, password }) {
  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return { ok: false, error: "Incorrect email or password." };
  }

  if (user.status === "suspended") {
    return { ok: false, error: "This account has been suspended by an administrator." };
  }

  setSession(user);
  logActivity("User logged in", `${user.name} (${user.role})`);
  return { ok: true, user: publicUser(user) };
}

/** GET /admin/users — every registered user, no passwords. */
function getAllUsers() {
  return loadUsers()
    .map(publicUserWithStatus)
    .sort((a, b) => b.id - a.id);
}

/** PATCH /admin/users/:id { status } */
function setUserStatus(id, status) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === Number(id));
  if (idx === -1) return { ok: false };

  users[idx].status = status;
  saveUsers(users);
  logActivity(
    status === "suspended" ? "User suspended" : "User reactivated",
    `${users[idx].name} (${users[idx].role})`
  );
  return { ok: true };
}

function publicUserWithStatus(user) {
  const { id, name, email, role, status } = user;
  return { id, name, email, role, status: status || "active" };
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser(user)));
}

function publicUser(user) {
  const { id, name, email, role } = user;
  return { id, name, email, role };
}

/** Returns the logged-in user, or null. */
function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

/** Redirect to login.html if nobody is logged in, optionally restricted to a role. */
function requireAuth(role = null) {
  const user = getCurrentUser();
  if (!user || (role && user.role !== role)) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}