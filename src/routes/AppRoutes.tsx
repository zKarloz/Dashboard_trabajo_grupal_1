import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";


import MainLayouts from '../layouts/MainLayouts';

import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

function Protected({ children }: { children: ReactNode }) {

    const loggedIn =
        localStorage.getItem("dashboard_logged_in") === "true";

    return loggedIn
        ? children
        : <Navigate to="/login" replace />;
}

function AppRoutes() {
    return(
        <Routes>
            <Route element={<MainLayouts />}>
                <Route path='/' element={<Home />} />
                <Route path='nosotros' element={<About />} />
                <Route path='servicios' element={<Services />} />
                <Route path='contacto' element={<Contact />} />
                <Route path='login' element={<Login />} />
                <Route path='dashboard' element={<Protected><Dashboard /></Protected>} />
            </Route>
        </Routes>
    );
}
export default AppRoutes;