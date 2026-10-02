<?php
require '../config/db.php';
require 'inquiries_helpers.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$id = (int) ($body["id"] ?? 0);
$providerId = (int) ($body["providerId"] ?? 0);
$message = trim($body["message"] ?? "");

if ($message === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Reply message is required."]);
  exit;
}

// Confirm this inquiry belongs to one of this provider's listings.
$stmt = $pdo->prepare(INQUIRY_SELECT . " WHERE i.id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row || (int) $row["provider_id"] !== $providerId) {
  http_response_code(403);
  echo json_encode(["ok" => false, "error" => "Inquiry not found or not yours to reply to."]);
  exit;
}

$pdo->prepare("UPDATE inquiries SET reply_message = ?, reply_at = NOW() WHERE id = ?")
  ->execute([$message, $id]);

logActivity($pdo, "Provider replied", "{$row['provider_name']} → {$row['name']}");

$stmt = $pdo->prepare(INQUIRY_SELECT . " WHERE i.id = ?");
$stmt->execute([$id]);
echo json_encode(["ok" => true, "inquiry" => formatInquiry($stmt->fetch())]);