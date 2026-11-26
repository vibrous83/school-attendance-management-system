import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logoInstansi from "../Assets/logoinstansi.jpg";
import "../src/styles.css"

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "../YPIA/Backend/cblogin.php",
                {
                    username: username,
                    password: password
                },
                {
                    withCredentials: true
                }
            );

            const data = response.data;

        if (data.success) {
            if (data.level === "admin" || data.level === "user") {
                navigate("/dashboard");
            } else {
                setError("Level pengguna tidak dikenali.");
            }
        } else {
            setError(data.message);
        }

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Gagal terhubung ke server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex flex-column flex-md-row flex-wrap justify-content-center align-items-center min-vh-100">
            <div className="d-flex align-items-center flex-column logoypi">
                <h1 className="text-center mb-3">SISTEM ABSENSI <br/> YPI ADABIYAH</h1>
                <img  src={logoInstansi} alt="Logo" className="logo-login"/>
            </div>
            <div className="card shadow p-4 login-card">
                <div className="text-center mb-4">
                    <h2>Welcome</h2>
                    <p>Silakan login ke akun Anda</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Masukkan username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={loading}
                    >
                        {loading ? "Memproses..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
