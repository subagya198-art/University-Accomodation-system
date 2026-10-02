<?php
require '../config/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$id = (int) ($body["id"] ?? 0);
$providerId = (int) ($body["providerId"] ?? 0);

$stmt = $pdo->prepare("SELECT provider_id, title FROM listings WHERE id = ?");
$stmt->execute([$id]);
$existing = $stmt->fetch();

if (!$existing || (int) $existing["provider_id"] !== $providerId) {
  http_response_code(403);
  echo json_encode(["ok" => false, "error" => "Listing not found or not yours to delete."]);
  exit;
}

$pdo->prepare("DELETE FROM listings WHERE id = ?")->execute([$id]);
logActivity($pdo, "Listing deleted", "{$existing['title']} (#$id)");

echo json_encode(["ok" => true]);