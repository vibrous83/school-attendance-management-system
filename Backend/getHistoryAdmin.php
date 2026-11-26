<?php

ini_set("display_errors", 0);
error_reporting(E_ALL);

session_start();
date_default_timezone_set("Asia/Jakarta");

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

function balas($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function tanggalValid($t) {
    return is_string($t) && preg_match('/^\d{2}-\d{2}-\d{4}$/', $t);
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

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $tanggal = $_GET["tanggal"] ?? "";
    $kolom = "SELECT tanggal, ID, nama, masuk, keluar, keterangan, bukti, bukti_keluar FROM absen";
    $urut  = " ORDER BY STR_TO_DATE(tanggal, '%d-%m-%Y') DESC, ID";

    if ($tanggal !== "") {
        if (!tanggalValid($tanggal)) {
            balas(["success" => false, "message" => "Format tanggal tidak valid."], 400);
        }
        $stmt = mysqli_prepare($conn, $kolom . " WHERE tanggal = ?" . $urut);
        mysqli_stmt_bind_param($stmt, "s", $tanggal);
    } else {
        $stmt = mysqli_prepare($conn, $kolom . $urut);
    }

    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);

    $data = [];
    while ($baris = mysqli_fetch_assoc($hasil)) {
        $data[] = $baris;
    }

    balas(["success" => true, "data" => $data]);
}

$in = json_decode(file_get_contents("php://input"), true) ?? [];
$aksi = $in["aksi"] ?? "";
$idRow = (string) ($in["ID"] ?? "");
$tglLama = $in["tanggal"] ?? "";

if ($idRow === "" || !tanggalValid($tglLama)) {
    balas(["success" => false, "message" => "Data tidak lengkap."], 400);
}

if ($aksi === "edit") {
    $masuk      = trim($in["masuk"] ?? "");
    $keluar     = trim($in["keluar"] ?? "");
    $tglBaru    = $in["tanggal_baru"] ?? "";
    $keterangan = trim($in["keterangan"] ?? "");

    if (!tanggalValid($tglBaru)) {
        balas(["success" => false, "message" => "Format tanggal tidak valid."], 400);
    }
    if ($keluar === "") {
        $keluar = null; 
    }

    if ($tglBaru !== $tglLama) {
        $stmt = mysqli_prepare($conn, "SELECT 1 FROM absen WHERE ID = ? AND tanggal = ?");
        mysqli_stmt_bind_param($stmt, "ss", $idRow, $tglBaru);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);
        if (mysqli_stmt_num_rows($stmt) > 0) {
            balas(["success" => false, "message" => "Sudah ada data pada tanggal tersebut."], 409);
        }
        mysqli_stmt_close($stmt);
    }

    $stmt = mysqli_prepare(
        $conn,
        "UPDATE absen SET masuk = ?, keluar = ?, tanggal = ?, keterangan = ? WHERE ID = ? AND tanggal = ?"
    );
    mysqli_stmt_bind_param($stmt, "ssssss", $masuk, $keluar, $tglBaru, $keterangan, $idRow, $tglLama);

    if (!mysqli_stmt_execute($stmt)) {
        balas(["success" => false, "message" => "Gagal mengubah data."], 500);
    }
    balas(["success" => true, "message" => "Data telah diupdate."]);
}

if ($aksi === "hapus") {
    $stmt = mysqli_prepare($conn, "SELECT bukti, bukti_keluar FROM absen WHERE ID = ? AND tanggal = ?");
    mysqli_stmt_bind_param($stmt, "ss", $idRow, $tglLama);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $b1, $b2);
    $ada = mysqli_stmt_fetch($stmt);
    mysqli_stmt_close($stmt);

    if (!$ada) {
        balas(["success" => false, "message" => "Data tidak ditemukan."], 404);
    }

    $stmt = mysqli_prepare($conn, "DELETE FROM absen WHERE ID = ? AND tanggal = ?");
    mysqli_stmt_bind_param($stmt, "ss", $idRow, $tglLama);

    if (!mysqli_stmt_execute($stmt)) {
        balas(["success" => false, "message" => "Gagal menghapus data."], 500);
    }

    foreach ([$b1, $b2] as $f) {
        if (!empty($f)) {
            $path = dirname(__DIR__) . "/Bukti/" . basename($f);
            if (is_file($path)) {
                unlink($path);
            }
        }
    }
    balas(["success" => true, "message" => "Data berhasil dihapus."]);
}

balas(["success" => false, "message" => "Aksi tidak dikenal."], 400);