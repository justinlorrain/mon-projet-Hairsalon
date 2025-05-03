import React, { useState, useEffect } from 'react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { useAuth } from '../../context/useAuth';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../../utils/utils";
import {
    FileText,
    Check,
    X
} from "lucide-react";

export const Invoice = ({ navigateTo }) => {
    const { user } = useAuth();
    const [clientId, setClientId] = useState('');
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);


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
                setError("Impossible de charger les services");
            }
        };

        fetchServices();
    }, [user.token]);


    useEffect(() => {
        const newTotal = selectedServices.reduce((sum, service) => sum + service.montant, 0);
        setTotal(newTotal);
    }, [selectedServices]);

    const handleGenerateInvoice = async () => {

        setError(null);
        setSuccess(null);


        if (!clientId || selectedServices.length === 0) {
            setError("Veuillez renseigner le client et sélectionner au moins un service");
            return;
        }

        try {
            const payload = {
                clientId: parseInt(clientId),
                servicesIds: selectedServices.map(service => service.id),
                montantTotal: total
            };

            const response = await fetch("http://localhost:8080/hair-salon-app/factures/creer", {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const invoiceData = await response.json();
                setSuccess(`Facture générée avec succès. Numéro de facture: ${invoiceData.numero}`);


                setClientId('');
                setSelectedServices([]);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Impossible de générer la facture");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleServiceSelection = (service) => {
        setSelectedServices(prev =>
            prev.some(s => s.id === service.id)
                ? prev.filter(s => s.id !== service.id)
                : [...prev, service]
        );
    };

    return (
        <div className="container max-w-2xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Générer une Facture</h2>
                    <p className="mt-1 text-slate-600">
                        Créez une nouvelle facture pour un client
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Button
                        variant="outline"
                        onClick={() => navigateTo("appointments")}
                    >
                        Retour aux rendez-vous
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-4" role="alert">
                    <div className="flex items-center">
                        <X className="h-5 w-5 mr-2" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative mb-4" role="alert">
                    <div className="flex items-center">
                        <Check className="h-5 w-5 mr-2" />
                        <span>{success}</span>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Nouvelle Facture</CardTitle>
                    <CardDescription>
                        Sélectionnez un client et les services à facturer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                                ID du Client
                            </label>
                            <Input
                                id="clientId"
                                type="number"
                                placeholder="Entrez l'ID du client"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Services
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => toggleServiceSelection(service)}
                                        className={`
                                            px-3 py-2 rounded-md text-sm font-medium 
                                            ${selectedServices.some(s => s.id === service.id)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                        `}
                                    >
                                        {service.nom} - € {service.montant}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center font-semibold text-lg">
                            <span>Total:</span>
                            <span>€{total.toFixed(2)}</span>
                        </div>

                        <Button
                            onClick={handleGenerateInvoice}
                            className="w-full"
                            variant="default"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Générer la Facture
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};