
import { useState, useEffect } from "react";
import axios from "axios";

const API  = "/YPIA/Backend/getReport_admin.php";
const FOTO = "/YPIA/Assets/Foto/";
const JABATAN = [
    "Pendidik",
    "Tenaga Kependidikan (Non-Pendidik)",
    "Pendukung Operasional",
];
const KOSONG = {
    ID: "", username: "", password: "", nama: "",
    email: "", phone: "", level: "user", jabatan: "",
};

function Report() {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(null);
    const [pesan, setPesan] = useState(null);
    const [cari, setCari] = useState("");
    const [filterAktif, setFilterAktif] = useState("");
    const [form, setForm] = useState(null);       
    const [errForm, setErrForm] = useState(null);
    const [uploadRow, setUploadRow] = useState(null);
    const [berkas, setBerkas] = useState(null);
    const [loading, setLoading] = useState(false);

    const muat = (idCari = "") => {
        setRows(null);
        setError(null);
        axios.get(API, { params: { cari: idCari }, withCredentials: true })
            .then((res) => {
                setRows(res.data.data);
                setFilterAktif(idCari);
            })
            .catch((err) => {
                console.error(err);
                if (err.response?.status === 403) {
                    setError("Halaman ini hanya untuk admin.");
                } else if (err.response?.status === 401) {
                    setError("Silakan login terlebih dahulu.");
                } else {
                    setError("Gagal memuat data user.");
                }
            });
    };

    useEffect(() => {
        muat("");
    }, []);

    const kirimCari = (e) => {
        e.preventDefault();
        muat(cari.trim());
    };

    const tampilkanSemua = () => {
        setCari("");
        muat("");
    };

    const bukaTambah = () => {
        setErrForm(null);
        setForm({ mode: "tambah", ...KOSONG });
    };

    const bukaEdit = (r) => {
        setErrForm(null);
        setForm({
            mode: "edit",
            ID: r.ID,
            username: r.username ?? "",
            password: "",
            nama: r.nama ?? "",
            gambar: r.gambar ?? "",
            email: r.email ?? "",
            phone: r.phone ?? "",
            level: r.level ?? "user",
            jabatan: r.jabatan ?? "",
        });
    };

    const ubah = (kolom, nilai) => setForm({ ...form, [kolom]: nilai });

    const simpan = async () => {
        const tambah = form.mode === "tambah";
        if (!form.username.trim() || !form.nama.trim()) {
            setErrForm("Username dan nama wajib diisi.");
            return;
        }
        if (tambah && (!String(form.ID).trim() || !form.password)) {
            setErrForm("ID dan password wajib diisi.");
            return;
        }

        setLoading(true);
        setErrForm(null);
        try {
            const { mode, ...isi } = form;
            const res = await axios.post(
                API,
                { aksi: tambah ? "tambah" : "edit", ...isi },
                { withCredentials: true }
            );
            setPesan({ tipe: "success", teks: res.data.message });
            setForm(null);
            muat(filterAktif);
        } catch (err) {
            setErrForm(err.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    const hapus = async (r) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
        setPesan(null);
        try {
            const res = await axios.post(
                API,
                { aksi: "hapus", ID: r.ID },
                { withCredentials: true }
            );
            setPesan({ tipe: "success", teks: res.data.message });
            muat(filterAktif);
        } catch (err) {
            setPesan({ tipe: "danger", teks: err.response?.data?.message || "Terjadi kesalahan." });
        }
    };

    const kirimFoto = async () => {
        if (!berkas) {
            setErrForm("Pilih gambar dulu.");
            return;
        }
        const formData = new FormData();
        formData.append("aksi", "upload");
        formData.append("ID", uploadRow.ID);
        formData.append("berkas", berkas);

        setLoading(true);
        setErrForm(null);
        try {
            const res = await axios.post(API, formData, { withCredentials: true });
            setPesan({ tipe: "success", teks: res.data.message });
            setUploadRow(null);
            setBerkas(null);
            muat(filterAktif);
        } catch (err) {
            setErrForm(err.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="col-md-10 p-4"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
    <>
    <div className="col-md-10 p-4 d-flex flex-column">
        <div className="row">
            <div className="col-md-12 p-4">
                <h1><i className="bi bi-bar-chart"></i> Report</h1><br/>
                <p>Halaman ini menampilkan data lengkap pegawai, termasuk ID, Nama, Profil, Jabatan, Username, No telepon, dan Aksi.
                    Gunakan fitur pencarian untuk melihat data berdasarkan ID.</p>
            </div>
        </div>

        <hr width="100%" size="2"/>

        <div className="row g-3 my-2">
            <div className="col-auto">
                <form className="d-flex" onSubmit={kirimCari}>
                    <input
                        type="number"
                        className="form-control me-2"
                        placeholder="ID"
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                    />
                    <button type="submit" className="btn btn-sm btn-primary" disabled={!cari.trim()}>
                        <i className="bi bi-search"></i> Cari ID
                    </button>
                </form>
            </div>
            <div className="col-auto">
                <button className="btn btn-secondary" onClick={tampilkanSemua}>Tampilkan Semua</button>
            </div>
            <div className="col-auto">
                <button className="btn btn-success" onClick={bukaTambah}>
                    <i className="bi bi-plus-circle"></i> Tambah User
                </button>
            </div>
        </div>

        {pesan && (
            <div className={`alert alert-${pesan.tipe} text-center`}>{pesan.teks}</div>
        )}

        <div className="table-responsive pt-4">
            <table className="table table-striped table-bordered text-center align-middle">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Profil</th>
                        <th>Jabatan</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>No Telepon</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {rows === null && (
                        <tr><td colSpan="8">Memuat data...</td></tr>
                    )}
                    {rows !== null && rows.length === 0 && (
                        <tr><td colSpan="8">Tidak ada data.</td></tr>
                    )}
                    {rows && rows.map((r) => (
                        <tr key={r.ID}>
                            <td>{r.ID}</td>
                            <td>{r.nama}</td>
                            <td>
                                {r.gambar ? (
                                    <img
                                        src={FOTO + r.gambar}
                                        alt={r.nama}
                                        width="100"
                                        height="100"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : "-"}
                            </td>
                            <td>{r.jabatan}</td>
                            <td>{r.username}</td>
                            <td>{r.email}</td>
                            <td>{r.phone}</td>
                            <td>
                                <button className="btn btn-warning btn-sm m-1" onClick={() => bukaEdit(r)}>
                                    <i className="bi bi-pencil-square"></i> Edit
                                </button>
                                <button className="btn btn-danger btn-sm m-1" onClick={() => hapus(r)}>
                                    <i className="bi bi-trash"></i> Hapus
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm m-1"
                                    onClick={() => { setErrForm(null); setBerkas(null); setUploadRow(r); }}
                                >
                                    <i className="bi bi-upload"></i> Upload
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>

    {/* Pop-up Tambah / Edit */}
    {form && (
        <>
        <div className="modal d-block" tabIndex="-1" style={{ overflowY: "auto" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {form.mode === "tambah"
                                ? <><i className="bi bi-plus-circle"></i> Tambah User</>
                                : <><i className="bi bi-pencil-square"></i> Edit User</>}
                        </h5>
                        <button type="button" className="btn-close" onClick={() => setForm(null)}></button>
                    </div>
                    <div className="modal-body">
                        {errForm && <div className="alert alert-danger">{errForm}</div>}

                        <label className="form-label">ID</label>
                        <input
                            type="number"
                            className="form-control mb-3"
                            value={form.ID}
                            disabled={form.mode === "edit"}
                            onChange={(e) => ubah("ID", e.target.value)}
                        />

                        <label className="form-label">Username</label>
                        <input
                            className="form-control mb-3"
                            value={form.username}
                            onChange={(e) => ubah("username", e.target.value)}
                        />

                        <label className="form-label">
                            Password {form.mode === "edit" && <small className="text-muted">(kosongkan jika tidak diganti)</small>}
                        </label>
                        <input
                            type="password"
                            className="form-control mb-3"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => ubah("password", e.target.value)}
                        />

                        <label className="form-label">Nama</label>
                        <input
                            className="form-control mb-3"
                            value={form.nama}
                            onChange={(e) => ubah("nama", e.target.value)}
                        />

                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control mb-3"
                            value={form.email}
                            onChange={(e) => ubah("email", e.target.value)}
                        />

                        <label className="form-label">No Telepon</label>
                        <input
                            className="form-control mb-3"
                            value={form.phone}
                            onChange={(e) => ubah("phone", e.target.value)}
                        />

                        <label className="form-label">Level</label>
                        <select
                            className="form-select mb-3"
                            value={form.level}
                            onChange={(e) => ubah("level", e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>

                        <label className="form-label">Jabatan</label>
                        <select
                            className="form-select"
                            value={form.jabatan}
                            onChange={(e) => ubah("jabatan", e.target.value)}
                        >
                            <option value="">Pilih Jabatan</option>
                            {JABATAN.map((j) => (
                                <option key={j} value={j}>{j}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setForm(null)}>Kembali</button>
                        <button className="btn btn-success" onClick={simpan} disabled={loading}>
                            <i className="bi bi-save"></i> {loading ? "Menyimpan..." : form.mode === "tambah" ? "Tambah User" : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop show"></div>
        </>
    )}

    {/* Pop-up Upload */}
    {uploadRow && (
        <>
        <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title"><i className="bi bi-upload"></i> Upload Foto Profil</h5>
                        <button type="button" className="btn-close" onClick={() => setUploadRow(null)}></button>
                    </div>
                    <div className="modal-body">
                        {errForm && <div className="alert alert-danger">{errForm}</div>}
                        <p><b>ID:</b> {uploadRow.ID} &nbsp; <b>Nama:</b> {uploadRow.nama}</p>
                        <label className="form-label">File (JPG, PNG, atau WEBP, maks 2 MB)</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setBerkas(e.target.files[0])}
                        />
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setUploadRow(null)}>Kembali</button>
                        <button className="btn btn-success" onClick={kirimFoto} disabled={loading || !berkas}>
                            <i className="bi bi-save"></i> {loading ? "Mengunggah..." : "Upload"}
                        </button>
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

export default Report;