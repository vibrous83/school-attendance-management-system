import { useState, useEffect } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import DashboardAdmin from "./Dashboard_admin";

function DashboardPage() {
    const [level, setLevel] = useState(null);

    useEffect(() => {
        axios.get("/YPIA/Backend/getUserData.php", { withCredentials: true })
            .then((res) => setLevel(res.data.level))
            .catch((err) => console.error(err));
    }, []);

    if (level === null) {
        return <p>Memuat...</p>;
    }

    return level === "admin" ? <DashboardAdmin /> : <Dashboard />;
}

export default DashboardPage;