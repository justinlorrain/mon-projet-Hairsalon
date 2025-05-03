import React, { useEffect, useState } from 'react'; 
import { Button } from '../button/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../Dialog';
import { Input, Label } from '../input/input';
import { Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const AdminEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [weekPlanning, setWeekPlanning] = useState([]);
  const [rdvsConflits, setRdvsConflits] = useState([]);
  const [modalDeplacement, setModalDeplacement] = useState(false);
  const [deplacementInfos, setDeplacementInfos] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ nom: '', prenom: '', email: '', motDePasse: '', numeroTelephone: '' });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:8080/hair-salon-app/employe/get-all', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(res.data);
    } catch (e) {
      toast.error('Erreur chargement employés');
    }
  };

  const openEditScheduleModal = (employee) => {
    const baseDate = new Date();
    const planning = daysOfWeek.map((label, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - baseDate.getDay() + index + 1);
      const jour = label;
      const fermeture = jour === 'Dimanche' || jour === 'Lundi';
      return {
        jour,
        typeDeJour: fermeture ? 'FH' : 'T',
        heureDebut: fermeture ? '00:00:00' : '09:00:00',
        heureFin: fermeture ? '00:00:00' : '18:00:00',
        dateDuJour: date.toISOString().split('T')[0],
      };
    });
    setSelectedEmployee(employee);
    setWeekPlanning(planning);
    setIsEditModalOpen(true);
  };

  const handleChange = (i, field, value) => {
    const updated = [...weekPlanning];
    updated[i][field] = value;
    setWeekPlanning(updated);
  };

  const handleSave = async () => {
    for (let day of weekPlanning) {
      const { jour, typeDeJour, heureDebut, heureFin } = day;
      if (
        ['T', 'DC'].includes(typeDeJour) &&
        (!heureDebut || !heureFin || heureDebut < '09:00:00' || heureFin > '18:00:00' || heureDebut >= heureFin)
      ) {
        return toast.error(`⛔ Horaire invalide pour ${jour} (entre 09:00 et 18:00, début < fin)`);
      }
    }
    try {
      await axios.put(
        `http://localhost:8080/hair-salon-app/employe/modifier-horaire-employe/${selectedEmployee.id}`,
        weekPlanning,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('✅ Planning mis à jour');
      setIsEditModalOpen(false);
    } catch (e) {
      if (e.response?.status === 409) {
        toast.error('⚠️ Conflit avec des rendez-vous existants');
        setRdvsConflits(e.response.data.rdvs || []);
        setModalDeplacement(true);
      } else {
        toast.error('❌ Erreur mise à jour planning');
      }
    }
  };

  const handleDeplacementChange = (rdvId, field, value) => {
    setDeplacementInfos((prev) => ({
      ...prev,
      [rdvId]: {
        ...prev[rdvId],
        [field]: value,
      },
    }));
  };

  const handleDeplacerRDV = async (rdvId) => {
    const { nouvelleDate, nouvelleHeure } = deplacementInfos[rdvId] || {};
    if (!nouvelleDate || !nouvelleHeure) return toast.error('⛔ Date ou heure manquante');
    try {
      await axios.put(
        `http://localhost:8080/hair-salon-app/employe/deplacer-rendez-vous/${rdvId}`,
        { nouvelleDate, nouvelleHeure },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`✅ RDV ${rdvId} déplacé`);
    } catch (err) {
      toast.error(`❌ Erreur déplacement RDV ${rdvId}`);
    }
  };

  const handleCreateEmploye = async () => {
    try {
      await axios.post(
        'http://localhost:8080/hair-salon-app/employe/create',
        newEmployee,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success("✅ Employé ajouté");
      setIsCreateModalOpen(false);
      setNewEmployee({ nom: '', prenom: '', email: '', motDePasse: '', numeroTelephone: '' });
      fetchEmployees();
    } catch (e) {
      toast.error("❌ Erreur création employé");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user.token]);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestion des employés</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}><UserCheck size={16} className="mr-2" />Ajouter un employé</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="border rounded p-4 bg-white shadow">
            <div className="font-bold">{emp.prenom} {emp.nom}</div>
            <div className="text-sm text-gray-600">{emp.email}</div>
            <div className="text-sm">{emp.numeroTelephone}</div>
            <Button variant="outline" className="mt-3" onClick={() => openEditScheduleModal(emp)}>
              <Clock className="w-4 h-4 mr-1" />Modifier planning
            </Button>
          </div>
        ))}
      </div>

      {/* Modal création employé */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel employé</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input placeholder="Prénom" value={newEmployee.prenom} onChange={e => setNewEmployee({ ...newEmployee, prenom: e.target.value })} />
            <Input placeholder="Nom" value={newEmployee.nom} onChange={e => setNewEmployee({ ...newEmployee, nom: e.target.value })} />
            <Input placeholder="Email" type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} />
            <Input placeholder="Téléphone" value={newEmployee.numeroTelephone} onChange={e => setNewEmployee({ ...newEmployee, numeroTelephone: e.target.value })} />
            <Input placeholder="Mot de passe" type="password" value={newEmployee.motDePasse} onChange={e => setNewEmployee({ ...newEmployee, motDePasse: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateEmploye}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier planning</DialogTitle>
            <DialogDescription>Horaires de travail hebdomadaires</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {weekPlanning.map((day, i) => {
              const isLocked = day.jour === 'Dimanche' || day.jour === 'Lundi';
              const allowHourEdit = ['T', 'DC'].includes(day.typeDeJour);
              return (
                <div key={i} className="grid grid-cols-5 items-center gap-2">
                  <Label>{day.jour}</Label>
                  <select
                    value={day.typeDeJour}
                    disabled={isLocked}
                    onChange={e => handleChange(i, 'typeDeJour', e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="T">Travail</option>
                    <option value="DC">Demi-journée</option>
                    <option value="JC">Congé</option>
                    <option value="M">Maladie</option>
                  </select>
                  <Input
                    type="time"
                    min="09:00"
                    max="18:00"
                    value={day.heureDebut.slice(0, 5)}
                    disabled={!allowHourEdit || isLocked}
                    onChange={e => handleChange(i, 'heureDebut', e.target.value + ':00')}
                  />
                  <Input
                    type="time"
                    min="09:00"
                    max="18:00"
                    value={day.heureFin.slice(0, 5)}
                    disabled={!allowHourEdit || isLocked}
                    onChange={e => handleChange(i, 'heureFin', e.target.value + ':00')}
                  />
                  <span className="text-xs text-gray-500">{day.dateDuJour}</span>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalDeplacement} onOpenChange={setModalDeplacement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rendez-vous en conflit</DialogTitle>
            <DialogDescription>Veuillez indiquer une nouvelle date et heure</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {rdvsConflits.map((rdv) => (
              <div key={rdv.id} className="grid grid-cols-4 gap-2 items-center">
                <span>RDV #{rdv.id}</span>
                <Input type="date" onChange={e => handleDeplacementChange(rdv.id, 'nouvelleDate', e.target.value)} />
                <Input type="time" onChange={e => handleDeplacementChange(rdv.id, 'nouvelleHeure', e.target.value + ':00')} />
                <Button onClick={() => handleDeplacerRDV(rdv.id)}>Déplacer</Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setModalDeplacement(false)} variant="outline">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
