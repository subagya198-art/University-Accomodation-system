<?php
require '../config/db.php';
require 'inquiries_helpers.php';

$providerId = (int) ($_GET["provider_id"] ?? 0);

if ($providerId <= 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Missing provider_id."]);
  exit;
}

$stmt = $pdo->prepare(INQUIRY_SELECT . " WHERE l.provider_id = ? ORDER BY i.id DESC");
$stmt->execute([$providerId]);
$rows = $stmt->fetchAll();

echo json_encode(["ok" => true, "inquiries" => array_map("formatInquiry", $rows)]);