import {Routes, Route} from 'react-router-dom';
import MainLayouts from '../layouts/MainLayouts';

import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

function AppRoutes() {
    return(
        <Routes>
            <Route element={<MainLayouts />}>
                <Route path='/' element={<Home />} />
                <Route path='nosotros' element={<About />} />
                <Route path='servicios' element={<Services />} />
                <Route path='contacto' element={<Contact />} />
                <Route path='login' element={<Login />} />
                <Route path='dashboard' element={<Dashboard />} />
            </Route>
        </Routes>
    );
}
export default AppRoutes;