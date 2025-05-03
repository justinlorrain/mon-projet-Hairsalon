import React, { useEffect, useState } from 'react';
import { Input } from '../input/input';
import { Label } from '../label';
import { Button } from '../button/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../utils/utils';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';

export const BookForClient = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [estimatedDuration, setEstimatedDuration] = useState('00:00:00');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    numeroTelephone: '',
    employeId: '',
    date: '',
    heure: '',
    servicesIds: [],
  });

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [empRes, servRes] = await Promise.all([
          fetch('http://localhost:8080/hair-salon-app/employe/get-all', {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch('http://localhost:8080/hair-salon-app/services', {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);
        const [empData, servData] = await Promise.all([empRes.json(), servRes.json()]);
        setEmployees(empData);
        setServices(servData);
      } catch (err) {
        toast.error("Erreur de chargement des données");
      }
    };

    fetchInitData();
  }, [user.token]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/hair-salon-app/client/search?query=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, user.token]);

  const calculateDuration = (selectedIds) => {
    const selectedServices = services.filter(s => selectedIds.includes(s.id));
    let totalMinutes = 0;
    selectedServices.forEach(service => {
      const [hours, minutes] = service.duree.split(':').map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const handleServiceChange = (id) => {
    setForm(prev => {
      const isSelected = prev.servicesIds.includes(id);
      const newServices = isSelected
        ? prev.servicesIds.filter(s => s !== id)
        : [...prev.servicesIds, id];

      const newDuration = calculateDuration(newServices);
      setEstimatedDuration(newDuration);

      return {
        ...prev,
        servicesIds: newServices,
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectSuggestion = (client) => {
    setForm(prev => ({
      ...prev,
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      numeroTelephone: client.numeroTelephone
    }));
    setSearchQuery(`${client.prenom} ${client.nom}`);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dureeFinale = calculateDuration(form.servicesIds);
    const formattedHeure = form.heure.length === 5 ? `${form.heure}:00` : form.heure;

    const payload = {
      client: {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        numeroTelephone: form.numeroTelephone
      },
      rendezVous: {
        date: form.date,
        heure: formattedHeure,
        duree: dureeFinale,
        employeDto: {
          id: parseInt(form.employeId)
        }
      },
      servicesId: form.servicesIds
    };

    try {
      const res = await fetch(
        'http://localhost:8080/hair-salon-app/employe/prendre-rendez-vous-client-sans-compte',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        toast.success('✅ Rendez-vous enregistré');
        setForm({
          nom: '', prenom: '', email: '', numeroTelephone: '', employeId: '', date: '', heure: '', servicesIds: []
        });
        setEstimatedDuration('00:00:00');
        setSearchQuery('');
        setSuggestions([]);
      } else {
        const err = await res.json();
        toast.error(err.data || 'Erreur serveur');
      }
    } catch (err) {
      toast.error(err.message || 'Erreur réseau');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prendre un rendez-vous pour un client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-6 relative">
            <Label>🔍 Rechercher un client</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nom, prénom ou téléphone"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
              />
              <Button type="button" variant="ghost" onClick={() => {
                setSearchQuery('');
                setForm({ nom: '', prenom: '', email: '', numeroTelephone: '', employeId: '', date: '', heure: '', servicesIds: [] });
                setSuggestions([]);
              }}>
                Réinitialiser
              </Button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute bg-white border w-full z-10 mt-1 max-h-40 overflow-y-auto shadow rounded">
                {suggestions.map((client, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleSelectSuggestion(client)}
                  >
                    {client.prenom} {client.nom} — {client.numeroTelephone}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom</Label>
              <Input name="nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div>
              <Label>Prénom</Label>
              <Input name="prenom" value={form.prenom} onChange={handleChange} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input name="numeroTelephone" value={form.numeroTelephone} onChange={handleChange} required />
            </div>
            <div>
              <Label>Employé</Label>
              <select
                name="employeId"
                value={form.employeId}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
              >
                <option value="">-- Choisir un employé --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.prenom} {emp.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div>
              <Label>Heure</Label>
              <Input type="time" name="heure" value={form.heure} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <Label>Soins demandés</Label>
            <div className="grid grid-cols-2 gap-2">
              {services.map(service => (
                <label key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.servicesIds.includes(service.id)}
                    onChange={() => handleServiceChange(service.id)}
                  />
                  <span>{service.nom}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Durée estimée : <strong>{estimatedDuration}</strong></p>
          </div>

          <Button type="submit" className="mt-4">
            Enregistrer le rendez-vous
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
