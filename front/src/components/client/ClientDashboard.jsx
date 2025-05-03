import React, { useEffect, useState } from "react";
import { Clock, Scissors, CalendarCheck } from "lucide-react";
import { Button } from "../button/button";
import { useAuth } from "../../context/useAuth";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../utils/utils";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../Dialog";
import { Input } from "../input/input";
import { Label } from "../label";

export const ClientDashboard = ({ navigateTo }) => {
    const [services, setServices] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, appointmentsRes] = await Promise.all([
                    fetch("http://localhost:8080/hair-salon-app/services", {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            "Content-Type": "application/json",
                        },
                    }),
                    fetch("http://localhost:8080/hair-salon-app/client/mes-rendez-vous", {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            "Content-Type": "application/json",
                        },
                    }),
                ]);

                const servicesData = await servicesRes.json();
                const appointmentsData = await appointmentsRes.json();

                setServices(servicesData);
                setMyAppointments(appointmentsData);
            } catch (err) {
                toast.error("Erreur lors du chargement des données");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.token]);

    const formatDate = (dateStr) => {
        const parts = dateStr.split("-");
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const handleMoveClick = (appointment) => {
        setSelectedAppointment(appointment);
        setNewDate(appointment.date);
        setNewTime(appointment.heure.slice(0, 5));
        setIsMoveModalOpen(true);
    };

    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setIsCancelModalOpen(true);
    };

    const formatInputDateToBackend = (dateStr) => {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };
    const handleConfirmMove = async () => {
        try {
            const formattedDate = formatInputDateToBackend(newDate);
            const formattedTime = `${newTime}:00`;
    
            const response = await fetch(`http://localhost:8080/hair-salon-app/client/deplacer-rendez-vous/${selectedAppointment.id}/${formattedDate}/${formattedTime}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
                toast.success("Rendez-vous déplacé avec succès");
                setIsMoveModalOpen(false);
                setMyAppointments(prev => prev.map(app =>
                    app.id === selectedAppointment.id
                        ? { ...app, date: newDate, heure: formattedTime }
                        : app
                ));
            } else {
                const errorData = await response.json();
                toast.error(errorData?.data || "Erreur lors du déplacement");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };
    
    const handleConfirmCancel = async () => {
        try {
            const response = await fetch(`http://localhost:8080/hair-salon-app/client/annuler-rendez-vous/${selectedAppointment.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            const result = await response.json();
    
            if (response.ok) {
                toast.success(result.message || "✅ Rendez-vous annulé");
                setMyAppointments(prev => prev.filter(app => app.id !== selectedAppointment.id));
                setIsCancelModalOpen(false);
            } else if (response.status === 409) {
                // 💳 Cas du rendez-vous payé
                if (window.confirm(result.data + "\nSouhaitez-vous annuler quand même ?")) {
                    // 👉 Appel d'une nouvelle route / forcer la suppression
                    const forceResp = await fetch(`http://localhost:8080/hair-salon-app/client/annuler-rendez-vous-force/${selectedAppointment.id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
    
                    const forceResult = await forceResp.json();
                    if (forceResp.ok) {
                        toast.success("✅ Rendez-vous annulé (facture supprimée)");
                        setMyAppointments(prev => prev.filter(app => app.id !== selectedAppointment.id));
                        setIsCancelModalOpen(false);
                    } else {
                        toast.error(forceResult.data || "❌ Erreur lors de l'annulation forcée");
                    }
                }
            } else {
                toast.error(result.data || "❌ Erreur lors de l'annulation");
            }
        } catch (err) {
            toast.error(err.message || "❌ Erreur réseau");
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Bonjour, {user.username}</h2>
                    <p className="text-slate-600">Voici vos informations de rendez-vous</p>
                </div>
                <Button className="flex items-center gap-2" onClick={() => navigateTo("book")}> <Clock size={16} /> Prendre rendez-vous </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"> <CalendarCheck /> Mes Rendez-vous </CardTitle>
                    <CardDescription> Retrouvez ici tous vos rendez-vous à venir avec les détails. </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {myAppointments.length > 0 ? (
                        myAppointments.map((appointment) => (
                            <div key={appointment.id} className="p-4 rounded-xl border bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex items-center gap-4 w-full sm:w-2/3">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                                        <Scissors size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{appointment.serviceRendezVousDtos?.[0]?.servicesDto?.nom || "Service inconnu"}</h4>
                                        <p className="text-sm text-slate-500">avec {appointment.employeDto.prenom} {appointment.employeDto.nom}</p>
                                        <p className="text-sm mt-1">
                                            <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs">
                                                {formatDate(appointment.date)} à {appointment.heure?.split(":").slice(0, 2).join("h")}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-0 flex gap-2">
                                    <Button variant="outline" className="text-xs" onClick={() => handleMoveClick(appointment)}>Déplacer</Button>
                                    <Button variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleCancelClick(appointment)}>Annuler</Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500">Vous n'avez aucun rendez-vous à venir.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Déplacer le rendez-vous</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="date">Date</Label>
                        <Input type="date" id="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />

                        <Label htmlFor="time">Heure</Label>
                        <Input type="time" id="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMoveModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleConfirmMove}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirmer l'annulation</DialogTitle>
                    </DialogHeader>
                    <p>Souhaitez-vous vraiment annuler ce rendez-vous ?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Non</Button>
                        <Button onClick={handleConfirmCancel}>Oui, annuler</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Nos prestations</CardTitle>
                    <CardDescription>Les services que nous proposons</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map((service) => (
                        <div key={service.id} className="p-4 bg-slate-50 border rounded-lg shadow-sm">
                            <h4 className="font-semibold text-lg">{service.nom}</h4>
                            <div className="flex justify-between items-center text-sm mt-2 text-slate-600">
                                <span>{service.duree} min</span>
                                <span>{service.montant} {service.devise}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
