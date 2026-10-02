<?php
require '../config/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$id = (int) ($body["id"] ?? 0);
$status = $body["status"] ?? "";

if (!in_array($status, ["active", "suspended"], true)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Status must be 'active' or 'suspended'."]);
  exit;
}

$stmt = $pdo->prepare("SELECT name, role FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch();

if (!$user) {
  http_response_code(404);
  echo json_encode(["ok" => false, "error" => "User not found."]);
  exit;
}

$pdo->prepare("UPDATE users SET status = ? WHERE id = ?")->execute([$status, $id]);

$verb = $status === "suspended" ? "User suspended" : "User reactivated";
logActivity($pdo, $verb, "{$user['name']} ({$user['role']})");

echo json_encode(["ok" => true]);