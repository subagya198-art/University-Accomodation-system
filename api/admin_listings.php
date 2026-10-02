<?php
require '../config/db.php';
require 'listings_helpers.php';

$stmt = $pdo->query(
  "SELECT l.*, u.name AS provider_name, u.email AS provider_email
   FROM listings l JOIN users u ON u.id = l.provider_id
   ORDER BY
     CASE l.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
     l.id DESC"
);
$rows = $stmt->fetchAll();

$results = [];
foreach ($rows as $row) {
  $amenities = getAmenitiesForListing($pdo, (int) $row["id"]);
  $results[] = formatListing($row, $amenities, ["name" => $row["provider_name"], "email" => $row["provider_email"]]);
}

echo json_encode(["ok" => true, "listings" => $results]);