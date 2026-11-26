
<?php
session_start();
date_default_timezone_set("Asia/Jakarta");

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

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

// Mengambil seluruh jumlah absensi sekaligus
$stmt = mysqli_prepare(
    $conn,
    "SELECT
        COUNT(*) AS jumlah_absensi,
        SUM(CASE WHEN keterangan = 'Hadir' THEN 1 ELSE 0 END) AS kehadiran,
        SUM(CASE WHEN masuk = 'IZIN' THEN 1 ELSE 0 END) AS izin,
        SUM(CASE WHEN masuk = 'sakit' THEN 1 ELSE 0 END) AS sakit
    FROM absen
    WHERE ID = ?"
);

mysqli_stmt_bind_param($stmt, "s", $ID);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$data = mysqli_fetch_assoc($result);

// Mengambil hasil query
$jumlah_absensi = (int) $data["jumlah_absensi"];
$kehadiran = (int) $data["kehadiran"];
$izin = (int) $data["izin"];
$sakit = (int) $data["sakit"];

// Menghitung persentase
if ($jumlah_absensi == 0) {
    $persentase_kehadiran = 0;
    $persentase_izin = 0;
    $persentase_sakit = 0;
} else {
    $persentase_kehadiran = ($kehadiran / $jumlah_absensi) * 100;
    $persentase_izin = ($izin / $jumlah_absensi) * 100;
    $persentase_sakit = ($sakit / $jumlah_absensi) * 100;
}

// Mengirim data ke React
echo json_encode([
    "success" => true,

    "jumlah_absensi" => $jumlah_absensi,

    "kehadiran" => $kehadiran,
    "izin" => $izin,
    "sakit" => $sakit,

    "persentase_kehadiran" => round($persentase_kehadiran, 2),
    "persentase_izin" => round($persentase_izin, 2),
    "persentase_sakit" => round($persentase_sakit, 2)
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
