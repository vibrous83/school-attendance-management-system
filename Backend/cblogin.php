
<?php
session_start();

header("Content-Type: application/json");

// CORS untuk React Vite
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Menangani preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

include "./koneksi.php";

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

// Menerima data JSON dari Axios
$input = json_decode(file_get_contents("php://input"), true);

$username_input = $input["username"] ?? "";
$password_input = $input["password"] ?? "";

// Validasi input
if ($username_input === "" || $password_input === "") {
    echo json_encode([
        "success" => false,
        "message" => "Username dan password wajib diisi."
    ]);
    exit;
}

// Mencari username di database
$stmt = mysqli_prepare(
    $conn,
    "SELECT * FROM login WHERE username = ?"
);

mysqli_stmt_bind_param($stmt, "s", $username_input);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$data = mysqli_fetch_assoc($result);

// Memeriksa password
if ($data && password_verify($password_input, $data["password"])) {

    session_regenerate_id(true);

    $_SESSION["username"] = $data["username"];
    $_SESSION["level"] = $data["level"];
    $_SESSION["nama"] = $data["nama"];
    $_SESSION["gambar"] = $data["gambar"];
    $_SESSION["ID"] = $data["ID"];

    if ($data["level"] === "user") {
        $_SESSION["jabatan"] = $data["jabatan"];
        $_SESSION["phone"] = $data["phone"];
        $_SESSION["email"] = $data["email"];
    }

    echo json_encode([
        "success" => true,
        "message" => "Login berhasil.",
        "level" => $data["level"]
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "Username atau password salah."
    ]); 
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
