<?php
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if (!isset($_SESSION["ID"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Silakan login terlebih dahulu."
    ]);
    exit;
}

include "Koneksi.php";

$conn = mysqli_connect(
    $servername,
    $username,
    $password,
    $database
);

if (!$conn) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Koneksi database gagal."
    ]);
    exit;
}

$ID = $_SESSION["ID"];

if (isset($_GET["tanggal"]) && !empty($_GET["tanggal"])) {
    $tanggal = $_GET["tanggal"];

    $stmt = mysqli_prepare(
        $conn,
        "SELECT tanggal, masuk, keluar, keterangan
         FROM absen
         WHERE ID = ? AND tanggal = ?
         ORDER BY tanggal DESC"
    );

    mysqli_stmt_bind_param($stmt, "ss", $ID, $tanggal);

} else {
    $stmt = mysqli_prepare(
        $conn,
        "SELECT tanggal, masuk, keluar, keterangan
         FROM absen
         WHERE ID = ?
         ORDER BY tanggal DESC"
    );

    mysqli_stmt_bind_param($stmt, "s", $ID);
}

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$history = [];

while ($row = mysqli_fetch_assoc($result)) {
    $history[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $history
]);

mysqli_stmt_close($stmt);
?>