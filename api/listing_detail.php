<?php
require '../config/db.php';
require 'listings_helpers.php';

$id = (int) ($_GET["id"] ?? 0);

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Missing listing id."]);
  exit;
}

$listing = fetchListingWithProvider($pdo, $id);

if (!$listing) {
  http_response_code(404);
  echo json_encode(["ok" => false, "error" => "Listing not found."]);
  exit;
}

echo json_encode(["ok" => true, "listing" => $listing]);