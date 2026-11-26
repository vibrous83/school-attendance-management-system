
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

function balas($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

if (!isset($_SESSION["ID"])) {
    balas(["success" => false, "message" => "Silakan login terlebih dahulu."], 401);
}

if (($_SESSION["level"] ?? "") !== "admin") {
    balas(["success" => false, "message" => "Akses ditolak."], 403);
}

include "Koneksi.php";

$conn = mysqli_connect($servername, $username, $password, $database);
if (!$conn) {
    balas(["success" => false, "message" => "Koneksi database gagal."], 500);
}

function hitung($conn, $sql) {
    try {
        $result = mysqli_query($conn, $sql);
        if (!$result) {
            return 0;
        }
        $row = mysqli_fetch_row($result);
        return (int) ($row[0] ?? 0);
    } catch (mysqli_sql_exception $e) {
        return 0;
    }
}

$jumlah_karyawan = hitung($conn, "SELECT COUNT(*) FROM login WHERE level = 'user'");
$jumlah_absensi  = hitung($conn, "SELECT COUNT(*) FROM absen");
$jumlah_jabatan  = hitung($conn, "SELECT COUNT(DISTINCT jabatan) FROM login");

$kehadiran = hitung($conn, "SELECT COUNT(*) FROM absen WHERE keterangan = 'Hadir'");
$izin      = hitung($conn, "SELECT COUNT(*) FROM absen WHERE UPPER(masuk) = 'IZIN'");
$sakit     = hitung($conn, "SELECT COUNT(*) FROM absen WHERE UPPER(masuk) = 'SAKIT'");

if ($jumlah_absensi > 0) {
    $p_hadir = ($kehadiran / $jumlah_absensi) * 100;
    $p_izin  = ($izin / $jumlah_absensi) * 100;
    $p_sakit = ($sakit / $jumlah_absensi) * 100;
} else {
    $p_hadir = $p_izin = $p_sakit = 0;
}

balas([
    "success" => true,

    "jumlah_karyawan" => $jumlah_karyawan,
    "jumlah_absensi"  => $jumlah_absensi,
    "jumlah_jabatan"  => $jumlah_jabatan,

    "kehadiran" => $kehadiran,
    "izin"      => $izin,
    "sakit"     => $sakit,

    "persentase_kehadiran" => round($p_hadir, 2),
    "persentase_izin"      => round($p_izin, 2),
    "persentase_sakit"     => round($p_sakit, 2)
]);

mysqli_close($conn);