import React, { useEffect, useState } from 'react'
import { Button } from '../button/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../utils/utils'
import { Calendar } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

export const AdminAppointements = () => {
	const { user } = useAuth()
	const [planning, setPlanning] = useState([])
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [error, setError] = useState(null)

	const fetchPlanning = async (monthDate) => {
		const mois = monthDate.getMonth() + 1
		const annee = monthDate.getFullYear()

		try {
			const response = await fetch(
				`http://localhost:8080/hair-salon-app/employes/planning-global?mois=${mois}&annee=${annee}`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
						'Content-Type': 'application/json',
					},
				}
			)
			const data = await response.json()
			setPlanning(data)
		} catch (err) {
			setError(err.message)
		}
	}

	useEffect(() => {
		fetchPlanning(currentMonth)
	}, [currentMonth])

	const nextMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		)
	}

	const prevMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		)
	}

	const filteredPlanning = planning.filter((p) => {
		const date = new Date(p.date)
		return (
			date.getMonth() === currentMonth.getMonth() &&
			date.getFullYear() === currentMonth.getFullYear()
		)
	})

	const groupedByEmploye = filteredPlanning.reduce((acc, jour) => {
		if (!acc[jour.employeId]) {
			acc[jour.employeId] = {
				nom: jour.employeNom,
				jours: [],
			}
		}
		acc[jour.employeId].jours.push(jour)
		return acc
	}, {})

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold">Planning global du mois</h2>
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
												<td className="p-2 border align-top">{jour.date}</td>
												<td className="p-2 border align-top">
													{jour.typeDeJour === 'JC' ||
													jour.typeDeJour === 'DC' ? (
														<>
															<strong>{jour.typeDeJour}</strong>{' '}
															{jour.commentaire && (
																<span className="text-orange-600 ml-1">
																	({jour.commentaire})
																</span>
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
																<li key={i} className="text-xs">
																	<span className="text-blue-600 font-semibold">
																		{r.heure}
																	</span>{' '}
																	-{' '}
																	<span className="text-blue-600 font-semibold">
																		{r.heureFin || '?'}
																	</span>{' '}
																	→
																	<span className="text-green-700 font-medium ml-1">
																		{r.clientPrenom} {r.clientNom}
																	</span>
																	<span className="text-slate-500 ml-1">
																		({r.clientTel})
																	</span>
																	<span className="text-purple-600 ml-1">
																		[{r.clientEmail}]
																	</span>
																	•{' '}
																	<span className="text-pink-600 font-semibold">
																		{r.serviceNom}
																	</span>
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
	)
}
