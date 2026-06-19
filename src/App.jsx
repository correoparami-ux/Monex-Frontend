import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './css/pages/login.css';
import './css/pages/register.css';
import './css/components/sideBar.css';
import './css/components/navbar.css';
import './css/pages/home.css';
import './css/pages/categories.css';
import './css/pages/expenses.css';
import './css/pages/analisis.css';
import './css/pages/codigo_olvidar.css';

import { Categorias } from './pages/categories/Categories';
import { Login } from './pages/Login/Login';
import { Home } from './pages/home/Home';
import { SideBarSwitcher } from './components/SideBar/SideBarSwitcher';
import { SideBarAdmin } from './components/SideBar/SideBarAdmin';
import { Register } from './pages/Registro/Register';
import { Expenses } from './pages/expenses/expenses';
import { EstMensual } from './pages/est_monthly/est_monthly';
import { Analisis } from './pages/analisis/analisis';
import { PanelAdmin } from './pages/admin/panelAdmin';
import { RecuperarContraseña } from './pages/olvidar_contraseña/codigo_olvidar';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/Home" element={<Home/>}/>
          <Route path="/SideBar" element={<SideBarSwitcher/>}/> 
          <Route path="/SideBarAdmin" element={<SideBarAdmin/>}/>
          <Route path="/Register" element={<Register/>}/>
          <Route path="/categorias" element={<Categorias/>}/>
          <Route path="/Gastos" element={<Expenses/>}/>
          <Route path="/est_monthly" element={<EstMensual/>}/>
          <Route path="/Analisis" element={<Analisis/>}/>
          <Route path="/PanelAdmin" element={<PanelAdmin/>}/>
          <Route path="/codigo_olvidar" element={<RecuperarContraseña/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
