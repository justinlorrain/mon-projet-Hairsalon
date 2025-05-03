import React from 'react'
import { Button } from '../button/button'
import { ChevronRight, User } from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../utils/utils'


const clientsList = [
    {
        id: 1,
        name: "Marie Dupont",
        phone: "06 12 34 56 78",
        lastVisit: "15 Mars",
    },
    {
        id: 2,
        name: "Paul Martin",
        phone: "06 98 76 54 32",
        lastVisit: "12 Mars",
    },
    {
        id: 3,
        name: "Camille Blanc",
        phone: "06 45 67 89 01",
        lastVisit: "10 Mars",
    },
    {
        id: 4,
        name: "Thomas Noir",
        phone: "06 23 45 67 89",
        lastVisit: "5 Mars",
    },
];

export const AdminClient = () => {
    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Clients</h2>
                    <p className="mt-1 text-slate-600">Gestion de la clientèle</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Button className="flex items-center gap-2">
                        <User size={16} />
                        <span>Nouveau client</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des clients</CardTitle>
                    <CardDescription>Tous les clients enregistrés</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {clientsList.map((client) => (
                            <div
                                key={client.id}
                                className="p-4 rounded-lg bg-slate-100 flex justify-between items-center"
                            >
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-green-500 text-white">
                                            {client.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold">{client.name}</h4>
                                        <p className="text-sm text-slate-500">{client.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Dernière visite</p>
                                    <p className="font-medium">{client.lastVisit}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => navigateTo('appointments')}
                                    >
                                        Prendre RV
                                    </Button>
                                    <Button variant="ghost" className="p-2 h-8 w-8">
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
