<?php

ini_set("display_errors", 0);
error_reporting(E_ALL);

session_start();
date_default_timezone_set("Asia/Jakarta");

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

function balas($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(["success" => $success, "message" => $message]);
    exit;
}

if (!isset($_SESSION["ID"])) {
   balas(false, "Silakan login terlebih dahulu.", 401);
}

include "koneksi.php";

$folderBukti = dirname(__DIR__) . "/Bukti/";
if (!is_dir($folderBukti)) {
    mkdir($folderBukti, 0755, true);
}

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    balas(false, "Koneksi database gagal.", 500);
}

$ID    = $_SESSION["ID"];
$nama  = $_SESSION["nama"];
$tanggal = date("d-m-Y");
$waktu   = date("H:i:s");
$ket     = "Hadir";

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = mysqli_prepare($conn, "SELECT masuk, keluar FROM absen WHERE ID = ? AND tanggal = ?");
    mysqli_stmt_bind_param($stmt, "ss", $ID, $tanggal);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $masukDb, $keluarDb);
    $ada = (bool) mysqli_stmt_fetch($stmt);

    $izin = $ada && in_array(strtoupper($masukDb), ["IZIN", "SAKIT"], true);

    echo json_encode([
        "success" => true,
        "sudah_absen" => $ada,
        "izin" => $izin,
        "sudah_keluar" => $ada && !$izin && !empty($keluarDb)
    ]);
    exit;
}

// Izin / Sakit
if (($_POST["aksi"] ?? "") === "izin") {
    $jenis  = strtoupper($_POST["ket"] ?? "");
    $alasan = trim($_POST["alasan"] ?? "");

    if (!in_array($jenis, ["IZIN", "SAKIT"], true)) {
        balas(false, "Jenis keterangan tidak valid.", 400);
    }
    if ($alasan === "") {
        balas(false, "Alasan wajib diisi.", 400);
    }
    if (!isset($_FILES["bkt"]) || $_FILES["bkt"]["error"] !== UPLOAD_ERR_OK) {
        balas(false, "Bukti belum dikirim.", 400);
    }
    if ($_FILES["bkt"]["size"] > 2 * 1024 * 1024) {
        balas(false, "Ukuran bukti maksimal 2 MB.", 400);
    }

    // Hanya terima JPG, PNG, atau PDF (cek isi file, bukan nama file)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $_FILES["bkt"]["tmp_name"]);
    $boleh = [
        "image/jpeg"      => "jpg",
        "image/png"       => "png",
        "application/pdf" => "pdf"
    ];
    if (!isset($boleh[$mime])) {
        balas(false, "Bukti harus berupa JPG, PNG, atau PDF.", 400);
    }

    // Sudah absen hari ini?
    $stmt = mysqli_prepare($conn, "SELECT 1 FROM absen WHERE ID = ? AND tanggal = ?");
    mysqli_stmt_bind_param($stmt, "ss", $ID, $tanggal);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        balas(false, "Anda sudah absen hari ini.", 409);
    }
    mysqli_stmt_close($stmt);

    $namaFile = $ID . "_izin_" . date("Ymd_His") . "." . $boleh[$mime];
    $tujuan = $folderBukti . $namaFile;

    if (!move_uploaded_file($_FILES["bkt"]["tmp_name"], $tujuan)) {
        balas(false, "Gagal menyimpan bukti.", 500);
    }

    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO absen (ID, nama, masuk, keluar, tanggal, keterangan, bukti) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    mysqli_stmt_bind_param($stmt, "sssssss", $ID, $nama, $jenis, $jenis, $tanggal, $alasan, $namaFile);

    if (!mysqli_stmt_execute($stmt)) {
        unlink($tujuan);
        balas(false, "Gagal mencatat izin.", 500);
    }

    balas(true, ucfirst(strtolower($jenis)) . " tercatat.");
}

// Validasi Lokasi
$lat = $_POST["latitude"] ?? null;
$lng = $_POST["longitude"] ?? null;

