import React, { useState } from 'react';
import { Calendar, PlusCircle, Edit, Trash2, Clock } from 'lucide-react';
import { Footer } from '../components/footer/footer';
import { Appointments } from '../components/employee/Appointments';
import { AddAppointment } from '../components/employee/Add-Appointment';
import { Invoice } from '../components/employee/Invoice';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/button/button';
// import { AddConge } from '../components/employee/Add-Conge';
import { Planning } from '../components/employee/Planning';


const EmployeeHomePage = () => {
    const [currentPage, setCurrentPage] = useState('appointments');
    const navigate = useNavigate()
    const navigateTo = (page) => {
        setCurrentPage(page);
    };

    const NavLink = ({ page, currentPage, icon, children }) => {
        const isActive = currentPage === page;
        return (
            <button
                onClick={() => navigateTo(page)}
                className={`font-medium transition-colors flex items-center gap-2 ${isActive ? 'text-blue-600' : 'hover:text-blue-600 text-slate-900'}`}
            >
                {icon}
                {children}
            </button>
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/connexion')
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-blue-600">
                            HairSallon
                        </Link>
                    </div>
                    <nav className="flex items-center space-x-6">
                        <NavLink page="appointments" currentPage={currentPage} icon={<Calendar size={18} />}>Rendez-vous</NavLink>
                        <NavLink page="add" currentPage={currentPage} icon={<PlusCircle size={18} />}>Ajouter RV</NavLink>
                        <NavLink page="planning" currentPage={currentPage} icon={<Calendar size={18} />}>
  Planning
</NavLink>

                        {/* <NavLink page="invoice" currentPage={currentPage} icon={<Edit size={18} />}>Facturation</NavLink> */}
                        <Button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Se déconnecter
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {currentPage === 'appointments' && <Appointments />}
                {currentPage === 'add' && <AddAppointment />}
                {/* {currentPage === 'leave' && <AddConge />} */}
                {currentPage === 'invoice' && <Invoice />}
                {currentPage === 'planning' && <Planning />}
            </main>

            <Footer />
        </div>
    );
};

export default EmployeeHomePage;