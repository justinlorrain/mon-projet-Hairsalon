import React, { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../utils/utils'
import { Button } from '../button/button'
import { useNavigate } from 'react-router'
import { useAuth } from '../../context/useAuth'

export const Profile = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState({
        id: null,
        nom: '',
        prenom: '',
        email: '',
        numeroTelephone: '',
    })
    const [passwordData, setPasswordData] = useState({
        oldPass: '',
        newPass: '',
        confirmPass: '',
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [passwordError, setPasswordError] = useState(null)
    const [passwordSuccess, setPasswordSuccess] = useState(null)
    const { user: UserData } = useAuth()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8080/hair-salon-app/user/me',
                    {
                        headers: {
                            Authorization: `Bearer ${UserData.token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch user data')
                }

                const data = await response.json()
                setUser({
                    id: data.id,
                    nom: data.nom,
                    prenom: data.prenom,
                    email: data.email,
                    numeroTelephone: data.numeroTelephone,
                })
                setLoading(false)
            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch(
                
                `http://localhost:8080/hair-salon-app/client/update/${user.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        "Authorization": `Bearer ${UserData.token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        numeroTelephone: user.numeroTelephone,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            setSuccess('Profile updated successfully!')
        } catch (err) {
            setError(err.message)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setPasswordError(null)
        setPasswordSuccess(null)


        if (passwordData.newPass !== passwordData.confirmPass) {
            setPasswordError("New passwords don't match")
            return
        }

        if (!passwordData.oldPass || !passwordData.newPass) {
            setPasswordError('Please fill all fields')
            return
        }

        try {
            const response = await fetch(
                `http://localhost:8080/hair-salon-app/update-user-password/${user.id}/${passwordData.oldPass}/${passwordData.newPass}`,
                {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${UserData.token}`,
                        "Content-Type": "application/json"
                    },
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to change password')
            }

            setPasswordSuccess('Password changed successfully!')
            setPasswordData({
                oldPass: '',
                newPass: '',
                confirmPass: '',
            })
        } catch (err) {
            setPasswordError(err.message)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/connexion')
    }


    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Mon profil</h2>
                    <p className="mt-1 text-slate-600">
                        Gérez vos informations personnelles
                    </p>
                </div>
                <Button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    Se déconnecter
                </Button>
            </div>

            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations personnelles</CardTitle>
                            <CardDescription>Modifier vos coordonnées</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Prénom
                                            </label>
                                            <input
                                                type="text"
                                                name="prenom"
                                                className="w-full p-2 border border-slate-300 rounded-md"
                                                value={user.prenom}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Nom
                                            </label>
                                            <input
                                                type="text"
                                                name="nom"
                                                className="w-full p-2 border border-slate-300 rounded-md"
                                                value={user.nom}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full p-2 border border-slate-300 rounded-md bg-slate-100"
                                            value={user.email}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            name="numeroTelephone"
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            value={user.numeroTelephone}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit">Enregistrer les modifications</Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Modifier le mot de passe</CardTitle>
                            <CardDescription>
                                Mettre à jour votre mot de passe
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Mot de passe actuel
                                        </label>
                                        <input
                                            type="password"
                                            name="oldPass"
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            value={passwordData.oldPass}
                                            onChange={handlePasswordChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            name="newPass"
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            value={passwordData.newPass}
                                            onChange={handlePasswordChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Confirmer le mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPass"
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            value={passwordData.confirmPass}
                                            onChange={handlePasswordChange}
                                        />
                                    </div>

                                    {passwordError && (
                                        <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
                                            {passwordError}
                                        </div>
                                    )}

                                    {passwordSuccess && (
                                        <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">
                                            {passwordSuccess}
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <Button type="submit">Changer le mot de passe</Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
