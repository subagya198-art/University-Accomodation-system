<?php
require '../config/db.php';
require 'inquiries_helpers.php';

$studentId = (int) ($_GET["student_id"] ?? 0);

if ($studentId <= 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Missing student_id."]);
  exit;
}

$stmt = $pdo->prepare(INQUIRY_SELECT . " WHERE i.student_id = ? ORDER BY i.id DESC");
$stmt->execute([$studentId]);
$rows = $stmt->fetchAll();

echo json_encode(["ok" => true, "inquiries" => array_map("formatInquiry", $rows)]);