import React, { useEffect, useState } from "react";
import { Button } from "../components/button/button";
import { useAuth } from "../context/useAuth";

const GererCongePage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [congeType, setCongeType] = useState("MATIN"); // 'MATIN', 'APRES_MIDI', 'JOURNEE'

  const ajouterConge = async () => {
    if (!selectedEmployeeId || !date) return alert("Remplis tous les champs");

    let typeDeJour = "DC"; // DC = Demi-Conge
    let matin = false;

    if (congeType === "MATIN") {
      typeDeJour = "DC";
      matin = true;
    } else if (congeType === "APRES_MIDI") {
      typeDeJour = "DC";
      matin = false;
    } else {
      typeDeJour = "X"; // 'X' = toute la journée, ou adapte selon ton enum si besoin
    }

    try {
      const response = await fetch("http://localhost:8080/hair-salon-app/ajouter-jour-conge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeId: selectedEmployeeId,
          date: date,
          typeDeJour: typeDeJour,
          matin: congeType === "JOURNEE" ? null : matin, // null ou pas envoyé si journée complète
        }),
      });

      const result = await response.json();
if (response.ok) {
  alert(result.data || "✅ Congé ajouté !");
} else {
  alert(result.data || "❌ Une erreur s’est produite.");
}

    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau");
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:8080/hair-salon-app/employe/get-all", {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, [user.token]);

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Gérer les congés</h2>

      <label className="block">
        <span>Employé :</span>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Choisir --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.prenom} {emp.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span>Date :</span>
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <div className="space-y-2">
        <p className="font-medium">Type de congé :</p>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="typeConge"
            value="MATIN"
            checked={congeType === "MATIN"}
            onChange={() => setCongeType("MATIN")}
          />
          Matin uniquement
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="typeConge"
            value="APRES_MIDI"
            checked={congeType === "APRES_MIDI"}
            onChange={() => setCongeType("APRES_MIDI")}
          />
          Après-midi uniquement
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="typeConge"
            value="JOURNEE"
            checked={congeType === "JOURNEE"}
            onChange={() => setCongeType("JOURNEE")}
          />
          Toute la journée
        </label>
      </div>

      <Button onClick={ajouterConge} className="bg-blue-600 text-white">
        Ajouter Congé
      </Button>
    </div>
  );
};

export default GererCongePage;
