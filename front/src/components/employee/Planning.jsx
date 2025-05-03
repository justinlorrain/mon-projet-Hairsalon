import React, { useEffect, useState } from 'react';
import { Button } from '../button/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../utils/utils';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export const Planning = () => {
  const { user } = useAuth();
  const [planning, setPlanning] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState(null);

  const fetchPlanning = async (monthDate) => {
    const mois = monthDate.getMonth() + 1;
    const annee = monthDate.getFullYear();

    try {
      const response = await fetch(
        `http://localhost:8080/hair-salon-app/employes/planning-global?mois=${mois}&annee=${annee}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setPlanning(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du planning.");
    }
  };

  useEffect(() => {
    fetchPlanning(currentMonth);
  }, [currentMonth]);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const filteredPlanning = planning.filter((p) => {
    const date = new Date(p.date);
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  });

  const groupedByEmploye = filteredPlanning.reduce((acc, jour) => {
    if (!acc[jour.employeId]) {
      acc[jour.employeId] = {
        nom: jour.employeNom,
        jours: [],
      };
    }
    acc[jour.employeId].jours.push(jour);
    return acc;
  }, {});

  const getMonthName = (date) =>
    date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Planning du mois</h2>
          <p className="text-slate-500">{getMonthName(currentMonth)}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button onClick={prevMonth}>⬅️ Mois précédent</Button>
          <Button onClick={nextMonth}>➡️ Mois suivant</Button>
        </div>
      </div>

      {Object.keys(groupedByEmploye).length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Calendar size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucun planning</h3>
          <p className="text-slate-500 mb-6">Aucun rendez-vous ce mois</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByEmploye).map(([id, data]) => (
            <Card key={id}>
              <CardHeader>
                <CardTitle className="text-lg text-indigo-700">👤 Employé : {data.nom}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 border text-left">📅 Date</th>
                      <th className="p-2 border text-left">🗓️ Type de jour</th>
                      <th className="p-2 border text-left">📋 Rendez-vous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.jours.map((jour, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 border">{jour.date}</td>
                        <td className="p-2 border">
                          {(jour.typeDeJour === 'JC' || jour.typeDeJour === 'DC') ? (
                            <>
                              <span className="font-bold">{jour.typeDeJour}</span>{' '}
                              {jour.commentaire && (
                                <span className="text-orange-600 ml-1">({jour.commentaire})</span>
                              )}
                            </>
                          ) : (
                            <span>{jour.typeDeJour}</span>
                          )}
                        </td>
                        <td className="p-2 border">
                          {jour.rendezVous.length > 0 ? (
                            <ul className="space-y-1">
                              {jour.rendezVous.map((r, i) => (
                                <li key={i} className="text-xs leading-snug">
                                  <span className="text-blue-600 font-semibold">{r.heure}</span> -{' '}
                                  <span className="text-blue-600 font-semibold">{r.heureFin || '?'}</span>{' '}
                                  →
                                  <span className="text-green-700 font-medium ml-1">
                                    {r.clientPrenom} {r.clientNom}
                                  </span>
                                  <span className="text-slate-500 ml-1">({r.clientTel})</span>
                                  <span className="text-purple-600 ml-1">[{r.clientEmail}]</span>{' '}
                                  • <span className="text-pink-600 font-semibold">{r.serviceNom}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400 italic">Aucun</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
