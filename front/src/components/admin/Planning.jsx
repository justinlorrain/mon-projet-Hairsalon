import React, { useEffect, useState } from 'react';
import { Button } from '../button/button';
import { CalendarDays, Plus, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';

export const AdminPlanning = () => {
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const [showModalFerie, setShowModalFerie] = useState(false);
  const [showModalFermeture, setShowModalFermeture] = useState(false);
  const [joursFermeture, setJoursFermeture] = useState([]);
  const [ferieDate, setFerieDate] = useState('');
  const { user } = useAuth();

  const fetchCalendar = async () => {
    try {
      const res = await axios.get('http://localhost:8080/hair-salon-app/employe/calendrier', {
        headers: {
          Authorization: `Bearer ${user.token}`,
          
        },
      });

      const uniqueByDate = res.data.reduce((acc, current) => {
        const dateKey = current.dateDuJour;
        if (!acc[dateKey]) {
          acc[dateKey] = current;
        }
        return acc;
      }, {});

      const uniqueDays = Object.values(uniqueByDate);
      setCalendarDays(uniqueDays);
    } catch (e) {
      toast.error("Erreur lors du chargement du calendrier");
    }
  };

  const fetchFermetureHebdo = async () => {
    try {
      const res = await axios.get('http://localhost:8080/hair-salon-app/jours-fermeture-reguliers', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const jours = res.data.map(j => j.jourDeLaSemaine.toLowerCase());
      setJoursFermeture(jours);
    } catch (err) {
      console.error("Erreur lors du chargement des fermetures hebdo");
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchCalendar();
      fetchFermetureHebdo();
    }
  }, [user?.token]);

  const getBgColor = (typeDeJour) => {
    switch (typeDeJour) {
      case 'JF': return 'bg-red-100 border-red-300';
      case 'FH': return 'bg-yellow-100 border-yellow-300';
      case 'JC': return 'bg-orange-100 border-orange-300';
      case 'T':
      default: return 'bg-green-50 border-green-200';
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleGenerateYear = async () => {
    try {
      setLoading(true);
      await axios.post(
        'http://localhost:8080/hair-salon-app/employe/generer',
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      toast.success("✅ Calendrier régénéré");
      await new Promise((r) => setTimeout(r, 1200));
      await fetchCalendar();
      await fetchFermetureHebdo();
    } catch (err) {
      toast.error("❌ Erreur de génération");
    } finally {
      setLoading(false);
    }
  };

  const ajouterJourFerie = async () => {
    if (!ferieDate) return toast.error("⛔ Veuillez sélectionner une date");
    try {
      await axios.post(
        'http://localhost:8080/hair-salon-app/employe/ajouter-jour-ferie',
        { date: ferieDate },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success("✅ Jour férié ajouté");
      setShowModalFerie(false);
      setFerieDate('');
      await fetchCalendar();
    } catch (err) {
      toast.error("❌ Erreur lors de l'ajout du jour férié");
    }
  };

  const supprimerJourFerie = async (jourId) => {
    try {
      await axios.delete(`http://localhost:8080/hair-salon-app/employe/supprimer-jour-ferie/${jourId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("🗑️ Jour férié supprimé");
      await fetchCalendar();
    } catch (err) {
      toast.error("❌ Échec de suppression");
    }
  };

  const handleClickAjoutJourFerie = () => setShowModalFerie(true);
  const handleClickFermetureHebdo = () => setShowModalFermeture(true);

  const enregistrerFermeturesHebdo = async () => {
    try {
      await axios.delete('http://localhost:8080/hair-salon-app/jours-fermeture-reguliers/tous', {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      for (const jour of joursFermeture) {
        await axios.post(
          'http://localhost:8080/hair-salon-app/jours-fermeture-reguliers',
          { jourDeLaSemaine: jour },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      toast.success("✅ Fermetures mises à jour");
      setShowModalFermeture(false);
      await handleGenerateYear();
    } catch (error) {
      toast.error("❌ Erreur fermeture");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Calendrier du salon</h2>
          <p className="text-slate-600">Vue sur les jours d'ouverture, fériés et fermetures hebdomadaires</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={handleGenerateYear} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <CalendarDays size={16} />} Générer l'année
          </Button>
          <Button variant="outline" onClick={handleClickAjoutJourFerie}>
            <Plus size={16} /> Ajouter jour férié
          </Button>
          <Button variant="outline" onClick={handleClickFermetureHebdo}>
            <Plus size={16} /> Gérer fermeture hebdo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {calendarDays
          .filter((day) => new Date(day.dateDuJour).getMonth() === selectedMonth)
          .sort((a, b) => new Date(a.dateDuJour) - new Date(b.dateDuJour))
          .map((day, index) => (
            <div key={index} className={`rounded-lg p-4 border shadow-sm ${getBgColor(day.typeDeJour)}`}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{new Date(day.dateDuJour).toLocaleDateString()}</h4>
                  <p className="text-sm text-gray-600">
                    {day.typeDeJour === 'JF' && 'Jour férié'}
                    {day.typeDeJour === 'FH' && 'Fermeture hebdomadaire'}
                    {day.typeDeJour === 'JC' && 'Congé'}
                    {day.typeDeJour === 'T' && 'Ouvert'}
                  </p>
                </div>
                {day.typeDeJour === 'JF' && day.jourFerieId && (
  <Button
    variant="ghost"
    size="icon"
    className="text-red-500"
    onClick={() => supprimerJourFerie(day.jourFerieId)}
  >
    <X size={18} />
  </Button>
)}

              </div>
            </div>
          ))}
      </div>

      {/* Modal fermeture hebdo */}
      {showModalFermeture && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Jours de fermeture hebdomadaire</h3>
            <div className="space-y-2 mb-4">
              {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((jour) => (
                <label key={jour} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={joursFermeture.includes(jour)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setJoursFermeture((prev) => [...prev, jour]);
                      } else {
                        setJoursFermeture((prev) => prev.filter((j) => j !== jour));
                      }
                    }}
                  />
                  <span className="capitalize">{jour}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowModalFermeture(false)} variant="outline">Annuler</Button>
              <Button onClick={enregistrerFermeturesHebdo}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout jour férié */}
      {showModalFerie && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Ajouter un jour férié</h3>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded mb-4"
              value={ferieDate}
              onChange={(e) => setFerieDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowModalFerie(false)} variant="outline">Annuler</Button>
              <Button onClick={ajouterJourFerie}>Ajouter</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
