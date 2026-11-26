
import { useState, useEffect } from "react";
import axios from "axios";

const keDb = (t) => {
    const [y, m, d] = (t || "").split("-");
    return y ? `${d}-${m}-${y}` : "";
};

function History() {

    const [history, setHistory] = useState([]);
    const [tanggal, setTanggal] = useState("");

    // Mengambil data history
    const getHistory = (selectedDate = "") => {
        axios.get("/YPIA/Backend/getHistory.php", {
            params: selectedDate ? { tanggal: selectedDate } : {},
            withCredentials: true
        })
        .then((response) => {
            if (response.data.success) {
                setHistory(response.data.data);
            }
        })
        .catch((error) => {
            console.error(error);
        });
    };

    // Mengambil seluruh history saat halaman dibuka
    useEffect(() => {
        getHistory();
    }, []);

    // Pencarian tanggal
    const handleSearch = (e) => {
        e.preventDefault();
        getHistory(keDb(tanggal));
    };

    // Tampilkan semua data
    const handleShowAll = () => {
        setTanggal("");
        getHistory();
    };

    return(
    <>

    {/*User*/}
    <div className="col-md-10 table-container">
        <div className="row">
        <div className="col-md-12 p-4">
            <h1><i className="bi bi-clock-history"></i> Attendance History</h1><br/>
            <p>Halaman ini menampilkan riwayat absensi, termasuk waktu hadir, waktu keluar, 
            dan status kehadiran untuk setiap hari. Gunakan fitur pencarian untuk melihat data berdasarkan tanggal tertentu.</p>
        </div>
        </div>
    
    <hr width="100%" size="2"/>
    
    {/* Datepicker and Buttons */}
    <div className="row">
        <div className="my-4">
        <form className="row g-3" onSubmit={handleSearch}>
            <div className="col-auto">
            <input 
                type="date" 
                className="form-control" 
                id="datepicker" 
                name="tanggal" 
                placeholder="Select Date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
            />
            </div>
            <div className="col-auto">
            <button type="submit" className="btn btn-primary mb-3">
                <i className="bi bi-search"></i> Cari Tanggal
            </button>
            </div>
            <div className="col-auto">
            <button 
                type="button" 
                className="btn btn-secondary mb-3" 
                onClick={handleShowAll}
            >
                Tampilkan Semua
            </button>
            </div>
        </form>
        </div>
        
        {/* Table */}
        <div className="table-responsive">
            <table className="table table-striped table-bordered text-center">
            <thead className="table-dark">
                <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Jam Hadir</th>
                <th scope="col">Jam Keluar</th>
                <th scope="col">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                {history.length > 0 ? (
                    history.map((item, index) => (
                        <tr key={index}>
                            <td>{item.tanggal}</td>
                            <td>{item.masuk}</td>
                            <td>{item.keluar}</td>
                            <td>{item.keterangan}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">Tidak ada data absensi.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>

    </div>

    </div>
    </>
    )
}

export default History;