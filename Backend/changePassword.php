
<?php
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// Validasi session
if (!isset($_SESSION["ID"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Silakan login terlebih dahulu."
    ]);
    exit;
}

// Hanya menerima POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method tidak diizinkan."
    ]);
    exit;
}

include "Koneksi.php";

// Mengambil data dari React
$input = json_decode(file_get_contents("php://input"), true);

$currentPassword = $input["password"] ?? "";
$newPassword = $input["new_password"] ?? "";

$ID = $_SESSION["ID"];

// Validasi input
if (empty($currentPassword) || empty($newPassword)) {
    echo json_encode([
        "success" => false,
        "message" => "Semua kolom wajib diisi."
    ]);
    exit;
}

// Mengambil password lama dari database
$stmt = mysqli_prepare(
    $conn,
    "SELECT password FROM login WHERE ID = ?"
);

mysqli_stmt_bind_param($stmt, "i", $ID);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

mysqli_stmt_close($stmt);

// Verifikasi password lama
if (!$user || !password_verify($currentPassword, $user["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Password saat ini salah."
    ]);
    exit;
}

// Hash password baru
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password
$updateStmt = mysqli_prepare(
    $conn,
    "UPDATE login SET password = ? WHERE ID = ?"
);

mysqli_stmt_bind_param(
    $updateStmt,
    "si",
    $hashedPassword,
    $ID
);

if (mysqli_stmt_execute($updateStmt)) {
    echo json_encode([
        "success" => true,
        "message" => "Password berhasil diubah!"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Terjadi kesalahan saat mengubah password."
    ]);
}

mysqli_stmt_close($updateStmt);
?>
