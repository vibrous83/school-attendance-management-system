import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar(){  

    const navigate = useNavigate();
    const [level, setLevel] = useState(null);

    useEffect(() => {
        axios.get("/YPIA/Backend/getUserData.php", { withCredentials: true })
            .then((res) => setLevel(res.data.level))
            .catch((err) => console.error(err));
    }, []);

    const handleLogout = () => {
        axios.post(
            "/YPIA/Backend/cblogout.php",
            {},
            { withCredentials: true }
        )
        .then((response) => {
            if (response.data.success) {
                navigate("/login");
            }
        })
        .catch((error) => {
            console.error(error);
        });
    };

    const isAdmin = level === "admin";

        return(
    <>
    <div className="col-md-2 bg-light min-vh-100">
        <nav className="navbar navbar-expand-md navbar-light flex-column align-items-start">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="nav flex-column">
                    <li className="nav-item mb-3 pt-3">
                        <Link className="nav-link text-dark d-flex align-items-center" aria-current="page" to="/dashboard">
                            <i className="bi bi-speedometer2"></i>ㅤDashboard
                        </Link>
                    </li>

                    {level !== null && (
                        <>
                            {isAdmin ? (
                                <li className="nav-item mb-3">
                                    <Link className="nav-link text-dark" to="/report">
                                        <i className="bi bi-bar-chart"></i>ㅤReport
                                    </Link>
                                </li>
                            ) : (
                                <li className="nav-item mb-3">
                                    <Link className="nav-link text-dark" to="/attendance">
                                        <i className="bi bi-bar-chart"></i>ㅤAttendance
                                    </Link>
                                </li>
                            )}

                            <li className="nav-item mb-3">
                                <Link className="nav-link text-dark" to="/history">
                                    <i className="bi bi-clock-history"></i>ㅤHistory
                                </Link>
                            </li>

                            {!isAdmin && (
                                <li className="nav-item mb-3">
                                    <Link className="nav-link text-dark" to="/settings">
                                        <i className="bi bi-gear"></i>ㅤSettings
                                    </Link>
                                </li>
                            )}
                        </>
                    )}

                    <li className="nav-item mb-3">
                        <a style={{color: "red"}} className="nav-link" href="#" onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}>
                            <i className="bi bi-box-arrow-right"></i>ㅤLogout
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
    </>
    )
}

export default Navbar;