import React, { useEffect, useState } from 'react'
import { Calendar, Clock, User, Home, X } from 'lucide-react'
import { Footer } from '../components/footer/footer'
import { Link, useNavigate } from 'react-router'
import { Appointments } from '../components/client/Appointments'
import { ClientDashboard } from '../components/client/ClientDashboard'
import { Booking } from '../components/client/Booking'
import { Profile } from '../components/client/Profile'

const ClientHomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState('home')
    const [selectedService, setSelectedService] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState(null)
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

    const toggleService = (service) => {
        if (selectedService.find((s) => s.id === service.id)) {
            setSelectedService(selectedService.filter((s) => s.id !== service.id))
        } else {
            setSelectedService([...selectedService, service])
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-blue-600">
                            HairSallon
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            className="md:hidden p-2 rounded-full hover:bg-slate-100"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={20} /> : <User size={20} />}
                        </button>

                        <div className="hidden md:flex items-center space-x-6">
                            <NavLink
                                page="home"
                                currentPage={currentPage}
                                icon={<Home size={18} />}
                                onClick={navigateTo}
                            >
                                Accueil
                            </NavLink>
                            <NavLink
                                page="appointments"
                                currentPage={currentPage}
                                icon={<Calendar size={18} />}
                                onClick={navigateTo}
                            >
                            	visualiser le planning 
                            </NavLink>
                            <NavLink
                                page="book"
                                currentPage={currentPage}
                                icon={<Clock size={18} />}
                                onClick={navigateTo}
                            >
                                Réserver
                            </NavLink>
                            <NavLink
                                page="profile"
                                currentPage={currentPage}
                                icon={<User size={18} />}
                                onClick={navigateTo}
                            >
                                Profil
                            </NavLink>
                        </div>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            <NavLink
                                page="home"
                                currentPage={currentPage}
                                icon={<Home size={18} />}
                                onClick={navigateTo}
                            >
                                Accueil
                            </NavLink>
                            <NavLink
                                page="appointments"
                                currentPage={currentPage}
                                icon={<Calendar size={18} />}
                                onClick={navigateTo}
                            >
                                Rendez-vous
                            </NavLink>
                            <NavLink
                                page="book"
                                currentPage={currentPage}
                                icon={<Clock size={18} />}
                                onClick={navigateTo}
                            >
                                Réserver
                            </NavLink>
                            <NavLink
                                page="profile"
                                currentPage={currentPage}
                                icon={<User size={18} />}
                                onClick={navigateTo}
                            >
                                Profil
                            </NavLink>
                        </div>
                    </div>
                )}
            </header>

            <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {currentPage === 'home' && (
                    <ClientDashboard
                        navigateTo={navigateTo}
                        setSelectedEmployee={selectedEmployee}
                    />
                )}
                {currentPage === 'appointments' && (
                    <Appointments navigateTo={navigateTo} />
                )}
                {currentPage === 'book' && (
                    <Booking
                        toggleService={toggleService}
                        selectedService={selectedService}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                    />
                )}
                {currentPage === 'profile' && <Profile />}
            </main>

            <Footer />
        </div>
    )
}

export default ClientHomePage
