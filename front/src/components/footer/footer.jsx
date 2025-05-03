import React from 'react'

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 py-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-slate-500 text-sm">
                            © 2025 HairSallon. Tous droits réservés.
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <a href="#" className="text-slate-500 hover:text-slate-700 text-sm">
                            À propos
                        </a>
                        <a href="#" className="text-slate-500 hover:text-slate-700 text-sm">
                            Confidentialité
                        </a>
                        <a href="#" className="text-slate-500 hover:text-slate-700 text-sm">
                            Conditions
                        </a>
                        <a href="#" className="text-slate-500 hover:text-slate-700 text-sm">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
