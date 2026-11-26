import { useState, useEffect } from "react";
import axios from "axios";

const API  = "/YPIA/Backend/getHistoryAdmin.php";
const FOTO = "/YPIA/Bukti/";

const keInput = (t) => {
    const [d, m, y] = (t || "").split("-");
    return y ? `${y}-${m}-${d}` : "";
};
const keDb = (t) => {
    const [y, m, d] = (t || "").split("-");
    return y ? `${d}-${m}-${y}` : "";
};

function BuktiFile({ nama, label }) {
    if (!nama) return null;
    const pdf = nama.toLowerCase().endsWith(".pdf");
    return (
        <div className="mb-3">
            <h6>{label}</h6>
            {pdf ? (
                <a href={FOTO + nama} target="_blank" rel="noreferrer">Buka PDF</a>
            ) : (
                <img src={FOTO + nama} alt={label} className="img-fluid" style={{ maxWidth: 300 }} />
            )}
        </div>
    );
}

function HistoryAdmin() {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(null);
    const [pesan, setPesan] = useState(null);
    const [tanggal, setTanggal] = useState("");      // yyyy-mm-dd
    const [filterAktif, setFilterAktif] = useState("");  // dd-mm-yyyy
    const [editing, setEditing] = useState(null);
    const [buktiRow, setBuktiRow] = useState(null);
    const [loading, setLoading] = useState(false);

    const muat = (tanggalDb = "") => {
        setRows(null);
        setError(null);
        axios.get(API, { params: { tanggal: tanggalDb }, withCredentials: true })
            .then((res) => {
                setRows(res.data.data);
                setFilterAktif(tanggalDb);
            })
            .catch((err) => {
                console.error(err);
                if (err.response?.status === 403) {
                    setError("Halaman ini hanya untuk admin.");
                } else if (err.response?.status === 401) {
                    setError("Silakan login terlebih dahulu.");
                } else {
                    setError("Gagal memuat riwayat.");
                }
            });
    };

    useEffect(() => {
        muat("");
    }, []);

    const cari = (e) => {
        e.preventDefault();
        muat(keDb(tanggal));
    };

    const tampilkanSemua = () => {
        setTanggal("");
        muat("");
    };

    const bukaEdit = (r) => {
        setEditing({
            ID: r.ID,
            tanggalLama: r.tanggal,
            masuk: r.masuk ?? "",
            keluar: r.keluar ?? "",
            tanggal: keInput(r.tanggal),
            keterangan: r.keterangan ?? "",
        });
    };

    const simpanEdit = async () => {
        setLoading(true);
        setPesan(null);
        try {
            const res = await axios.post(
                API,
                {
                    aksi: "edit",
                    ID: editing.ID,
                    tanggal: editing.tanggalLama,
                    masuk: editing.masuk,
                    keluar: editing.keluar,
                    tanggal_baru: keDb(editing.tanggal),
                    keterangan: editing.keterangan,
                },
                { withCredentials: true }
            );
            setPesan({ tipe: "success", teks: res.data.message });
            setEditing(null);
            muat(filterAktif);
        } catch (err) {
            setPesan({ tipe: "danger", teks: err.response?.data?.message || "Terjadi kesalahan." });
        } finally {
            setLoading(false);
        }
    };

    const hapus = async (r) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus bagian ini?")) return;
        setPesan(null);
        try {
            const res = await axios.post(
                API,
                { aksi: "hapus", ID: r.ID, tanggal: r.tanggal },
                { withCredentials: true }
            );
            setPesan({ tipe: "success", teks: res.data.message });
            muat(filterAktif);
        } catch (err) {
            setPesan({ tipe: "danger", teks: err.response?.data?.message || "Terjadi kesalahan." });
        }
    };

    if (error) {
        return <div className="col-md-10 p-4"><div className="alert alert-danger">{error}</div></div>;
    }

    const adaBukti = (r) => r.bukti || r.bukti_keluar;
    const izinRow = (r) => ["IZIN", "SAKIT"].includes((r.masuk || "").toUpperCase());

    return (
    <>
    <div className="col-md-10 p-4 d-flex flex-column">
        <div className="row">
            <div className="col-md-12 p-4">
                <h1><i className="bi bi-clock-history"></i> Attendance History</h1><br/>
                <p>Halaman ini menampilkan riwayat absensi Karyawan, termasuk waktu hadir, waktu keluar, 
                    dan status kehadiran untuk setiap hari. Gunakan fitur pencarian untuk melihat data berdasarkan tanggal tertentu.</p>
            </div>
        </div>

        <hr width="100%" size="2"/>

        <form className="row g-3 my-2" onSubmit={cari}>
            <div className="col-auto">
                <input
                    type="date"
                    className="form-control"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                />
            </div>
            <div className="col-auto">
                <button type="submit" className="btn btn-primary" disabled={!tanggal}>
                    <i className="bi bi-search"></i> Cari Tanggal
                </button>
            </div>
            <div className="col-auto">
                <button type="button" className="btn btn-secondary" onClick={tampilkanSemua}>
                    Tampilkan Semua
                </button>
            </div>
        </form>

        {pesan && (
            <div className={`alert alert-${pesan.tipe} text-center`}>{pesan.teks}</div>
        )}

        <div className="table-responsive pt-4">
            <table className="table table-striped table-bordered text-center align-middle">
                <thead className="table-dark">
                    <tr>
                        <th>Tanggal</th>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Jam Hadir</th>
                        <th>Jam Keluar</th>
                        <th>Keterangan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {rows === null && (
                        <tr><td colSpan="7">Memuat riwayat...</td></tr>
                    )}
                    {rows !== null && rows.length === 0 && (
                        <tr><td colSpan="7">Tidak ada data.</td></tr>
                    )}
                    {rows && rows.map((r) => (
                        <tr key={`${r.ID}-${r.tanggal}`}>
                            <td>{r.tanggal}</td>
                            <td>{r.ID}</td>
                            <td>{r.nama}</td>
                            <td>{r.masuk}</td>
                            <td>{r.keluar}</td>
                            <td>{r.keterangan}</td>
                            <td>
                                <button className="btn btn-warning btn-sm m-1" onClick={() => bukaEdit(r)}>
                                    <i className="bi bi-pencil-square"></i> Edit
                                </button>
                                <button className="btn btn-danger btn-sm m-1" onClick={() => hapus(r)}>
                                    <i className="bi bi-trash"></i> Hapus
                                </button>
                                <button className="btn btn-info btn-sm m-1" onClick={() => setBuktiRow(r)}>
                                    <i className="bi bi-file-earmark-text"></i> Bukti
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>

    {/* Pop-up Edit */}
    {editing && (
        <>
        <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title"><i className="bi bi-pencil-square"></i> Edit Absen</h5>
                        <button type="button" className="btn-close" onClick={() => setEditing(null)}></button>
                    </div>
                    <div className="modal-body">
                        <label className="form-label">ID</label>
                        <input className="form-control mb-3" value={editing.ID} disabled />

                        <label className="form-label">Jam Masuk</label>
                        <input
                            className="form-control mb-3"
                            value={editing.masuk}
                            onChange={(e) => setEditing({ ...editing, masuk: e.target.value })}
                        />

                        <label className="form-label">Jam Keluar</label>
                        <input
                            className="form-control mb-3"
                            value={editing.keluar}
                            onChange={(e) => setEditing({ ...editing, keluar: e.target.value })}
                        />

                        <label className="form-label">Tanggal</label>
                        <input
                            type="date"
                            className="form-control mb-3"
                            value={editing.tanggal}
                            onChange={(e) => setEditing({ ...editing, tanggal: e.target.value })}
                        />

                        <label className="form-label">Keterangan</label>
                        <input
                            className="form-control"
                            value={editing.keterangan}
                            onChange={(e) => setEditing({ ...editing, keterangan: e.target.value })}
                        />
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setEditing(null)}>Kembali</button>
                        <button className="btn btn-success" onClick={simpanEdit} disabled={loading || !editing.tanggal}>
                            <i className="bi bi-save"></i> {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop show"></div>
        </>
    )}

    {/* Pop-up Bukti */}
    {buktiRow && (
        <>
        <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title"><i className="bi bi-file-earmark-text"></i> Bukti Absen</h5>
                        <button type="button" className="btn-close" onClick={() => setBuktiRow(null)}></button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-1"><b>ID:</b> {buktiRow.ID} &nbsp; <b>Nama:</b> {buktiRow.nama}</p>
                        <p className="mb-1"><b>Keterangan:</b> {buktiRow.keterangan}</p>
                        <p><b>Tanggal:</b> {buktiRow.tanggal}</p>
                        <hr/>
                        {!adaBukti(buktiRow) && <p>Tidak ada bukti.</p>}
                        <BuktiFile nama={buktiRow.bukti} label={izinRow(buktiRow) ? "Bukti izin / sakit" : "Foto masuk"} />
                        <BuktiFile nama={buktiRow.bukti_keluar} label="Foto keluar" />
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setBuktiRow(null)}>Kembali</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop show"></div>
        </>
    )}
    </>
    )
}

export default HistoryAdmin;