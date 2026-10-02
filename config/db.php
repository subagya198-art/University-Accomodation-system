<?php
/**
 * Shared database connection for BAMS.
 *
 * Every api/*.php file starts with: require '../config/db.php';
 * which gives it a ready-to-use PDO object called $pdo.
 *
 * XAMPP's default MySQL setup: user "root", no password. If you set a
 * password in your own XAMPP install, update DB_PASS below.
 */

const DB_HOST = "localhost";
const DB_NAME = "bams";
const DB_USER = "root";
const DB_PASS = "";

header("Content-Type: application/json");
// Allows the frontend pages (opened from the same site) to call these
// endpoints. Since everything lives under one XAMPP site, this is
// mostly a formality — but it's harmless to include.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  exit(0);
}

try {
  $pdo = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "Database connection failed. Is MySQL running in XAMPP?"]);
  exit;
}

/** Reads the JSON body of a POST/PUT request into an associative array. */
function readJsonBody(): array {
  $raw = file_get_contents("php://input");
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

/** Logs an event to activity_log, used by the admin's activity feed. */
function logActivity(PDO $pdo, string $action, string $detail): void {
  $stmt = $pdo->prepare("INSERT INTO activity_log (action, detail) VALUES (?, ?)");
  $stmt->execute([$action, $detail]);
}