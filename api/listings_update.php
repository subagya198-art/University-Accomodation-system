<?php
require '../config/db.php';
require 'listings_helpers.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Use POST."]);
  exit;
}

$body = readJsonBody();
$id = (int) ($body["id"] ?? 0);
$providerId = (int) ($body["providerId"] ?? 0);

$stmt = $pdo->prepare("SELECT provider_id FROM listings WHERE id = ?");
$stmt->execute([$id]);
$existing = $stmt->fetch();

if (!$existing || (int) $existing["provider_id"] !== $providerId) {
  http_response_code(403);
  echo json_encode(["ok" => false, "error" => "Listing not found or not yours to edit."]);
  exit;
}

$title = trim($body["title"] ?? "");
$location = trim($body["location"] ?? "");
$price = (float) ($body["price"] ?? 0);
$distanceKm = (float) ($body["distanceKm"] ?? 0);
$type = $body["type"] ?? "";
$occupancy = trim($body["occupancy"] ?? "");
$description = trim($body["description"] ?? "");
$amenities = $body["amenities"] ?? [];

$stmt = $pdo->prepare(
  "UPDATE listings SET title=?, location=?, distance_km=?, price=?, type=?, occupancy=?, description=?
   WHERE id = ?"
);
$stmt->execute([$title, $location, $distanceKm, $price, $type, $occupancy, $description, $id]);

setAmenitiesForListing($pdo, $id, $amenities);

logActivity($pdo, "Listing updated", "$title (#$id)");

echo json_encode(["ok" => true, "listing" => fetchListingWithProvider($pdo, $id)]);