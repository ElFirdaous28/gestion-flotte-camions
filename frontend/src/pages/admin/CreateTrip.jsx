export default function CreateTrip() {
    return (
        <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-text">Créer un Nouveau Trajet</h2>
                <p className="mt-1 text-text-muted">Remplissez les informations du trajet</p>
            </div>

            {/* */}
            <form className="rounded-lg shadow-md p-6 space-y-6 bg-surface">

                {/* */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-text">Véhicule et Chauffeur</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div >
                            <label className="block mb-2 font-medium text-text">Chauffeur *</label>
                            <select required className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Sélectionner un chauffeur</option>
                                <option>Mohammed El Amrani</option>
                                <option>Fatima Zahra</option>
                                <option>Hassan Benali</option>
                            </select>
                        </div>
                        <div></div>
                        <div></div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Camion *</label>
                            <select required className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Sélectionner un camion</option>
                                <option>ABC-1234 - Volvo FH16</option>
                                <option>DEF-5678 - Mercedes Actros</option>
                                <option>GHI-9012 - Scania R450</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Remorque *</label>
                            <select required className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Sélectionner une remorque</option>
                                <option>REM-001 - Frigorifique</option>
                                <option>REM-002 - Bâchée</option>
                                <option>REM-003 - Citerne</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-text">Itinéraire</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-medium text-text">Lieu de Départ *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Casablanca Port"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Lieu d'Arrivée *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Marrakech Entrepôt"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-text">Planification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-2 font-medium text-text">Date de Départ *</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Date d'Arrivée Prévue *</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Statut</label>
                            <select defaultValue="À faire" className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>À faire</option>
                                <option>En cours</option>
                                <option>Terminé</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-text">Carburant</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-2 font-medium text-text">Carburant Planifié (L)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Ex: 500"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Carburant Départ (L)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Ex: 800"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Carburant Arrivée (L)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Ex: 300"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-text">Kilométrage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-medium text-text">KM Départ</label>
                            <input
                                type="number"
                                placeholder="Ex: 145320"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">KM Arrivée</label>
                            <input
                                type="number"
                                placeholder="Ex: 145750"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-text">Informations de Cargaison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-medium text-text">Type de Transport *</label>
                            <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Sélectionner le type</option>
                                <option>Marchandises générales</option>
                                <option>Produits frais</option>
                                <option>Liquides</option>
                                <option>Matériaux de construction</option>
                                <option>Produits dangereux</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Poids de la Cargaison (Kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Ex: 18.5"
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-text">Détails Additionnels</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-text">Description</label>
                            <textarea
                                rows="3"
                                placeholder="Description de la marchandise et du trajet..."
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary">
                            </textarea>
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-text">Notes</label>
                            <textarea
                                rows="3"
                                placeholder="Notes supplémentaires, instructions spéciales..."
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary">
                            </textarea>
                        </div>
                    </div>
                </div>

                {/* */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-lg border border-border bg-background text-text hover:opacity-80 transition font-medium">
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="px-6 py-3 rounded-lg border border-border bg-surface text-text hover:opacity-80 transition font-medium">
                        Enregistrer comme brouillon
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-lg bg-primary text-white hover:opacity-90 transition font-semibold shadow-md">
                        Créer le Trajet
                    </button>
                </div>

            </form>

        </div>
    )
}