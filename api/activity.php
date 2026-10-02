<?php
require '../config/db.php';

$stmt = $pdo->query("SELECT action, detail, created_at FROM activity_log ORDER BY id DESC LIMIT 50");
$rows = $stmt->fetchAll();

$log = array_map(function ($r) {
  return [
    "action" => $r["action"],
    "detail" => $r["detail"],
    "at" => $r["created_at"],
  ];
}, $rows);

echo json_encode(["ok" => true, "activity" => $log]);