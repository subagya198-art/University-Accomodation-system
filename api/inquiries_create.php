<?php
require '../config/db.php';
require 'inquiries_helpers.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$listingId = (int) ($body["listingId"] ?? 0);
$studentId = isset($body["studentId"]) && $body["studentId"] !== null ? (int) $body["studentId"] : null;
$name = trim($body["name"] ?? "");
$email = trim($body["email"] ?? "");
$message = trim($body["message"] ?? "");

if ($listingId <= 0 || $name === "" || $email === "" || $message === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Missing required fields."]);
  exit;
}

// Confirm the listing exists and grab its title for the activity log.
$stmt = $pdo->prepare("SELECT title FROM listings WHERE id = ?");
$stmt->execute([$listingId]);
$listing = $stmt->fetch();
if (!$listing) {
  http_response_code(404);
  echo json_encode(["ok" => false, "error" => "Listing not found."]);
  exit;
}

$stmt = $pdo->prepare(
  "INSERT INTO inquiries (listing_id, student_id, name, email, message) VALUES (?, ?, ?, ?, ?)"
);
$stmt->execute([$listingId, $studentId, $name, $email, $message]);
$newId = (int) $pdo->lastInsertId();

logActivity($pdo, "Inquiry sent", "$name → {$listing['title']}");

$stmt = $pdo->prepare(INQUIRY_SELECT . " WHERE i.id = ?");
$stmt->execute([$newId]);
$row = $stmt->fetch();

echo json_encode(["ok" => true, "inquiry" => formatInquiry($row)]);