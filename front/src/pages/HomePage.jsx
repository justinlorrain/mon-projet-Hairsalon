import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/button/button';

export const HomePage = () => {

    return (
        <div className="min-h-screen bg-white">

            <header className="relative bg-blue-600 text-white" style={{
                backgroundImage: "url('https://www.coiffurekatica.fr/user/pages/16.zones-desservies/03.02-Montpellier/05.salon-de-coiffure-luxueux-a-montpellier/image_principale/salon-de-coiffure-luxueux-a-montpellier.jpg')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                minHeight: "600px"
            }}>
                <div className="absolute inset-0 bg-slate-900 opacity-40"></div>
                <nav className="relative z-10 container mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/" className="text-2xl font-bold text-white">HairSalon</a>
                    <div className="space-x-6 hidden md:flex items-center">
                        <a href="#services" className="hover:text-blue-200 transition-colors">Services</a>
                        <a href="#team" className="hover:text-blue-200 transition-colors">Notre équipe</a>
                        <a href="#contact" className="hover:text-blue-200 transition-colors">Contact</a>
                        <Link to="/connexion" className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100 transition-colors">Connexion</Link>
                    </div>
                    <Link to="/connexion" className="md:hidden bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100 transition-colors">Connexion</Link>
                </nav>

                <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 lg:py-32">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Révélez votre beauté naturelle</h1>
                        <p className="text-xl opacity-90 mb-8">Notre salon de coiffure vous propose des services professionnels dans une ambiance chaleureuse et accueillante.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/connexion" className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors inline-flex items-center">
                                Prendre rendez-vous <ChevronRight size={16} className="ml-1" />
                            </Link>
                            <a href="#contact" className="bg-transparent border border-white text-white hover:text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition-colors">
                                Nous contacter
                            </a>
                        </div>
                    </div>
                </div>
            </header>


            <section id="services" className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Nos Services</h2>
                        <div className="mt-4 h-1 w-16 bg-blue-600 mx-auto rounded-full"></div>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Découvrez notre gamme complète de services de coiffure pour hommes et femmes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="h-48 bg-gray-200" style={{ backgroundImage: "url('https://media.lesechos.com/api/v1/images/view/5cb5c1963e454635a24843af/1280x720/2094708-les-inegalites-homme-femme-chez-le-coiffeur-au-peigne-fin-171045-1.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Coupe et Style</h3>
                                <p className="text-gray-600 mb-4">
                                    Transformez votre look avec une coupe personnalisée adaptée à votre visage et à votre style.
                                </p>
                                <p className="font-semibold text-blue-600">À partir de 25€</p>
                            </div>
                        </div>


                        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="h-48 bg-gray-200" style={{ backgroundImage: "url('https://img.freepik.com/photos-premium/coloration-cheveux-blancs-teinture-pour-cheveux-brosse-par-mains-du-coiffeur-pour-jeune-femme-blonde-caucasienne-dans-salon-coiffure-gros-plan_141172-11388.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Coloration</h3>
                                <p className="text-gray-600 mb-4">
                                    Des couleurs vibrantes et durables pour raviver votre style et exprimer votre personnalité.
                                </p>
                                <p className="font-semibold text-blue-600">À partir de 50€</p>
                            </div>
                        </div>


                        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="h-48 bg-gray-200" style={{ backgroundImage: "url('https://laboutiquecoiffure.com/cdn/shop/articles/soins_capillaires_salon.jpg?v=1651180755')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Soins Capillaires</h3>
                                <p className="text-gray-600 mb-4">
                                    Traitements revitalisants pour des cheveux sains, brillants et pleins de vie.
                                </p>
                                <p className="font-semibold text-blue-600">À partir de 30€</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Button className="px-6 py-3">
                            Voir tous nos services
                        </Button>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-blue-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ce que disent nos clients</h2>
                        <div className="mt-4 h-1 w-16 bg-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4" style={{ backgroundImage: "url('/images/client-1.jpg')", backgroundSize: "cover" }}></div>
                                <div>
                                    <h4 className="font-bold">Marie Durand</h4>
                                    <div className="flex text-yellow-400">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "Je suis ravie de ma nouvelle coupe ! L'ambiance du salon est agréable et le personnel très attentionné. Je recommande vivement !"
                            </p>
                        </div>


                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4" style={{ backgroundImage: "url('/images/client-2.jpg')", backgroundSize: "cover" }}></div>
                                <div>
                                    <h4 className="font-bold">Paul Lefèvre</h4>
                                    <div className="flex text-yellow-400">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "Service impeccable et résultat au-delà de mes attentes. Les conseils personnalisés m'ont aidé à trouver le style parfait pour moi."
                            </p>
                        </div>


                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4" style={{ backgroundImage: "url('/images/client-3.jpg')", backgroundSize: "cover" }}></div>
                                <div>
                                    <h4 className="font-bold">Émilie Dupont</h4>
                                    <div className="flex text-yellow-400">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "Ma coloration est superbe et tient parfaitement. L'équipe est professionnelle et le salon très agréable. Je reviendrai !"
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            <section id="contact" className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Contactez-nous</h2>
                            <div className="h-1 w-16 bg-blue-600 rounded-full mb-8"></div>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Adresse</h3>
                                        <p className="text-gray-600">123 Avenue des Coiffeurs, 75001 Paris</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Téléphone</h3>
                                        <p className="text-gray-600">01 23 45 67 89</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                                        <p className="text-gray-600">contact@hairsalon.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Horaires d'ouverture</h3>
                                        <p className="text-gray-600">Lundi - Samedi: 9h00 - 18h00</p>
                                        <p className="text-gray-600">Dimanche: Fermé</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Votre nom"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Votre email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Sujet de votre message"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        id="message"
                                        rows="4"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Votre message"
                                    ></textarea>
                                </div>

                                <Button className="w-full py-3">
                                    Envoyer
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>


            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">HairSalon</h3>
                            <p className="text-gray-400 mb-4">
                                Notre salon de coiffure vous propose des services professionnels dans une ambiance chaleureuse.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 12.07c0-5.525-4.475-10-10-10s-10 4.475-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54V9.796c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.987C18.343 21.198 22 17.061 22 12.07z" />
                                    </svg>
                                </a>
                                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                    </svg>
                                </a>
                                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.668.01 2.985.058 4.04.045.975.207 1.504.344 1.856.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.04.058 2.67 0 2.986-.01 4.04-.058.975-.045 1.504-.207 1.856-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.352.3-.881.344-1.856.048-1.055.058-1.372.058-4.04 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.352-.137-.881-.3-1.856-.344-1.055-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Liens rapides</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
                                <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                                <li><a href="#team" className="text-gray-400 hover:text-white transition-colors">Notre équipe</a></li>
                                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                                <li><Link to="/connexion" className="text-gray-400 hover:text-white transition-colors">Connexion</Link></li>
                                <li><Link to="/inscription" className="text-gray-400 hover:text-white transition-colors">Inscription</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                            <p className="text-gray-400 mb-4">
                                Inscrivez-vous pour recevoir nos actualités et offres spéciales.
                            </p>
                            <form className="flex">
                                <input
                                    type="email"
                                    className="flex-grow p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Votre email"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                                >
                                    S'inscrire
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} HairSalon. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

