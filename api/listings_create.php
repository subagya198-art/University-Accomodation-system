<?php
require '../config/db.php';
require 'listings_helpers.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$providerId = (int) ($body["providerId"] ?? 0);
$title = trim($body["title"] ?? "");
$location = trim($body["location"] ?? "");
$price = (float) ($body["price"] ?? 0);
$distanceKm = (float) ($body["distanceKm"] ?? 0);
$type = $body["type"] ?? "";
$occupancy = trim($body["occupancy"] ?? "");
$description = trim($body["description"] ?? "");
$amenities = $body["amenities"] ?? [];

if ($providerId <= 0 || $title === "" || $location === "" || $price <= 0 || $occupancy === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Missing required fields."]);
  exit;
}

// Confirm the provider exists and is actually a provider.
$stmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ? AND role = 'provider'");
$stmt->execute([$providerId]);
$provider = $stmt->fetch();
if (!$provider) {
  http_response_code(403);
  echo json_encode(["ok" => false, "error" => "Invalid provider account."]);
  exit;
}

$hue = HUES[array_rand(HUES)];

$stmt = $pdo->prepare(
  "INSERT INTO listings (code, provider_id, title, location, distance_km, price, type, occupancy, description, status, hue)
   VALUES ('TEMP', ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
);
$stmt->execute([$providerId, $title, $location, $distanceKm, $price, $type, $occupancy, $description, $hue]);
$newId = (int) $pdo->lastInsertId();

// Now that we have the real id, generate a proper listing code and save it.
$code = "SEU-" . (100 + $newId);
$pdo->prepare("UPDATE listings SET code = ? WHERE id = ?")->execute([$code, $newId]);

setAmenitiesForListing($pdo, $newId, $amenities);

logActivity($pdo, "Listing submitted", "$title ($code) by {$provider['name']}");

echo json_encode(["ok" => true, "listing" => fetchListingWithProvider($pdo, $newId)]);