if (!is_numeric($lat) || !is_numeric($lng) ||
    $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
    balas(false, "Silakan aktifkan GPS.", 400);
}

    $latKantor = -2.9712;
    $lngKantor = 104.7681;
    $radius = 150;

    $R = 6371000;
    $lat1 = deg2rad($latKantor);
    $lat2 = deg2rad((float)$lat);
    $dlat = $lat2 - $lat1;
    $dlon = deg2rad((float)$lng) - deg2rad($lngKantor);

    $a = sin($dlat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dlon / 2) ** 2;
    $jarak = $R * 2 * atan2(sqrt($a), sqrt(1 - $a));

    if ($jarak > $radius) {
        balas(false, "Anda di luar area absensi! Jarak Anda: " . round($jarak) . " meter.", 403);
    }

    // Validasi foto
    if (!isset($_FILES["foto"]) || $_FILES["foto"]["error"] !== UPLOAD_ERR_OK) {
        balas(false, "Foto belum dikirim.", 400);
    }

    $info = getimagesize($_FILES["foto"]["tmp_name"]);
    if ($info === false || $info["mime"] !== "image/jpeg") {
        balas(false, "File harus berupa foto JPEG.", 400);
    }

    // Absen keluar
    if (($_POST["aksi"] ?? "") === "keluar") {
        $stmt = mysqli_prepare($conn, "SELECT masuk, keluar FROM absen WHERE ID = ? AND tanggal = ?");
        mysqli_stmt_bind_param($stmt, "ss", $ID, $tanggal);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_bind_result($stmt, $masukDb, $keluarDb);

    if (!mysqli_stmt_fetch($stmt)) {
        balas(false, "Anda belum absen masuk hari ini.", 400);
    }
    mysqli_stmt_close($stmt);
   
    if (in_array(strtoupper($masukDb), ["IZIN", "SAKIT"], true)) {
        balas(false, "Hari ini Anda izin/sakit, tidak perlu absen keluar.", 400);
    }
    if (!empty($keluarDb)) {
        balas(false, "Anda sudah absen keluar hari ini.", 409);
    }

    $namaFile = $ID . "_keluar_" . date("Ymd_His") . ".jpg";
    $tujuan = $folderBukti . $namaFile;

    if (!move_uploaded_file($_FILES["foto"]["tmp_name"], $tujuan)) {
        balas(false, "Gagal menyimpan foto.", 500);
    }

    $stmt = mysqli_prepare(
        $conn,
        "UPDATE absen SET keluar = ?, bukti_keluar = ? WHERE ID = ? AND tanggal = ?"
    );
    mysqli_stmt_bind_param($stmt, "ssss", $waktu, $namaFile, $ID, $tanggal);

    if (!mysqli_stmt_execute($stmt)) {
        unlink($tujuan);
        balas(false, "Gagal mencatat absen keluar.", 500);
    }

    balas(true, "Absen keluar tercatat pukul $waktu.");
}

// Absen Hadir
$stmt = mysqli_prepare($conn, "SELECT 1 FROM absen WHERE ID = ? AND tanggal = ?");
mysqli_stmt_bind_param($stmt, "ss", $ID, $tanggal);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

if (mysqli_stmt_num_rows($stmt) > 0) {
    balas(false, "Anda sudah absen hari ini.", 409);
}
mysqli_stmt_close($stmt);

$namaFile = $ID . "_" . date("Ymd_His") . ".jpg";
$tujuan = $folderBukti . $namaFile;

if (!move_uploaded_file($_FILES["foto"]["tmp_name"], $tujuan)) {
    balas(false, "Gagal menyimpan foto.", 500);
}

$stmt = mysqli_prepare(
    $conn,
    "INSERT INTO absen (ID, nama, masuk, tanggal, keterangan, bukti) VALUES (?, ?, ?, ?, ?, ?)"
);
mysqli_stmt_bind_param($stmt, "ssssss", $ID, $nama, $waktu, $tanggal, $ket, $namaFile);

if (!mysqli_stmt_execute($stmt)) {
    unlink($tujuan);
    balas(false, "Gagal mencatat absensi.", 500);
}

balas(true, "Absensi tercatat pukul $waktu.");