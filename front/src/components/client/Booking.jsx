import React, { use, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Avatar, AvatarFallback, CardFooter } from "../../utils/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../button/button";
import { useAuth } from "../../context/useAuth";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


export const Booking = ({
    selectedService,
    selectedEmployee,
    setSelectedEmployee,
    toggleService,
}) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const { user } = useAuth();
    


    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch("http://localhost:8080/hair-salon-app/services", {
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    }
                });
                const data = await response.json();
                setServices(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [user.token]);

    useEffect(() => {
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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [user.token]);

    const calculateTotal = () => {
        let totalDuration = 0;
        let totalPrice = 0;

        selectedService.forEach(service => {
            const [hours, minutes] = service.duree.split(":").map(Number);
            const durationInMinutes = hours * 60 + minutes;

            totalDuration += durationInMinutes;
            totalPrice += service.montant;
        });

        return { totalDuration, totalPrice };
    };

    const { totalDuration, totalPrice } = calculateTotal();
    const canSelectDate = selectedService.length > 0;
    const canSelectTime = canSelectDate && selectedDate;
    const canConfirm = selectedService.length > 0 && selectedEmployee && selectedDate && selectedTime;

    const formatDateForAPI = (date) => {
        if (!(date instanceof Date)) return null;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // mois indexé à 0
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      

    const formatTimeForAPI = (timeStr) => {
        if (!timeStr) return null;
        return timeStr.replace('h', ':') + ':00';
    };

    const formatDurationForAPI = () => {
        const hours = Math.floor(totalDuration / 60);
        const minutes = totalDuration % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    };


    const handleSubmitAppointment = async () => {
        if (!canConfirm) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const appointmentData = {
                rendezVous: {
                    date: formatDateForAPI(selectedDate),
                    heure: formatTimeForAPI(selectedTime),
                    duree: formatDurationForAPI(),
                    clientDto: {
                        id: user.id
                    },
                    employeDto: {
                        id: selectedEmployee.id
                    }
                },
                servicesId: selectedService.map(service => service.id)
            };

            const response = await fetch("http://localhost:8080/hair-salon-app/client/prendre-rendez-vous", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.data || "Erreur lors de la création du rendez-vous");
            }


            toast.success("Votre rendez-vous a été confirmé!")
        } catch (err) {
            setSubmitError(err.message);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getAvailableDatesForEmployee = (employee) => {
        if (!employee || !employee.schedule) return [];

        return employee.schedule
            .filter(schedule => schedule.typeDeJour !== 'FERME')
            .map(schedule => {
                const date = new Date(schedule.dateDuJour);
                const day = date.getDate().toString().padStart(2, '0');
                const months = [
                    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ];
                const month = months[date.getMonth()];
                return `${day} ${month}`;
            });
    };

    const getAvailableTimesForDate = () => {
        if (!selectedEmployee || !selectedDate) return [];
    
        const apiDate = formatDateForAPI(selectedDate);
        const daySchedule = selectedEmployee.schedule.find(
            schedule => schedule.dateDuJour === apiDate
        );
    
        if (!daySchedule) return [];
    
        // ✅ Toujours afficher les créneaux complets de la journée
        const startTime = new Date(`${apiDate}T09:00:00`);
        const endTime = new Date(`${apiDate}T18:00:00`);
    
        const serviceDurationMs = totalDuration * 60 * 1000;
    
        const timeSlots = [];
        let currentTime = new Date(startTime);
    
        while (currentTime < endTime) {
            const slotEndTime = new Date(currentTime.getTime() + serviceDurationMs);
    
            if (slotEndTime <= endTime) {
                timeSlots.push(
                    currentTime.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(':', 'h')
                );
            }
    
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
    
        return timeSlots;
    };
    
    return (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Prendre rendez-vous</h2>
              <p className="mt-1 text-slate-600">
                Réservez facilement votre prochain rendez-vous
              </p>
            </div>
          </div>
    
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Choisissez vos prestations</CardTitle>
                  <CardDescription>Sélectionnez les services dont vous avez besoin</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Chargement des services...</p>
                  ) : error ? (
                    <p className="text-red-500">Erreur: {error}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {services.map(service => (
                        <div
                          key={service.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedService.find(s => s.id === service.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
                          onClick={() => toggleService(service)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{service.nom}</h4>
                              <p className="text-sm text-slate-500">{service.duree} min</p>
                            </div>
                            <p className="font-medium">{service.montant} {service.devise}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
    
              <Card>
                <CardHeader>
                  <CardTitle>2. Choisissez votre coiffeur</CardTitle>
                  <CardDescription>Sélectionnez le professionnel de votre choix</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {employees.map(staff => (
                      <div
                        key={staff.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedEmployee?.id === staff.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
                        onClick={() => {
                          setSelectedEmployee(staff);
                          setSelectedDate(null);
                          setSelectedTime(null);
                        }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-16 w-16 mb-3">
                            <AvatarFallback className="bg-blue-500 text-white text-xl">
                              {staff.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold">{staff.name}</h4>
                          <p className="text-sm text-slate-500">{staff.speciality}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>3. Choisissez la date</CardTitle>
                    <CardDescription>
                      {selectedEmployee ? `Dates disponibles pour ${selectedEmployee.name}` : "Sélectionnez d'abord un coiffeur"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedEmployee ? (
                      <Calendar
                        onChange={(date) => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        value={selectedDate}
                        tileDisabled={({ date }) => {
                            const allowed = selectedEmployee.schedule
  .filter(schedule => schedule.typeDeJour !== 'FERME')
  .map(schedule => new Date(schedule.dateDuJour).toDateString());

                            return !allowed.includes(date.toDateString());
                          }}
                          
                      />
                    ) : (
                      <p className="text-slate-400 italic">Veuillez sélectionner un coiffeur pour voir ses disponibilités</p>
                    )}
                  </CardContent>
                </Card>
    
                <Card>
                  <CardHeader>
                    <CardTitle>4. Choisissez l'heure</CardTitle>
                    <CardDescription>
                      {selectedDate ? `Horaires disponibles le ${selectedDate.toLocaleDateString('fr-FR')}` : "Sélectionnez d'abord une date"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedEmployee && selectedDate ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getAvailableTimesForDate().map((time, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg border cursor-pointer transition-colors text-center ${selectedTime === time
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
                            onClick={() => setSelectedTime(time)}
                          >
                            <span className="font-medium">{time}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">
                        {selectedEmployee ? "Veuillez sélectionner une date pour voir les horaires disponibles" : "Veuillez sélectionner un coiffeur et une date"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
    
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Résumé de la réservation</CardTitle>
                  <CardDescription>Détails de votre rendez-vous</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Services</h4>
                      {selectedService.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {selectedService.map(service => (
                            <li key={service.id} className="flex justify-between">
                              <span>{service.nom}</span>
                              <span className="font-medium">{service.montant} {service.devise}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-slate-400 italic">Aucun service sélectionné</p>
                      )}
                    </div>
    
                    <div className="pt-3 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-500">Coiffeur</h4>
                      {selectedEmployee ? (
                        <p className="mt-1">{selectedEmployee.name}</p>
                      ) : (
                        <p className="mt-1 text-slate-400 italic">Non sélectionné</p>
                      )}
                    </div>
    
                    <div className="pt-3 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-500">Date et heure</h4>
                      {selectedDate && selectedTime ? (
                        <p className="mt-1">{selectedDate.toLocaleDateString('fr-FR')} à {selectedTime}</p>
                      ) : (
                        <p className="mt-1 text-slate-400 italic">Non sélectionné</p>
                      )}
                    </div>
    
                    {selectedService.length > 0 && (
                      <div className="pt-3 border-t border-slate-200">
                        <h4 className="text-sm font-medium text-slate-500">Détails</h4>
                        <div className="mt-1 flex justify-between">
                          <span>Durée:</span>
                          <span>{totalDuration} min</span>
                        </div>
                        <div className="mt-1 flex justify-between font-semibold">
                          <span>Prix total:</span>
                          <span>{totalPrice} €</span>
                        </div>
                      </div>
                    )}
    
                    {submitError && (
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-red-500 text-sm">{submitError}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled={!canConfirm || submitting} onClick={handleSubmitAppointment}>
                    {submitting ? "En cours..." : "Confirmer le rendez-vous"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </>
    );
    
};