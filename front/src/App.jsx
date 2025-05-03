import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Connexion from "./pages/auth/connexion/connexion";
import Inscription from "./pages/auth/register/register";
import AdminHomePage from "./pages/Admin-Home-Page";
import ClientHomePage from "./pages/Client-Home-Page";
import EmployeeHomePage from "./pages/Employee-Home-Page";
import GererCongePage from "./pages/GererCongePage";

import { HomePage } from "./pages/HomePage";

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/client" element={<ClientHomePage />} />
        <Route path="/employee" element={<EmployeeHomePage />} />
        <Route path="/conges" element={<GererCongePage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
