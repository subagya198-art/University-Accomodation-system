<?php
require '../config/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$name = trim($body["name"] ?? "");
$email = trim($body["email"] ?? "");
$password = $body["password"] ?? "";
$role = $body["role"] ?? "";

if ($name === "" || $email === "" || $password === "" || !in_array($role, ["student", "provider"], true)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Missing or invalid fields."]);
  exit;
}

// Check for an existing account with this email.
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
  http_response_code(409);
  echo json_encode(["ok" => false, "error" => "An account with that email already exists."]);
  exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
  "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'active')"
);
$stmt->execute([$name, $email, $hashed, $role]);

$userId = $pdo->lastInsertId();
logActivity($pdo, "Account registered", "$name ($role)");

echo json_encode([
  "ok" => true,
  "user" => [
    "id" => (int) $userId,
    "name" => $name,
    "email" => $email,
    "role" => $role,
  ],
]);