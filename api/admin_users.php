<?php
require '../config/db.php';

$stmt = $pdo->query("SELECT id, name, email, role, status FROM users ORDER BY id DESC");
$rows = $stmt->fetchAll();

$users = array_map(function ($u) {
  return [
    "id" => (int) $u["id"],
    "name" => $u["name"],
    "email" => $u["email"],
    "role" => $u["role"],
    "status" => $u["status"],
  ];
}, $rows);

echo json_encode(["ok" => true, "users" => $users]);