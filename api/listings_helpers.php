<?php
/**
 * Shared listing helpers, used by every listings-related endpoint.
 * Included after config/db.php.
 */

const HUES = [168, 24, 200, 46, 340, 210, 320, 90, 280, 12];

/** Turns a raw listings row + amenities + provider info into the JSON shape the frontend expects. */
function formatListing(array $row, array $amenities, array $provider): array {
  return [
    "id" => (int) $row["id"],
    "code" => $row["code"],
    "providerId" => (int) $row["provider_id"],
    "title" => $row["title"],
    "location" => $row["location"],
    "distanceKm" => (float) $row["distance_km"],
    "price" => (float) $row["price"],
    "type" => $row["type"],
    "occupancy" => $row["occupancy"],
    "description" => $row["description"],
    "status" => $row["status"],
    "hue" => (int) $row["hue"],
    "amenities" => $amenities,
    "provider" => [
      "name" => $provider["name"] ?? "",
      "contact" => $provider["email"] ?? "",
    ],
  ];
}

/** Fetches the amenity names attached to one listing. */
function getAmenitiesForListing(PDO $pdo, int $listingId): array {
  $stmt = $pdo->prepare(
    "SELECT a.name FROM amenities a
     JOIN listing_amenities la ON la.amenity_id = a.id
     WHERE la.listing_id = ?"
  );
  $stmt->execute([$listingId]);
  return array_column($stmt->fetchAll(), "name");
}

/** Replaces a listing's amenities with the given list of names. */
function setAmenitiesForListing(PDO $pdo, int $listingId, array $amenityNames): void {
  $pdo->prepare("DELETE FROM listing_amenities WHERE listing_id = ?")->execute([$listingId]);

  if (empty($amenityNames)) return;

  $stmt = $pdo->prepare(
    "INSERT INTO listing_amenities (listing_id, amenity_id)
     SELECT ?, id FROM amenities WHERE name = ?"
  );
  foreach ($amenityNames as $name) {
    $stmt->execute([$listingId, $name]);
  }
}

/** Fetches one listing row joined with its provider's name/email. */
function fetchListingWithProvider(PDO $pdo, int $id): ?array {
  $stmt = $pdo->prepare(
    "SELECT l.*, u.name AS provider_name, u.email AS provider_email
     FROM listings l JOIN users u ON u.id = l.provider_id
     WHERE l.id = ?"
  );
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) return null;

  $amenities = getAmenitiesForListing($pdo, $id);
  return formatListing($row, $amenities, ["name" => $row["provider_name"], "email" => $row["provider_email"]]);
}