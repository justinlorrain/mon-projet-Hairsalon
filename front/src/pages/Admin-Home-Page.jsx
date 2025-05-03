import React, { useEffect, useState } from 'react'
import {
    Calendar,
    Clock,
    Menu,
    User,
    Users,
    Home,
} from 'lucide-react'
import { Footer } from '../components/footer/footer'
import { Link, useNavigate } from 'react-router'
import { AdminDashboard } from '../components/admin/Dashboard'
import { AdminAppointements } from '../components/admin/Appointements'
import { AdminEmployees } from '../components/admin/Employees'
import { AdminClient } from '../components/admin/Client'
import { AdminPlanning } from '../components/admin/Planning'
import { Button } from '../components/button/button'
import { BookForClient } from '../components/admin/BookForClient'; // ⚠️ adapte ce chemin !


const AdminHomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState('home')
    const navigate = useNavigate()
    const navigateTo = (page) => {
        setCurrentPage(page)
        setIsMenuOpen(false)
    }

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const user = JSON.parse(storedUser)
            const userRole = user?.role

            if (userRole === 'ADMIN') {
                navigate('/admin')
            }
            if (userRole === 'CLIENT') {
                navigate('/client')
            }

            if (userRole === 'EMPLOYE') {
                navigate('/employee')
            }
        }
    }, [navigate])

    const NavLink = ({ page, currentPage, icon, children, onClick }) => {
        const isActive = currentPage === page
        return (
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault()
                    onClick(page)
                }}
                className={`font-medium transition-colors flex items-center gap-2 ${isActive ? 'text-blue-600' : 'hover:text-blue-600 text-slate-900'
                    }`}
            >
                {icon}
                {children}
            </a>
        )
    }


    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <AdminDashboard navigateTo={navigateTo} />
            case 'appointments':
                return <AdminAppointements />
            case 'employees':
                return <AdminEmployees />
            case 'appoBookForClient':
                return <BookForClient />
            // case 'clients':
            //     return <AdminClient />
            case 'planning':
                return <AdminPlanning />
            default:
                return <AdminDashboard />
        }
    }


    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/connexion')
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-2">
                            <button
                                className="md:hidden p-2 rounded-full hover:bg-slate-100"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <Menu size={24} />
                            </button>
                            <h1 className="text-xl font-bold text-blue-600">
                                <Link href="/" className="text-xl font-bold text-blue-600">
                                    HairSallon
                                </Link>
                            </h1>
                        </div>

                        <nav className="hidden md:flex space-x-8">
                            <NavLink
                                page="home"
                                currentPage={currentPage}
                                icon={<Home size={16} />}
                                onClick={navigateTo}
                            >
                                Accueil
                            </NavLink>
                            <NavLink
                                page="appointments"
                                currentPage={currentPage}
                                icon={<Clock size={16} />}
                                onClick={navigateTo}
                            >
                            	visualiser le planning 
                            </NavLink>
                            <NavLink
                                page="employees"
                                currentPage={currentPage}
                                icon={<Users size={16} />}
                                onClick={navigateTo}
                            >
                                Employés
                            </NavLink>
                            {/* <NavLink
                                page="clients"
                                currentPage={currentPage}
                                icon={<User size={16} />}
                                onClick={navigateTo}
                            >
                                Clients
                            </NavLink> */}
                            <NavLink
                                page="planning"
                                currentPage={currentPage}
                                icon={<Calendar size={16} />}
                                onClick={navigateTo}
                            >
                               calendrier des jours 
                            </NavLink>

                            <Button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Se déconnecter
                            </Button>
                        </nav>

                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white py-4">
                        <div className="container mx-auto px-4 flex flex-col space-y-4">
                            <NavLink
                                page="home"
                                currentPage={currentPage}
                                icon={<Home size={16} />}
                                onClick={navigateTo}
                            >
                                Accueil
                            </NavLink>
                            <NavLink
                                page="appointments"
                                currentPage={currentPage}
                                icon={<Clock size={16} />}
                                onClick={navigateTo}
                            >
                                Rendez-vous
                            </NavLink>
                            <NavLink
                                page="employees"
                                currentPage={currentPage}
                                icon={<Users size={16} />}
                                onClick={navigateTo}
                            >
                                Employés
                            </NavLink>
                            {/* <NavLink
                                page="clients"
                                currentPage={currentPage}
                                icon={<User size={16} />}
                                onClick={navigateTo}
                            >
                                Clients
                            </NavLink> */}
                            <NavLink
                                page="planning"
                                currentPage={currentPage}
                                icon={<Calendar size={16} />}
                                onClick={navigateTo}
                            >
                                Planning
                            </NavLink>
                        </div>
                    </div>
                )}
            </header>

            <main className="container mx-auto px-4 py-8">{renderPage()}</main>

            <Footer />
        </div>
    )
}

export default AdminHomePage
