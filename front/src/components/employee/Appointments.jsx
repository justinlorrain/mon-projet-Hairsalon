// ...imports
import React, { useEffect, useState } from 'react'
import { Button } from '../button/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../../utils/utils'
import { Calendar, Scissors, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '../Dialog'
import { Input } from '../input/input'
import { Label } from '../label'
import toast from 'react-hot-toast'

export const Appointments = ({ navigateTo }) => {
	const [appointments, setAppointments] = useState([])
	const [currentPage, setCurrentPage] = useState(1)
	const perPage = 5

	const [selectedAppointment, setSelectedAppointment] = useState(null)
	const [newDate, setNewDate] = useState('')
	const [newTime, setNewTime] = useState('')
	const [moveModalOpen, setMoveModalOpen] = useState(false)
	const [cancelModalOpen, setCancelModalOpen] = useState(false)

	const { user } = useAuth()

	const fetchAppointments = async () => {
		try {
			const res = await fetch(
				'http://localhost:8080/hair-salon-app/employe/tous-les-rendez-vous',
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
						'Content-Type': 'application/json',
					},
				}
			)
			const data = await res.json()
			const sorted = data.sort(
				(a, b) =>
					new Date(`${a.date}T${a.heure}`) - new Date(`${b.date}T${b.heure}`)
			)
			setAppointments(sorted)
		} catch (err) {
			toast.error('Erreur lors du chargement des rendez-vous')
		}
	}

	useEffect(() => {
		if (user?.token) fetchAppointments()
	}, [user?.token])

	const handleMove = async () => {
		if (!newDate || !newTime) {
			return toast.error('Date ou heure manquante')
		}

		try {
			const response = await fetch(
				`http://localhost:8080/hair-salon-app/employe/deplacer-rendez-vous/${selectedAppointment.id}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${user.token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						nouvelleDate: newDate,
						nouvelleHeure: newTime,
					}),
				}
			)
			const result = await response.json()
			if (!response.ok) throw new Error(result.message || 'Erreur')

			toast.success('Rendez-vous déplacé')
			fetchAppointments()
			setMoveModalOpen(false)
		} catch (err) {
			toast.error(err.message)
		}
	}

	const handleCancel = async () => {
		try {
			const response = await fetch(
				`http://localhost:8080/hair-salon-app/employe/annuler-rendez-vous/${selectedAppointment.id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${user.token}`,
						'Content-Type': 'application/json',
					},
				}
			)
			const result = await response.json()
			if (!response.ok) throw new Error(result.message || 'Erreur')

			toast.success('Rendez-vous annulé')
			fetchAppointments()
			setCancelModalOpen(false)
		} catch (err) {
			toast.error(err.message)
		}
	}

	const handleCreerFacture = async (rdvId, empId) => {
		try {
			const res = await fetch(
				`http://localhost:8080/hair-salon-app/employe/create-facture/${rdvId}/${empId}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)

			if (!res.ok) {
				const errorText = await res.text()
				throw new Error(errorText || 'Erreur lors de la création de la facture')
			}

			// ✅ On reçoit le PDF
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)

			const link = document.createElement('a')
			link.href = url
			link.download = `facture_${rdvId}.pdf`
			document.body.appendChild(link)
			link.click()
			link.remove()

			toast.success('✅ Facture créée et téléchargée !')
			await new Promise((resolve) => setTimeout(resolve, 300))
			fetchAppointments() // Recharge la liste
		} catch (err) {
			toast.error(err.message || 'Erreur réseau')
		}
	}
	const handleDownloadFacture = async (factureId) => {
		try {
			const response = await fetch(
				`http://localhost:8080/hair-salon-app/factures/${factureId}/download`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)

			if (!response.ok) {
				throw new Error('Erreur lors du téléchargement')
			}

			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `facture_${factureId}.pdf`)
			document.body.appendChild(link)
			link.click()
			link.remove()
		} catch (err) {
			toast.error('❌ Impossible de télécharger la facture')
		}
	}

	const handlePayerFacture = async (factureId) => {
		try {
			const res = await fetch(
				`http://localhost:8080/hair-salon-app/employe/facture/${factureId}/payer`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${user.token}`,
						'Content-Type': 'application/json',
					},
				}
			)
			const data = await res.json()
			if (!res.ok) throw new Error(data.message || 'Erreur')

			toast.success('Paiement effectué !')
			fetchAppointments()
		} catch (err) {
			toast.error(err.message)
		}
	}

	const isPast = (appointment) => {
		const now = new Date()
		const time = new Date(`${appointment.date}T${appointment.heure}`)
		return time < now
	}

	const paginated = appointments.slice(
		(currentPage - 1) * perPage,
		currentPage * perPage
	)
	const totalPages = Math.ceil(appointments.length / perPage)

	return (
		<>
			<div className="mb-8">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-3xl font-bold">Mes rendez-vous</h2>
						<p className="text-slate-500 mt-1">
							Gérez vos rendez-vous clients ici
						</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Liste des rendez-vous</CardTitle>
				</CardHeader>
				<CardContent>
					{paginated.map((a) => (
						<div
							key={a.id}
							className="bg-slate-50 rounded-lg p-4 mb-4 border flex flex-col md:flex-row justify-between"
						>
							<div className="flex gap-3">
								<div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center">
									<Scissors size={20} />
								</div>
								<div>
									<p className="font-medium">
										{a.serviceRendezVousDtos
											.map((s) => s.servicesDto.nom)
											.join(', ')}
									</p>
									<p className="text-sm text-slate-500">
										Client : {a.clientDto.prenom} {a.clientDto.nom}
									</p>
									<p className="text-sm text-slate-500">
										Employé : {a.employeDto.prenom} {a.employeDto.nom}
									</p>
									<p className="text-sm text-slate-500">
										📅 {a.date} à {a.heure}
									</p>
								</div>
							</div>
							<div className="flex flex-wrap gap-2 mt-3 md:mt-0 md:justify-end">
								<Button
									onClick={() => {
										setSelectedAppointment(a)
										setMoveModalOpen(true)
									}}
									disabled={isPast(a) || (a.factureCreee && a.estPayee)}
								>
									Déplacer
								</Button>

								<Button
									variant="destructive"
									onClick={() => {
										setSelectedAppointment(a)
										setCancelModalOpen(true)
									}}
								>
									Annuler
								</Button>
								{!a.factureCreee && (
									<Button
										className="bg-indigo-600 text-white"
										onClick={() => handleCreerFacture(a.id, a.employeDto.id)}
										disabled={isPast(a)}
									>
										Créer facture
									</Button>
								)}
								{a.factureCreee && !a.estPayee && (
									<Button
										className="bg-yellow-500 text-white"
										onClick={() => handlePayerFacture(a.factureId)}
										disabled={isPast(a)}
									>
										Payer
									</Button>
								)}
								{a.factureCreee && a.estPayee && (
									<>
										<span className="text-green-600 flex items-center gap-1 text-sm">
											<CheckCircle size={16} /> Payée
										</span>
										<Button
											variant="outline"
											className="text-xs"
											onClick={() => handleDownloadFacture(a.factureId)}
										>
											📥 Télécharger
										</Button>
									</>
								)}
							</div>
						</div>
					))}
				</CardContent>
				<div className="flex justify-between items-center p-4 border-t">
					<Button
						disabled={currentPage === 1}
						onClick={() => setCurrentPage((p) => p - 1)}
					>
						Précédent
					</Button>
					<p className="text-sm">
						Page {currentPage} sur {totalPages}
					</p>
					<Button
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage((p) => p + 1)}
					>
						Suivant
					</Button>
				</div>
			</Card>

			{/* Déplacer Modal */}
			<Dialog open={moveModalOpen} onOpenChange={setMoveModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Déplacer le rendez-vous</DialogTitle>
						<DialogDescription>
							Choisissez une nouvelle date et heure
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label>Date</Label>
							<Input
								type="date"
								value={newDate}
								onChange={(e) => setNewDate(e.target.value)}
							/>
						</div>
						<div>
							<Label>Heure</Label>
							<Input
								type="time"
								value={newTime}
								onChange={(e) => setNewTime(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setMoveModalOpen(false)}>
							Annuler
						</Button>
						<Button onClick={handleMove}>Confirmer</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Annuler Modal */}
			<Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Annuler le rendez-vous</DialogTitle>
						<DialogDescription>
							Souhaitez-vous annuler ce rendez-vous ?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCancelModalOpen(false)}>
							Retour
						</Button>
						<Button variant="destructive" onClick={handleCancel}>
							Confirmer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
