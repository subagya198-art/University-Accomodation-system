<?php
/**
 * Shared inquiry helpers, used by every inquiries-related endpoint.
 * Included after config/db.php.
 */

function formatInquiry(array $row): array {
  return [
    "id" => (int) $row["id"],
    "listingId" => (int) $row["listing_id"],
    "listingTitle" => $row["listing_title"],
    "listingCode" => $row["listing_code"],
    "providerId" => (int) $row["provider_id"],
    "providerName" => $row["provider_name"],
    "studentId" => $row["student_id"] !== null ? (int) $row["student_id"] : null,
    "name" => $row["name"],
    "email" => $row["email"],
    "message" => $row["message"],
    "reply" => $row["reply_message"] !== null
      ? ["message" => $row["reply_message"], "at" => $row["reply_at"]]
      : null,
    "submittedAt" => $row["created_at"],
  ];
}

// Shared SELECT used by every endpoint that reads inquiries, so the
// joins to listings/users only need to be written once.
const INQUIRY_SELECT = "
  SELECT i.*, l.title AS listing_title, l.code AS listing_code,
         l.provider_id AS provider_id, u.name AS provider_name
  FROM inquiries i
  JOIN listings l ON l.id = i.listing_id
  JOIN users u ON u.id = l.provider_id
";