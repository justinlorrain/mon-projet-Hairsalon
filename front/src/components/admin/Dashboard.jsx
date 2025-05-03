import React, { useEffect, useState } from 'react'
import { Button } from '../button/button'
import { Calendar, Clock, Settings, User, Users } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../utils/utils'
import { useAuth } from '../../context/useAuth'
import { useNavigate } from "react-router-dom";

export const AdminDashboard = ({ navigateTo }) => {
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [nouvelleDate, setNouvelleDate] = useState('');
  const [nouvelleHeure, setNouvelleHeure] = useState('');
  const navigate = useNavigate();

  const fetchMyAppointments = async () => {
    try {
      const response = await fetch("http://localhost:8080/hair-salon-app/employe/tous-les-rendez-vous", {
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      const sorted = data.sort((a, b) => new Date(a.date + 'T' + a.heure) - new Date(b.date + 'T' + b.heure));
      setAppointments(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchMyAppointments();
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return;
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:8080/hair-salon-app/employe/get-all", {
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();

        const formattedEmployees = data.map(emp => ({
          id: emp.id,
          name: `${emp.prenom} ${emp.nom}`,
          email: emp.email,
          phone: emp.numeroTelephone,
          speciality: "Coiffeur/Coiffeuse",
          schedule: emp.planningDto
        }));

        setEmployees(formattedEmployees);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, [user?.token]);

  const paginatedAppointments = appointments.slice((currentPage - 1) * appointmentsPerPage, currentPage * appointmentsPerPage);
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  const isPastAppointment = (appointment) => {
    const now = new Date();
    const rdvDateTime = new Date(`${appointment.date}T${appointment.heure}`);
    return rdvDateTime < now;
  };

  const openModal = (appointment) => {
    setSelectedRdv(appointment);
    setNouvelleDate('');
    setNouvelleHeure('');
    setShowModal(true);
  };

  const handleDeplacer = async () => {
    if (!nouvelleDate || !nouvelleHeure || !selectedRdv) {
      alert("Veuillez remplir la date et l'heure");
      return;
    }

    const heureFormatee = nouvelleHeure.length === 5 ? `${nouvelleHeure}:00` : nouvelleHeure;

    try {
      const response = await fetch(`http://localhost:8080/hair-salon-app/employe/deplacer-rendez-vous/${selectedRdv.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nouvelleDate,
          nouvelleHeure: heureFormatee
        })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || result.data || "❌ Erreur lors du déplacement.");
      } else {
        alert(result.message || result.data || "✅ Rendez-vous déplacé avec succès !");
        setShowModal(false);
        fetchMyAppointments();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau.");
    }
  };

  const handleAnnuler = async (rendezVousId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;

    try {
      const response = await fetch(`http://localhost:8080/hair-salon-app/employe/annuler-rendez-vous/${rendezVousId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || result.data || "❌ Erreur lors de l'annulation.");
      } else {
        alert(result.message || result.data || "✅ Rendez-vous annulé !");
        fetchMyAppointments();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau.");
    }
  };

  const handleCreerFacture = async (rendezVousId, employeId) => {
    try {
      const response = await fetch(`http://localhost:8080/hair-salon-app/employe/create-facture/${rendezVousId}/${employeId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        alert(errorText || "❌ Erreur lors de la création de la facture.");
        return;
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${rendezVousId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      alert("✅ Facture créée et téléchargée !");
      
      await new Promise(resolve => setTimeout(resolve, 300)); // <-- pause ici
      fetchMyAppointments(); // recharge la liste
  
    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau.");
    }
  };
  
  const handleDownloadFacture = async (factureId) => {
    try {
      const response = await fetch(`http://localhost:8080/hair-salon-app/factures/${factureId}/download`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `facture_${factureId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("❌ Impossible de télécharger la facture");
    }
  };

  
  
  const handlePayerFacture = async (factureId) => {
    try {
      const response = await fetch(`http://localhost:8080/hair-salon-app/employe/facture/${factureId}/payer`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || result.data || "❌ Erreur lors du paiement.");
      } else {
        alert(result.message || result.data || "✅ Paiement effectué avec succès !");
        fetchMyAppointments();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau.");
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Déplacer le rendez-vous</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nouvelle date</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={nouvelleDate}
                onChange={(e) => setNouvelleDate(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nouvelle heure</label>
              <input
                type="time"
                className="w-full border rounded p-2"
                value={nouvelleHeure}
                onChange={(e) => setNouvelleHeure(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowModal(false)} variant="outline">Annuler</Button>
              <Button onClick={handleDeplacer} className="bg-green-600 text-white">Confirmer</Button>
            </div>
          </div>
        </div>
      )}


      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 px-4">
          <h2 className="text-3xl font-bold">Rendez-vous des employés</h2>
          <Button
            className="mt-4 md:mt-0 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2"
            onClick={() => navigateTo('appoBookForClient')}
          >
            <Clock size={18} />
            <span>Prendre Rendez-Vous</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Liste des rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedAppointments.map((appointment) => {
                const isPast = isPastAppointment(appointment);
                return (
                  <div key={appointment.id} className="p-4 rounded-lg bg-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar>
                            <AvatarFallback className="bg-blue-500 text-white">
                              {appointment.clientDto.prenom.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">
                              {appointment.clientDto.prenom} {appointment.clientDto.nom}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {appointment.serviceRendezVousDtos.map(service => service.servicesDto.nom).join(', ')}
                            </p>
                            <p className="text-sm text-slate-500">📞 {appointment.numeroTelephoneClient}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.heure}</p>
                        <p className="text-sm text-slate-500">{appointment.date}</p>
                        <p className="text-sm text-slate-500">👨‍💼 {appointment.employeDto.prenom} {appointment.employeDto.nom}</p>
                        <div className="mt-2 flex flex-wrap gap-2 justify-end">
  {/* Déplacement */}
  <Button
    className="bg-green-500 text-white hover:bg-green-600 disabled:bg-red-500"
    onClick={() => openModal(appointment)}
    disabled={isPast || appointment.estPayee}
  >
    Déplacer
  </Button>

  {/* Annulation */}
  <Button
    className="bg-red-500 text-white hover:bg-red-600"
    onClick={() => handleAnnuler(appointment.id)}
  >
    Annuler
  </Button>

  {/* Création de facture */}
  {!appointment.factureCreee && (
    <Button
      className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-red-500"
      onClick={() => handleCreerFacture(appointment.id, appointment.employeDto.id)}
      disabled={isPast}
    >
      Créer facture
    </Button>
  )}

  {/* Paiement */}
  {appointment.factureCreee && !appointment.estPayee && (
    <Button
      className="bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-red-500"
      onClick={() => handlePayerFacture(appointment.factureId)}
      disabled={isPast}
    >
      Payer
    </Button>
  )}

  {/* Facture payée + Télécharger */}
  {appointment.factureCreee && appointment.estPayee && (
    <>
      <span className="px-3 py-1 rounded text-sm text-slate-500 border border-slate-300 bg-slate-100">
        ✅ Facture payée
      </span>
      <Button
        variant="outline"
        className="text-xs"
        onClick={() => handleDownloadFacture(appointment.factureId)}
      >
        📥 Télécharger
      </Button>
    </>
  )}
</div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Précédent</Button>
            <span className="text-sm">Page {currentPage} sur {totalPages}</span>
            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Suivant</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex flex-col items-center justify-center h-24 p-4" onClick={() => navigate("/conges")}>
                <Calendar size={24} className="mb-2" />
                <span>Gérer les congés</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-24 p-4" onClick={() => navigateTo('employees')}>
                <Users size={24} className="mb-2" />
                <span>modifier les horaires employés</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-24 p-4" onClick={() => navigateTo('clients')}>
                <User size={24} className="mb-2" />
                <span>Ajouter client</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-24 p-4">
                <Settings size={24} className="mb-2" />
                <span>Paramètres</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
