import { useState, useEffect } from "react";
import axios from "axios";
import History from "./History";
import HistoryAdmin from "./History_admin";

function HistoryPage() {
    const [level, setLevel] = useState(null);

    useEffect(() => {
        axios.get("/YPIA/Backend/getUserData.php", { withCredentials: true })
            .then((res) => setLevel(res.data.level))
            .catch((err) => console.error(err));
    }, []);

    if (level === null) {
        return <p>Memuat...</p>;
    }

    return level === "admin" ? <HistoryAdmin /> : <History />;
}

export default HistoryPage;