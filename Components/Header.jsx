import logoInstansi from "../Assets/logoinstansi.jpg";
import { useState, useEffect } from "react";
import axios from "axios";

function Header(){  

    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get(
            "/YPIA/Backend/getUserData.php",
            { withCredentials: true }
        )
        .then((response) => {
            setUser(response.data);
        })
        .catch((error) => console.error(error));
    }, []);

    return(
    <>
        <div className="container-fluid p-4 bg-success text-white">
            <div className="header-container">
                <div className="logo-container">
                    <img style={{width: "80px", height: "80px"}} src={logoInstansi} alt="Logo"/>
                    <h1 className="fs-18">YPI ADABIYAH PALEMBANG</h1>
                </div>
                <div className="profile">
                    {user?.gambar && (
                        <img src={`/YPIA/Assets/Foto/${user.gambar}`} alt="Profile Picture" />
                    )}
                    <p className="mt-3" style={{textTransform: "capitalize"}}>{user?.nama}</p>
                </div>
            </div>
        </div>
    </>
    )
}

export default Header;