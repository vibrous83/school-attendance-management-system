import "./styles.css"
import { BrowserRouter, Routes, Route} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ProtectedRoute from "../Components/ProtectedRoute";

import Header from "../Components/Header"
import Footer from "../Components/Footer"
import Navbar from "../Components/Navbar"

import Login from "../Pages/Login"
import DashboardPage from "../Pages/DashboardPage"
import Attendance from "../Pages/Attendance"
import HistoryPage from "../Pages/HistoryPage"
import Setting from "../Pages/Setting"
import Report from "../Pages/Report_admin"

function MainLayout(){  
    return(
    <>
        <Header/>
        <div className="container-fluid">
            <div className="row">
                <Navbar/>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage/>}/>
                    <Route path="/attendance" element={<Attendance/>}/>
                    <Route path="/history" element={<HistoryPage/>}/>
                    <Route path="/settings" element={<Setting/>}/>
                    <Route path="/report" element={<Report/>}/>
                </Routes>
                <Footer/>
            </div>
        </div>
    </>
    )
}

function App() {
    return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/*" element={<MainLayout />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </>
    );
}


export default App;