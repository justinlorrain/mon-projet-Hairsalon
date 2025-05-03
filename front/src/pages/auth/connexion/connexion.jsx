import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '../../../components/button/button'
import { useAuth } from '../../../context/useAuth'

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Veuillez saisir une adresse email valide')
    .required("L'email est requis"),
  motDePasse: yup
    .string()
    .required('Le mot de passe est requis')
    .min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
})

const Connexion = () => {
  const navigate = useNavigate()
  const { login } = useAuth() // ⬅️ On utilise ici le contexte global pour login

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      const userRole = user?.role

      if (userRole === 'ADMIN') navigate('/admin')
      else if (userRole === 'CLIENT') navigate('/client')
      else if (userRole === 'EMPLOYE') navigate('/employee')
    }
  }, [navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/hair-salon-app/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Échec de la connexion')
      }

      localStorage.setItem('user', JSON.stringify(result))
      login(result) // ✅ met à jour le contexte global

      toast.success('Connexion réussie!')

      // Redirection selon le rôle
      if (result.role === 'ADMIN') navigate('/admin')
      else if (result.role === 'EMPLOYE') navigate('/employee')
      else navigate('/client')
    } catch (error) {
      toast.error(error.message || 'Échec de la connexion. Veuillez réessayer.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">
            Entrez vos identifiants pour accéder à votre compte
          </p>
          <div className="mt-4 h-1 w-16 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`w-full p-2 border rounded-md ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="motDePasse"
                  type="password"
                  autoComplete="current-password"
                  {...register('motDePasse')}
                  className={`w-full p-2 border rounded-md ${
                    errors.motDePasse ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.motDePasse && (
                  <p className="mt-1 text-sm text-red-600">{errors.motDePasse.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/mot-de-passe-oublie"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Mot de passe oublié?
              </Link>
            </div>
          </div>

          <div className="w-full">
            <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Pas encore de compte?{' '}
            <Link to="/inscription" className="font-medium text-blue-600 hover:text-blue-500">
              S'inscrire
            </Link>
          </p>

          <p className="mt-2 text-gray-600">
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
              Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default Connexion
