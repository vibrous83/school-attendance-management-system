<?php
session_start();

header("Content-Type: application/json");

// CORS untuk React Vite
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// Validasi session
if (!isset($_SESSION["username"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Session tidak ditemukan."
    ]);
    exit;
}

// Menghapus seluruh data session
$_SESSION = [];

// Menghapus cookie session
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();

    setcookie(
        session_name(),
        "",
        [
            "expires" => time() - 42000,
            "path" => $params["path"],
            "domain" => $params["domain"],
            "secure" => $params["secure"],
            "httponly" => $params["httponly"],
            "samesite" => $params["samesite"] ?? "Lax"
        ]
    );
}

session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Berhasil logout."
]);
?>