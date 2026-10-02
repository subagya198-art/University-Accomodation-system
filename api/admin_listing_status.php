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

if (!in_array($status, ["approved", "rejected"], true)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Status must be 'approved' or 'rejected'."]);
  exit;
}

$stmt = $pdo->prepare("SELECT title, code FROM listings WHERE id = ?");
$stmt->execute([$id]);
$listing = $stmt->fetch();

if (!$listing) {
  http_response_code(404);
  echo json_encode(["ok" => false, "error" => "Listing not found."]);
  exit;
}

$pdo->prepare("UPDATE listings SET status = ? WHERE id = ?")->execute([$status, $id]);

$verb = $status === "approved" ? "Listing approved" : "Listing rejected";
logActivity($pdo, $verb, "{$listing['title']} ({$listing['code']})");

echo json_encode(["ok" => true]);