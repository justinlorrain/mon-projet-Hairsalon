import React, { useEffect, useState } from 'react';
import { Button } from '../button/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../utils/utils';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export const Appointments = () => {
  const { user } = useAuth();
  const [planning, setPlanning] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState(null);

  const fetchPlanning = async (monthDate) => {
    const mois = monthDate.getMonth() + 1; // mois JS commence à 0
    const annee = monthDate.getFullYear();

    try {
      const response = await fetch(
        `http://localhost:8080/hair-salon-app/client/planning-global?mois=${mois}&annee=${annee}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setPlanning(data);
      console.log('📅 Planning reçu :', data);
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Planning du mois</h2>
        <p className="text-sm text-green-600 italic">
      Vos rendez-vous apparaissent en <span className="font-semibold">vert</span> dans le planning.
    </p>
        <div className="flex gap-2">
          <Button onClick={prevMonth}>Précédent</Button>
          <Button onClick={nextMonth}>Suivant</Button>
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
                <CardTitle>Employé : {data.nom}</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Type de jour</th>
                      <th className="p-2 border">Rendez-vous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.jours.map((jour, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{jour.date}</td>
                        <td className="p-2 border">
  {(jour.typeDeJour === 'JC' || jour.typeDeJour === 'DC') ? (
    <>
      <strong>{jour.typeDeJour}</strong>
      {jour.commentaire && (
        <span className="text-orange-600 ml-2">({jour.commentaire})</span>
      )}
    </>
  ) : (
    jour.typeDeJour
  )}
</td>

                        <td className="p-2 border">
                          {jour.rendezVous.length > 0 ? (
                            <ul className="space-y-1">
                              {jour.rendezVous.map((r, i) => (
                                <li
                                  key={i}
                                  className={`text-xs ${r.estProprietaire ? 'text-green-700 font-semibold' : 'text-gray-500 italic'}`}
                                >
                                  {`${r.heure} - ${r.heureFin || '?'}`} → {r.estProprietaire ? r.serviceNom : 'Occupé'}
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
