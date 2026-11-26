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

if (!isset($_SESSION["ID"])) {
    balas(["success" => false, "message" => "Silakan login terlebih dahulu."], 401);
}
if (($_SESSION["level"] ?? "") !== "admin") {
    balas(["success" => false, "message" => "Akses ditolak."], 403);
}

include "Koneksi.php";

$folderFoto = dirname(__DIR__) . "/Assets/Foto/";
if (!is_dir($folderFoto)) {
    mkdir($folderFoto, 0755, true);
}

mysqli_report(MYSQLI_REPORT_OFF);   // query gagal -> false, bukan exception
$conn = mysqli_connect($servername, $username, $password, $database);
if (!$conn) {
    balas(["success" => false, "message" => "Koneksi database gagal."], 500);
}

$LEVEL   = ["user", "admin"];
$JABATAN = ["Pendidik", "Tenaga Kependidikan (Non-Pendidik)", "Pendukung Operasional"];

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $cari = $_GET["cari"] ?? "";
    $sql  = "SELECT ID, nama, gambar, jabatan, username, email, phone, level FROM login WHERE level = 'user'";

    if ($cari !== "") {
        if (!ctype_digit($cari)) {
            balas(["success" => false, "message" => "ID harus berupa angka."], 400);
        }
        $stmt = mysqli_prepare($conn, $sql . " AND ID = ? ORDER BY ID");
        mysqli_stmt_bind_param($stmt, "s", $cari);
    } else {
        $stmt = mysqli_prepare($conn, $sql . " ORDER BY ID");
    }

    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);

    $data = [];
    while ($baris = mysqli_fetch_assoc($hasil)) {
        $data[] = $baris;
    }
    balas(["success" => true, "data" => $data]);
}

$in = !empty($_POST) ? $_POST : (json_decode(file_get_contents("php://input"), true) ?? []);
$aksi  = $in["aksi"] ?? "";
$idRow = (string) ($in["ID"] ?? "");

if (!ctype_digit($idRow)) {
    balas(["success" => false, "message" => "ID harus berupa angka."], 400);
}

function ambilForm($in, $LEVEL, $JABATAN) {
    $f = [
        "username" => trim($in["username"] ?? ""),
        "password" => (string) ($in["password"] ?? ""),
        "nama"     => trim($in["nama"] ?? ""),
        "email"    => trim($in["email"] ?? ""),
        "phone"    => trim($in["phone"] ?? ""),
        "level"    => $in["level"] ?? "",
        "jabatan"  => $in["jabatan"] ?? "",
    ];
    if ($f["username"] === "" || $f["nama"] === "") {
        balas(["success" => false, "message" => "Username dan nama wajib diisi."], 400);
    }
    if (!in_array($f["level"], $LEVEL, true)) {
        balas(["success" => false, "message" => "Level tidak valid."], 400);
    }
    if ($f["jabatan"] !== "" && !in_array($f["jabatan"], $JABATAN, true)) {
        balas(["success" => false, "message" => "Jabatan tidak valid."], 400);
    }
    if ($f["email"] !== "" && !filter_var($f["email"], FILTER_VALIDATE_EMAIL)) {
        balas(["success" => false, "message" => "Format email tidak valid."], 400);
    }
    if ($f["jabatan"] === "") {
        $f["jabatan"] = null;
    }
    return $f;
}

if ($aksi === "tambah") {
    $f = ambilForm($in, $LEVEL, $JABATAN);
    if ($f["password"] === "") {
        balas(["success" => false, "message" => "Password wajib diisi."], 400);
    }

    $stmt = mysqli_prepare($conn, "SELECT 1 FROM login WHERE ID = ? OR username = ?");
    mysqli_stmt_bind_param($stmt, "ss", $idRow, $f["username"]);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        balas(["success" => false, "message" => "ID atau username sudah dipakai."], 409);
    }
    mysqli_stmt_close($stmt);

    $hash = password_hash($f["password"], PASSWORD_DEFAULT);
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO login (ID, username, password, nama, level, jabatan, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    mysqli_stmt_bind_param(
        $stmt, "ssssssss",
        $idRow, $f["username"], $hash, $f["nama"], $f["level"], $f["jabatan"], $f["email"], $f["phone"]
    );

    if (!mysqli_stmt_execute($stmt)) {
        balas(["success" => false, "message" => "Gagal menambah user."], 500);
    }
    balas(["success" => true, "message" => "Data telah ditambah."]);
}

