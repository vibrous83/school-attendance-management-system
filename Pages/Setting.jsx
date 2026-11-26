import { useState, useEffect } from "react";
import axios from "axios";

function Setting(){

    const [user, setUser] = useState(null);

    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
            axios.get("/YPIA/Backend/getUserData.php", {
                withCredentials: true
            })
        .then((response) => {
            setUser(response.data);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);

    // Proses ganti password
    const handleChangePassword = (e) => {
        e.preventDefault();
        setMessage("");

        axios.post(
            "/YPIA/Backend/changePassword.php",
            {
                password: password,
                new_password: newPassword
            },
            {
                withCredentials: true
            }
        )
        .then((response) => {
            setMessage(response.data.message);

            if (response.data.success) {
                setPassword("");
                setNewPassword("");
            }
        })
        .catch((error) => {
            setMessage(
                error.response?.data?.message ||
                "Terjadi kesalahan saat mengubah password."
            );
        });
    };

    return(
    <>

    {/*User*/}
    <div className="col-md-10 table-container">
        <div className="row">
        <div className="col-md-12 p-4">
            <h1><i className="bi bi-gear"></i> Settings</h1>
        </div>
        </div>
        
        <hr width="100%" size="2"/>

        <div className="container bootstrap snippets bootdeys">
            <div className="row d-flex justify-content-center">
                <div className="col-12 col-sm-10">
                    {/*Avatar*/}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4 className="card-title">Profile</h4>
                        </div>
                        <div className="card-body text-center">
                            <img src={user?.gambar ? `/YPIA/Assets/Foto/${user.gambar}` : ""}
                                 style={{width: "300px", height: "400px"}}
                                 alt="Profile Picture"
                            />
                        </div>
                        <div className="mb-3 row">
                            <div className="col-sm-12 d-flex justify-content-center">
                                <a href={user?.gambar ? `/YPIA/Assets/Foto/${user.gambar}` : "#"} 
                                    target="_blank" 
                                    className="btn btn-secondary">View</a>
                            </div>
                        </div>
                    </div>

                    {/*User Info*/}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4 className="card-title">User Info</h4>
                        </div>
                        
                        <div className="card-body">
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label">Location</label>
                                <div className="col-sm-10">
                                    <select className="form-select" defaultValue="MI Adabiyah 2 Palembang" disabled>
                                        <option>MI Adabiyah 1 Palembang</option>
                                        <option>MI Adabiyah 2 Palembang</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label">Position</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" value={user?.jabatan} readOnly/>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    {/*Contact Info*/}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4 className="card-title">Contact Info</h4>
                        </div>
                        <div className="card-body">
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label">E-mail address</label>
                                <div className="col-sm-10">
                                    <input type="email" className="form-control" value={user?.email} readOnly/>
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label">Mobile number</label>
                                <div className="col-sm-10">
                                    <input type="tel" className="form-control" value={user?.phone} readOnly/>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    {/*Security*/}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4 className="card-title">Security</h4>
                        </div>
                        <div className="card-body">
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label">Password</label>
                                <div className="col-sm-10">
                                    <input type="password" name="password" className="form-control" placeholder="Enter current password" value={password}
                                            onChange={(e) => setPassword(e.target.value)} required/>
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label">New Password</label>
                                <div className="col-sm-10">
                                    <input type="password" name="new_password" className="form-control" placeholder="Enter new password" value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)} required/>
                                </div>
                            </div>
                                
                            {message && (
                                <div className="mb-3">
                                    <p>{message}</p>
                                </div>
                            )}

                            <div className="mb-3 row">
                                <div className="col-sm-10 offset-sm-2">
                                    <button type="submit" name="change_password" className="btn btn-primary">Submit</button>
                                    <button type="reset" className="btn btn-secondary ms-2" onClick={() => {
                                                setPassword("");
                                                setNewPassword("");
                                                setMessage("");
                                    }}>Reset</button>
                                </div>
                            </div>
                        </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    </>
    )
}

export default Setting;