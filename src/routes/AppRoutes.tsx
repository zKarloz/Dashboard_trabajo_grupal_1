// Importa el tipo ReactNode para indicar que Protected puede recibir componentes hijos
import type { ReactNode } from "react";

// Routes agrupa las rutas
// Route define cada ruta
// Navigate permite redirigir automáticamente a otra ruta
import { Routes, Route, Navigate } from "react-router-dom";

// Importa el layout principal que contiene Navbar, contenido y Footer
import MainLayouts from '../layouts/MainLayouts';

// Importa las páginas que se mostrarán según la ruta
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

// Componente encargado de proteger una ruta
function Protected({ children }: { children: ReactNode }) {

    // Busca en localStorage si existe la sesión guardada
    // loggedIn será true solo si el valor guardado es exactamente "true"
    const loggedIn =
        localStorage.getItem("dashboard_logged_in") === "true";

    // Si inició sesión, muestra el componente protegido
    // Si no, lo redirige al Login
    return loggedIn
        ? children
        : <Navigate to="/login" replace />;
}

// Componente que contiene las rutas de la aplicación
function AppRoutes() {
    return(
        // Contenedor principal de todas las rutas
        <Routes>
            {/* Usa el mismo Navbar y Footer en estas rutas */}
            <Route element={<MainLayouts />}>
                <Route path='/' element={<Home />} /> {/* Ruta principal "http://localhost:5173/" */}
                <Route path='nosotros' element={<About />} />
                <Route path='servicios' element={<Services />} />
                <Route path='contacto' element={<Contact />} />
                <Route path='login' element={<Login />} />
                <Route path='dashboard' element={<Protected><Dashboard /></Protected>} /> {/* Dashboard protegido */}
            </Route>
        </Routes>
    );
}
// Permite importar AppRoutes desde otros archivos
export default AppRoutes;