if ($aksi === "edit") {
    $f = ambilForm($in, $LEVEL, $JABATAN);

    if ($idRow === (string) $_SESSION["ID"] && $f["level"] !== "admin") {
        balas(["success" => false, "message" => "Anda tidak bisa menurunkan level akun sendiri."], 400);
    }

    $stmt = mysqli_prepare($conn, "SELECT 1 FROM login WHERE username = ? AND ID <> ?");
    mysqli_stmt_bind_param($stmt, "ss", $f["username"], $idRow);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        balas(["success" => false, "message" => "Username sudah dipakai user lain."], 409);
    }
    mysqli_stmt_close($stmt);

    if ($f["password"] !== "") {
        $hash = password_hash($f["password"], PASSWORD_DEFAULT);
        $stmt = mysqli_prepare(
            $conn,
            "UPDATE login SET username = ?, password = ?, nama = ?, level = ?, email = ?, jabatan = ?, phone = ? WHERE ID = ?"
        );
        mysqli_stmt_bind_param(
            $stmt, "ssssssss",
            $f["username"], $hash, $f["nama"], $f["level"], $f["email"], $f["jabatan"], $f["phone"], $idRow
        );
    } else {
        $stmt = mysqli_prepare(
            $conn,
            "UPDATE login SET username = ?, nama = ?, level = ?, email = ?, jabatan = ?, phone = ? WHERE ID = ?"
        );
        mysqli_stmt_bind_param(
            $stmt, "sssssss",
            $f["username"], $f["nama"], $f["level"], $f["email"], $f["jabatan"], $f["phone"], $idRow
        );
    }

    if (!mysqli_stmt_execute($stmt)) {
        balas(["success" => false, "message" => "Gagal mengubah data."], 500);
    }
    balas(["success" => true, "message" => "Data telah diupdate."]);
}

if ($aksi === "hapus") {
    if ($idRow === (string) $_SESSION["ID"]) {
        balas(["success" => false, "message" => "Anda tidak bisa menghapus akun sendiri."], 400);
    }
    $stmt = mysqli_prepare($conn, "DELETE FROM login WHERE ID = ?");
    mysqli_stmt_bind_param($stmt, "s", $idRow);

    if (!mysqli_stmt_execute($stmt)) {
        balas(["success" => false, "message" => "Gagal menghapus user."], 500);
    }
    if (mysqli_stmt_affected_rows($stmt) === 0) {
        balas(["success" => false, "message" => "User tidak ditemukan."], 404);
    }
    balas(["success" => true, "message" => "User berhasil dihapus."]);
}

if ($aksi === "upload") {
    if (!isset($_FILES["berkas"]) || $_FILES["berkas"]["error"] !== UPLOAD_ERR_OK) {
        balas(["success" => false, "message" => "File belum dipilih."], 400);
    }
    if ($_FILES["berkas"]["size"] > 2 * 1024 * 1024) {
        balas(["success" => false, "message" => "Ukuran gambar maksimal 2 MB."], 400);
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $_FILES["berkas"]["tmp_name"]);
    $boleh = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"];
    if (!isset($boleh[$mime])) {
        balas(["success" => false, "message" => "File harus berupa JPG, PNG, atau WEBP."], 400);
    }

    $stmt = mysqli_prepare($conn, "SELECT 1 FROM login WHERE ID = ?");
    mysqli_stmt_bind_param($stmt, "s", $idRow);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) === 0) {
        balas(["success" => false, "message" => "User tidak ditemukan."], 404);
    }
    mysqli_stmt_close($stmt);

    $namaFile = "profil_" . $idRow . "_" . time() . "." . $boleh[$mime];
    $tujuan = $folderFoto . $namaFile;

    if (!move_uploaded_file($_FILES["berkas"]["tmp_name"], $tujuan)) {
        balas(["success" => false, "message" => "Gagal menyimpan gambar."], 500);
    }

    $stmt = mysqli_prepare($conn, "UPDATE login SET gambar = ? WHERE ID = ?");
    mysqli_stmt_bind_param($stmt, "ss", $namaFile, $idRow);
    if (!mysqli_stmt_execute($stmt)) {
        unlink($tujuan);
        balas(["success" => false, "message" => "Gagal mencatat gambar."], 500);
    }
    balas(["success" => true, "message" => "Upload gambar berhasil."]);
}

balas(["success" => false, "message" => "Aksi tidak dikenal."], 400);