<?php
require '../config/db.php';
require 'listings_helpers.php';

$providerId = (int) ($_GET["provider_id"] ?? 0);

if ($providerId <= 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Missing provider_id."]);
  exit;
}

$stmt = $pdo->prepare(
  "SELECT l.*, u.name AS provider_name, u.email AS provider_email
   FROM listings l JOIN users u ON u.id = l.provider_id
   WHERE l.provider_id = ?
   ORDER BY l.id DESC"
);
$stmt->execute([$providerId]);
$rows = $stmt->fetchAll();

$results = [];
foreach ($rows as $row) {
  $amenities = getAmenitiesForListing($pdo, (int) $row["id"]);
  $results[] = formatListing($row, $amenities, ["name" => $row["provider_name"], "email" => $row["provider_email"]]);
}

echo json_encode(["ok" => true, "listings" => $results]);