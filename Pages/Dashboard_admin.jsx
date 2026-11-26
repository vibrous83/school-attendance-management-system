import { useState, useEffect } from "react";
import axios from "axios";
import Clock from "../Components/Clock";

function DashboardAdmin() {

    const [data, setData] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            axios.get("/YPIA/Backend/getDashboard_Admin.php", {
                withCredentials: true
            }),
            axios.get("/YPIA/Backend/getUserData.php", {
                withCredentials: true
            })
        ])
        .then(([dashboardResponse, userResponse]) => {
            if (dashboardResponse.data.success) {
                setData(dashboardResponse.data);
            }
            if (userResponse.data.success) {
                setUser(userResponse.data);
            }
        })
        .catch((err) => {
            console.error(err);
            if (err.response?.status === 403) {
                setError("Halaman ini hanya untuk admin.");
            } else if (err.response?.status === 401) {
                setError("Silakan login terlebih dahulu.");
            } else {
                setError("Gagal memuat dashboard.");
            }
        });
    }, []);

    if (error) {
        return <div className="col-md-10 p-4"><div className="alert alert-danger">{error}</div></div>;
    }

    if (!user || !data) {
        return <p>Memuat dashboard...</p>;
    }

    return (
    <>
    <div className="col-md-10 p-4 d-flex flex-column">
        <div className="row">
            <div className="col-md-8 p-4">
                <h1><i className="bi bi-speedometer2"></i> Dashboard</h1><br/>
                <h5>Selamat Datang {user.nama}!</h5>
            </div>
            <div className="col-md-4 p-4 text-center">
                <h1><i className="bi bi-clock"> Waktu</i></h1><br/>
                <Clock/>
            </div>
            <div className="col-md-12 p-4">
                <p>Sistem absensi YPI Adabiyah Palembang adalah sistem yang dibuat untuk mempermudah pegawai dalam melakukan absensi harian secara digital. 
                    Melalui aplikasi ini, pegawai dapat melakukan absen masuk dan keluar dengan mudah serta memantau jumlah kehadiran, izin, dan sakit secara real-time. 
                    Aplikasi ini membantu pegawai mengelola kehadiran dengan lebih efisien dan akurat.</p>
            </div>
        </div>

        <hr width="100%" size="2"/>

        <div className="row mt-4 d-flex justify-content-center">
            <div className="col-md-3 mx-3 d-flex flex-column align-items-center p-3 mb-2 bg-info text-white">
                <p>Jumlah Karyawan</p>
                <p style={{fontSize: "36px"}}><b>{data.jumlah_karyawan}</b></p>
            </div>

            <div className="col-md-3 mx-3 d-flex flex-column align-items-center p-3 mb-2 bg-secondary text-white">
                <p>Jumlah Absensi</p>
                <p style={{fontSize: "36px"}}><b>{data.jumlah_absensi}</b></p>
            </div>

            <div className="col-md-3 mx-3 d-flex flex-column align-items-center p-3 mb-2 text-white" style={{backgroundColor: "salmon"}}>
                <p>Jumlah Jabatan</p>
                <p style={{fontSize: "36px"}}><b>{data.jumlah_jabatan}</b></p>
            </div>
        </div>

        <div className="row mt-4 d-flex justify-content-center">
            <div className="col-md-3 mx-3 d-flex flex-column align-items-center p-3 mb-2 bg-success text-white">
                <p>Jumlah Kehadiran</p>
                <p style={{fontSize: "36px"}}><b>{data.persentase_kehadiran}</b>%</p>
                <p>{data.kehadiran}/{data.jumlah_absensi}</p>
            </div>

            <div className="col-md-3 mx-3 d-flex flex-column align-items-center p-3 mb-2 bg-warning text-white">
                <p>Jumlah Izin</p>
                <p style={{fontSize: "36px"}}><b>{data.persentase_izin}</b>%</p>
                <p>{data.izin}/{data.jumlah_absensi}</p>
            </div>

            <div className="col-md-3 mx-3 d-flex flex-column align-items-center p-3 mb-2 bg-danger text-white">
                <p>Jumlah Sakit</p>
                <p style={{fontSize: "36px"}}><b>{data.persentase_sakit}</b>%</p>
                <p>{data.sakit}/{data.jumlah_absensi}</p>
            </div>
        </div>

        <div className="row mt-4 d-flex justify-content-center">
            <div className="col mt-12 d-flex justify-content-center">
                <iframe 
                    src="https://calendar.google.com/calendar/embed?src=gamerazka699%40gmail.com&ctz=Asia%2FJakarta" 
                    style={{border: 0}} width="750" height="450"></iframe>
            </div>
        </div>
    </div>
    </>
    )
}

export default DashboardAdmin;