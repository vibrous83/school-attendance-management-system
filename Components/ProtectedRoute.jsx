
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

function ProtectedRoute() {

    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        axios.get("/YPIA/Backend/getUserData.php", {
            withCredentials: true
        })
        .then((response) => {
            setIsAuthenticated(response.data.success);
        })
        .catch(() => {
            setIsAuthenticated(false);
        });
    }, []);

    if (isAuthenticated === null) {
        return <p>Memeriksa session...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
