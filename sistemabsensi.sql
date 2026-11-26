-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 26 Nov 2026 pada 03.20
-- Versi server: 8.0.46
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistemabsensi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `absen`
--

CREATE TABLE `absen` (
  `ID` int DEFAULT NULL,
  `nama` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `masuk` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `keluar` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tanggal` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `keterangan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bukti` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bukti_keluar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `absen`
--

INSERT INTO `absen` (`ID`, `nama`, `masuk`, `keluar`, `tanggal`, `keterangan`, `bukti`, `bukti_keluar`) VALUES
(1, 'azka', '07:59:54', '16:01:11', '25-11-2026', 'Hadir', '1_20261125_090608.jpg', '1_keluar_20261125_090616.jpg'),
(1, 'azka', '07:56:03', '16:05:43', '26-11-2026', 'Hadir', '1_20261126_073411.jpg', '1_keluar_20261126_073443.jpg'),
(3, 'mumtaz', 'IZIN', 'IZIN', '26-11-2026', 'Acara Keluarga', '3_izin_20261126_082036.jpg', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `login`
--

CREATE TABLE `login` (
  `ID` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nama` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `level` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jabatan` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gambar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `login`
--

INSERT INTO `login` (`ID`, `username`, `password`, `nama`, `level`, `jabatan`, `email`, `phone`, `gambar`) VALUES
(1, 'azka', '$2y$10$zSodDkqXvQcz/1clCO1/RukLASia/mlUCZ/YZTb5VQRIXCQPAST6G', 'azka', 'user', 'Pendidik', 'ahmadazkaalhusaini@gmail.com', '0891234567', 'profileUser.jpg'),
(3, 'mumtaz', '$2y$10$swqnk2kOO58difHNE7dMi.zgq6I3q2dZAr.EdBJ1DxBeCFM1J25.6', 'mumtaz', 'user', 'Tenaga Kependidikan (Non-Pendidik)', 'mumtaz@gmail.com', '0897654322', 'profil_3_1795655647.jpg'),
(4, 'admin', '$2y$10$LptV4qkqVjBPCiT1kMVWFuppyelCWEi22r2xL/mOj09CZvfO3C.8O', 'admin 1', 'admin', NULL, 'ahmadazkaalhusaini@gmail.com', '081234567890', 'profileAdmin.jpeg');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `absen`
--
ALTER TABLE `absen`
  ADD KEY `fk_absen_id` (`ID`);

--
-- Indeks untuk tabel `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `login`
--
ALTER TABLE `login`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `absen`
--
ALTER TABLE `absen`
  ADD CONSTRAINT `fk_absen_id` FOREIGN KEY (`ID`) REFERENCES `login` (`ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
