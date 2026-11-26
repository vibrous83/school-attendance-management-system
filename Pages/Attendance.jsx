import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Clock from "../Components/Clock"

function Attendance(){  

    const [user, setUser] = useState(null);
    const [lokasi, setLokasi] = useState(null);      // {latitude, longitude}
    const [statusGps, setStatusGps] = useState("Belum aktif");
    const [kameraAktif, setKameraAktif] = useState(false);
    const [foto, setFoto] = useState(null);          // Blob foto
    const [fotoUrl, setFotoUrl] = useState(null);    // untuk preview
    const [loading, setLoading] = useState(false);
    const [pesan, setPesan] = useState(null);        // {tipe, teks}
    const [sudahAbsen, setSudahAbsen] = useState(null); // null = belum tahu
    const [sudahIzin, setSudahIzin] = useState(false);
    const [sudahKeluar, setSudahKeluar] = useState(false);
    const [formIzin, setFormIzin] = useState(false);
    const [jenisIzin, setJenisIzin] = useState("IZIN");
    const [alasan, setAlasan] = useState("");
    const [buktiIzin, setBuktiIzin] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        axios.get(
            "/YPIA/Backend/getUserData.php",
            { withCredentials: true }
        )
        .then((res) => {
            setUser(res.data);
        })
        .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        return () => matikanKamera();
    }, []);

    useEffect(() => {
    axios.get("/YPIA/Backend/getAbsensi.php", { withCredentials: true })
        .then((res)  => {
            setSudahAbsen(res.data.sudah_absen);
            setSudahIzin(res.data.izin);
            setSudahKeluar(res.data.sudah_keluar);
        })
        .catch((err) => console.error(err));
}   , []);

    // GPS 
    const aktifkanGps = () => {
        if (!navigator.geolocation) {
            setStatusGps("Browser tidak mendukung lokasi");
            return;
        }
        setStatusGps("Mencari lokasi...");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLokasi({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                setStatusGps("Aktif ✓");
            },
            () => {
                setLokasi(null);
                setStatusGps("Gagal. Izinkan akses lokasi di browser.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    //Kamera
    const nyalakanKamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            setKameraAktif(true);
        } catch (err) {
            setPesan({ tipe: "danger", teks: "Kamera tidak bisa diakses. Izinkan akses kamera." });
        }
    };

    const matikanKamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setKameraAktif(false);
    };

    const ambilFoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            setFoto(blob);
            setFotoUrl(URL.createObjectURL(blob));
            matikanKamera();
        }, "image/jpeg", 0.8);
    };

    const ulangFoto = () => {
        setFoto(null);
        setFotoUrl(null);
        nyalakanKamera();
    };

    //Kirim absen
    const kirimAbsen = async (aksi = "hadir") => {
    if (!lokasi) {
        setPesan({ tipe: "warning", teks: "Aktifkan GPS dulu." });
        return;
    }
    if (!foto) {
        setPesan({ tipe: "warning", teks: "Ambil foto dulu." });
        return;
    }

    const formData = new FormData();
    formData.append("aksi", aksi);
    formData.append("foto", foto, "absen.jpg");
    formData.append("latitude", lokasi.latitude);
    formData.append("longitude", lokasi.longitude);

    setLoading(true);
    setPesan(null);
    try {
        const res = await axios.post(
            "/YPIA/Backend/getAbsensi.php",
            formData,
            { withCredentials: true }
        );
        setPesan({ tipe: "success", teks: res.data.message });
        setFoto(null);
        setFotoUrl(null);
        if (aksi === "keluar") {
            setSudahKeluar(true);
        } else {
            setSudahAbsen(true);
        }
    } catch (err) {
        if (err.response?.status === 409) {
            if (aksi === "keluar") {
                setSudahKeluar(true);
            } else {
                setSudahAbsen(true);
            }
        }
        const teks = err.response?.data?.message || "Terjadi kesalahan.";
        setPesan({ tipe: "danger", teks });
    } finally {
        setLoading(false);
    }
    };

    const kirimIzin = async () => {
        if (!alasan.trim() || !buktiIzin) {
            setPesan({ tipe: "warning", teks: "Isi alasan dan pilih file bukti." });
            return;
        }

        const formData = new FormData();
        formData.append("aksi", "izin");
        formData.append("ket", jenisIzin);
        formData.append("alasan", alasan);
        formData.append("bkt", buktiIzin);

        setLoading(true);
        setPesan(null);
        try {
            const res = await axios.post(
                "/YPIA/Backend/getAbsensi.php",
                formData,
                { withCredentials: true }
            );
            setPesan({ tipe: "success", teks: res.data.message });
            setSudahAbsen(true);
            setSudahIzin(true);
            setFormIzin(false);
            setAlasan("");
            setBuktiIzin(null);
        } catch (err) {
            if (err.response?.status === 409) {
                setSudahAbsen(true);
                setFormIzin(false);
            }
            const teks = err.response?.data?.message || "Terjadi kesalahan.";
            setPesan({ tipe: "danger", teks });
        } finally {
            setLoading(false);
        }
    };

    return(
    <>
    <div className="col-md-10 p-4 d-flex flex-column">
        <div className="row">
            <div className="col-md-8 p-4">
                <h1><i className="bi bi-bar-chart"></i> Attendance</h1><br/>
                <p>Waktu Pergi : 08:00:00</p>
                <p>Waktu Pulang : 17:00:00</p>
            </div>
            <div className="col-md-4 p-4 text-center">
                <h2><i className="bi bi-activity"></i>  Status Kehadiran</h2><br/>
                <h5 className={`d-flex justify-content-center p-3 text-white ${
                    sudahKeluar ? "bg-primary" : sudahIzin ? "bg-warning" : sudahAbsen ? "bg-success" : "bg-secondary"}`}>
                    {sudahAbsen === null ? "Memuat..."
                        : sudahKeluar ? "Sudah Pulang"
                        : sudahIzin ? "Izin / Sakit"
                        : sudahAbsen ? "Sudah Absen"
                        : "Belum Absen"}
                </h5>
            </div>
        </div>
        
        <hr width="100%" size="2"/><br/>
        <div className="row">
            <div className="col-md-8 px-4">
                <div>Waktu: <b><Clock/></b></div>
            </div>
             <div className="col-md-4 px-4 text-center">
                <p>Status GPS: <b>{statusGps}</b></p>
             </div>
        </div>
        <div className="row pt-4">

            <h3 className="text-center mt-4">Selamat Datang {user?.nama}! Silakan Mengisi Absen</h3><br/><br/>
            <div className="col-md-12 d-flex align-items-center flex-column table-container">
                 
                <button className="btn btn-outline-primary mb-3" style={{ width: "200px", height: "48px" }} onClick={aktifkanGps}>
                    <i className="bi bi-geo-alt"></i> Aktifkan GPS
                </button>

                <div className="mb-3">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: 320, display: kameraAktif ? "block" : "none", margin: "0 auto" }}
                    />
                    {fotoUrl && (
                        <img src={fotoUrl} alt="Foto absen" style={{ width: 320 }} />
                    )}
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>

                {!kameraAktif && !fotoUrl && (
                    <button className="btn btn-secondary" style={{ width: "200px", height: "48px" }} onClick={nyalakanKamera}>
                        <i className="bi bi-camera"></i> Buka Kamera
                    </button>
                )}
                {kameraAktif && (
                    <button className="btn btn-secondary" onClick={ambilFoto}>
                        <i className="bi bi-camera-fill"></i> Ambil Foto
                    </button>
                )}
                {fotoUrl && (
                    <button className="btn btn-outline-secondary" onClick={ulangFoto}>
                        Foto Ulang
                    </button>
                )}
            </div>
        </div>

        {pesan && (
            <div className={`alert alert-${pesan.tipe} text-center mt-3`}>
                {pesan.teks}
            </div>
        )}

        <div className="row mt-3">
            <div className="col-md-12 text-center">
                <button
                    className="btn btn-primary"
                    onClick={() => kirimAbsen("hadir")}
                    disabled={loading || !foto || !lokasi || sudahAbsen !== false}
                >
                    {loading ? "Mengirim..." : "Hadir"}
                </button>
                <button
                    className="btn btn-danger ms-2"
                    onClick={() => kirimAbsen("keluar")}
                    disabled={loading || !foto || !lokasi || sudahAbsen !== true || sudahIzin || sudahKeluar}
                >Keluar
                </button>
                <button
                    className="btn btn-warning ms-2"
                    onClick={() => setFormIzin(!formIzin)}
                    disabled={sudahAbsen !== false}
                >Izin
                </button>
            </div>
        </div>

        {formIzin && (
    <div className="row mt-4 justify-content-center">
        <div className="col-md-6">
            <h5 className="text-center mb-3">Mohon Berikan Keterangan Izin</h5>

            <label className="form-label">Keterangan</label>
            <select
                className="form-select mb-3"
                value={jenisIzin}
                onChange={(e) => setJenisIzin(e.target.value)}
            >
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
            </select>

            <label className="form-label">Alasan</label>
            <input
                type="text"
                className="form-control mb-3"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
            />

            <label className="form-label">Bukti (JPG, PNG, atau PDF, maks 2 MB)</label>
            <input
                type="file"
                className="form-control mb-3"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setBuktiIzin(e.target.files[0])}
            />

            <div className="text-center">
                <button className="btn btn-success px-5" onClick={kirimIzin} disabled={loading}>
                    {loading ? "Mengirim..." : "Kirim"}
                </button>
                <button className="btn btn-secondary px-5 ms-2" onClick={() => setFormIzin(false)}>
                    Batal
                </button>
            </div>
        </div>
    </div>
    )}

    </div>
    </>
    )
}

export default Attendance;