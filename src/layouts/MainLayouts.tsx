// Outlet permite mostrar el contenido de la ruta actual
// useLocation permite conocer la ruta en la que estamos
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
    // Obtiene la ruta actual
    const location = useLocation();

    // Comprueba si el usuario está dentro del Dashboard
    const estaEnDashboard = location.pathname.startsWith("/dashboard");

    return (
        <>
            {/* El Navbar no aparece dentro del Dashboard */}
            {!estaEnDashboard && <Navbar />}

            <main>
                <Outlet />
            </main>

            {/* El Footer no aparece dentro del Dashboard */}
            {!estaEnDashboard && <Footer />}
        </>
    );
}

export default MainLayout;