<?php
require '../config/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$email = trim($body["email"] ?? "");
$password = $body["password"] ?? "";

if ($email === "" || $password === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Email and password are required."]);
  exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password"])) {
  http_response_code(401);
  echo json_encode(["ok" => false, "error" => "Incorrect email or password."]);
  exit;
}

if ($user["status"] === "suspended") {
  http_response_code(403);
  echo json_encode(["ok" => false, "error" => "This account has been suspended by an administrator."]);
  exit;
}

logActivity($pdo, "User logged in", "{$user['name']} ({$user['role']})");

echo json_encode([
  "ok" => true,
  "user" => [
    "id" => (int) $user["id"],
    "name" => $user["name"],
    "email" => $user["email"],
    "role" => $user["role"],
  ],
]);