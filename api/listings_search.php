<?php
require '../config/db.php';
require 'listings_helpers.php';

$keyword = trim($_GET["keyword"] ?? "");
$minPrice = isset($_GET["min_price"]) && $_GET["min_price"] !== "" ? (float) $_GET["min_price"] : 0;
$maxPrice = isset($_GET["max_price"]) && $_GET["max_price"] !== "" ? (float) $_GET["max_price"] : null;
$type = $_GET["type"] ?? "";
$amenities = $_GET["amenities"] ?? []; // expects amenities[]=WiFi&amenities[]=Water

$sql = "SELECT l.*, u.name AS provider_name, u.email AS provider_email
        FROM listings l JOIN users u ON u.id = l.provider_id
        WHERE l.status = 'approved'";
$params = [];

if ($keyword !== "") {
  $sql .= " AND (l.title LIKE ? OR l.location LIKE ?)";
  $params[] = "%$keyword%";
  $params[] = "%$keyword%";
}
if ($minPrice > 0) {
  $sql .= " AND l.price >= ?";
  $params[] = $minPrice;
}
if ($maxPrice !== null) {
  $sql .= " AND l.price <= ?";
  $params[] = $maxPrice;
}
if ($type !== "") {
  $sql .= " AND l.type = ?";
  $params[] = $type;
}

$sql .= " ORDER BY l.distance_km ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$results = [];
foreach ($rows as $row) {
  $listingAmenities = getAmenitiesForListing($pdo, (int) $row["id"]);

  // If amenity filters were given, skip listings missing any of them.
  if (!empty($amenities) && count(array_diff($amenities, $listingAmenities)) > 0) {
    continue;
  }

  $results[] = formatListing($row, $listingAmenities, ["name" => $row["provider_name"], "email" => $row["provider_email"]]);
}

echo json_encode(["ok" => true, "listings" => $results]);