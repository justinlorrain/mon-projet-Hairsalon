import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "../../../components/button/button";


const schema = yup.object().shape({
	nom: yup
		.string()
		.required("Le nom est requis")
		.min(2, "Le nom doit contenir au moins 2 caractères"),
	prenom: yup
		.string()
		.required("Le prénom est requis")
		.min(2, "Le prénom doit contenir au moins 2 caractères"),
	email: yup
		.string()
		.email("Veuillez saisir une adresse email valide")
		.required("L'email est requis"),
	motDePasse: yup
		.string()
		.required("Le mot de passe est requis")
		.min(6, "Le mot de passe doit contenir au moins 6 caractères"),
	confirmMotDePasse: yup
		.string()
		.oneOf([yup.ref("motDePasse")], "Les mots de passe ne correspondent pas")
		.required("Veuillez confirmer votre mot de passe"),
	numeroTelephone: yup
		.string()
		.required("Le numéro de téléphone est requis"),
	role: yup.string().default("CLIENT"),
});

const Inscription = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			const user = JSON.parse(storedUser);
			const userRole = user?.role;

			if (userRole === "ADMIN") {
				navigate("/admin");
			} else if (userRole === "CLIENT") {
				navigate("/client");
			}
		}
	}, [navigate]);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			role: "CLIENT",
		},
	});

	const onSubmit = async (data) => {
		const { ...registrationData } = data;

		try {
			const response = await fetch("/hair-salon-app/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(registrationData),
			});

			const result = await response.json();

			console.log(result)

			if (result.email) {
				toast.success(
					"Inscription réussie! Vous pouvez maintenant vous connecter."
				);

				navigate("/connexion");
			}

			if (!response.ok) {
				throw new Error(result.data || "Échec de l'inscription");
			}



		} catch (error) {
			toast.error(
				error.message || "Échec de l'inscription. Veuillez réessayer."
			);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
				<div className="text-center">
					<h2 className="text-3xl font-bold text-gray-900">Inscription</h2>
					<p className="mt-2 text-sm text-gray-600">
						Créez votre compte pour prendre rendez-vous
					</p>
					<div className="mt-4 h-1 w-16 bg-blue-600 mx-auto rounded-full"></div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
					<div className="space-y-4">
						<div className="flex space-x-4">
							<div>
								<label
									htmlFor="nom"
									className="block text-sm font-medium text-gray-700"
								>
									Nom
								</label>
								<div className="mt-1">
									<input
										id="nom"
										type="text"
										autoComplete="family-name"
										{...register("nom")}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors.nom ? "border-red-500" : "border-gray-300"
											}`}
									/>
									{errors.nom && (
										<p className="mt-1 text-sm text-red-600">
											{errors.nom.message}
										</p>
									)}
								</div>
							</div>

							<div>
								<label
									htmlFor="prenom"
									className="block text-sm font-medium text-gray-700"
								>
									Prénom
								</label>
								<div className="mt-1">
									<input
										id="prenom"
										type="text"
										autoComplete="given-name"
										{...register("prenom")}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors.prenom ? "border-red-500" : "border-gray-300"
											}`}
									/>
									{errors.prenom && (
										<p className="mt-1 text-sm text-red-600">
											{errors.prenom.message}
										</p>
									)}
								</div>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email
							</label>
							<div className="mt-1">
								<input
									id="email"
									type="email"
									autoComplete="email"
									{...register("email")}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors.email ? "border-red-500" : "border-gray-300"
										}`}
								/>
								{errors.email && (
									<p className="mt-1 text-sm text-red-600">
										{errors.email.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="numeroTelephone"
								className="block text-sm font-medium text-gray-700"
							>
								Numéro de téléphone
							</label>
							<div className="mt-1">
								<input
									id="numeroTelephone"
									type="tel"
									autoComplete="tel"
									{...register("numeroTelephone")}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors.numeroTelephone
										? "border-red-500"
										: "border-gray-300"
										}`}
									placeholder="0612345678"
								/>
								{errors.numeroTelephone && (
									<p className="mt-1 text-sm text-red-600">
										{errors.numeroTelephone.message}
									</p>
								)}
							</div>
						</div>

						<div className="flex space-x-4">
							<div>
								<label
									htmlFor="motDePasse"
									className="block text-sm font-medium text-gray-700"
								>
									Mot de passe
								</label>
								<div className="mt-1">
									<input
										id="motDePasse"
										type="password"
										autoComplete="new-password"
										{...register("motDePasse")}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors.motDePasse ? "border-red-500" : "border-gray-300"
											}`}
									/>
									{errors.motDePasse && (
										<p className="mt-1 text-sm text-red-600">
											{errors.motDePasse.message}
										</p>
									)}
								</div>
							</div>

							<div>
								<label
									htmlFor="confirmMotDePasse"
									className="block text-sm font-medium text-gray-700"
								>
									Confirmer le mot de passe
								</label>
								<div className="mt-1">
									<input
										id="confirmMotDePasse"
										type="password"
										autoComplete="new-password"
										{...register("confirmMotDePasse")}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors.confirmMotDePasse
											? "border-red-500"
											: "border-gray-300"
											}`}
									/>
									{errors.confirmMotDePasse && (
										<p className="mt-1 text-sm text-red-600">
											{errors.confirmMotDePasse.message}
										</p>
									)}
								</div>
							</div>
						</div>

						<input type="hidden" {...register("role")} value="CLIENT" />
					</div>

					<div>
						<Button className="mt-4 w-full" type="submit" disabled={isSubmitting} >
							{isSubmitting ? "Inscription en cours..." : "S'inscrire"}
						</Button>
					</div>
				</form>

				<div className="text-center text-sm">
					<p className="text-gray-600">
						Déjà un compte?{" "}
						<Link
							to="/connexion"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Se connecter
						</Link>
					</p>

					<p className="mt-2 text-gray-600">
						<Link
							to="/"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Retour à l'accueil
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Inscription;
