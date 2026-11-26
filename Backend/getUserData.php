<?php
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");

if (!isset($_SESSION["ID"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Session tidak ditemukan."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "ID" => $_SESSION["ID"],
    "nama" => $_SESSION["nama"],
    "gambar" => $_SESSION["gambar"],
    "level" => $_SESSION["level"],
    "jabatan" => $_SESSION["jabatan"] ?? null,
    "email" => $_SESSION["email"] ?? null,
    "phone" => $_SESSION["phone"] ?? null
]);
?>