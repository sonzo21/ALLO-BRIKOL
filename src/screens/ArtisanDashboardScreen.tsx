import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Hammer, Save, User, MapPin, Briefcase, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { ArtisanProfile } from '../types';
import { CATEGORIES, CITIES } from '../constants';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function ArtisanDashboardScreen() {
  const { user, profile } = useAuth();
  const [artisan, setArtisan] = useState<Partial<ArtisanProfile>>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    city: 'Casablanca',
    description: '',
    categories: [],
    hourlyRate: 0,
    isActive: true,
    rating: 5,
    reviewCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchArtisan = async () => {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, 'artisans', user.uid));
        if (docSnap.exists()) {
          setArtisan(docSnap.data() as ArtisanProfile);
        } else {
          // Initialize with user profile data if artisan doc doesn't exist
          setArtisan(prev => ({
            ...prev,
            uid: user.uid,
            firstName: profile?.displayName?.split(' ')[0] || '',
            lastName: profile?.displayName?.split(' ').slice(1).join(' ') || '',
            phoneNumber: profile?.phoneNumber || '',
            city: profile?.city || 'Casablanca',
            photoURL: profile?.photoURL || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching artisan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisan();
  }, [user, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      const artisanData = {
        ...artisan,
        uid: user.uid,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'artisans', user.uid), artisanData, { merge: true });
      setMessage({ type: 'success', text: 'Profil professionnel mis à jour avec succès !' });
    } catch (error) {
      console.error('Error saving artisan profile:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (catId: string) => {
    const current = artisan.categories || [];
    if (current.includes(catId)) {
      setArtisan({ ...artisan, categories: current.filter(id => id !== catId) });
    } else {
      setArtisan({ ...artisan, categories: [...current, catId] });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Hammer className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm">Gérez votre profil professionnel</p>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl mb-6 flex items-center gap-3 border",
          message.type === 'success' ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations personnelles
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Prénom</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={artisan.firstName}
                onChange={e => setArtisan({ ...artisan, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Nom</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={artisan.lastName}
                onChange={e => setArtisan({ ...artisan, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Téléphone</label>
            <input
              type="tel"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={artisan.phoneNumber}
              onChange={e => setArtisan({ ...artisan, phoneNumber: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Ville</label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={artisan.city}
              onChange={e => setArtisan({ ...artisan, city: e.target.value })}
            >
              {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Profil professionnel
          </h2>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Description des compétences</label>
            <textarea
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
              placeholder="Décrivez votre expérience et vos spécialités..."
              value={artisan.description}
              onChange={e => setArtisan({ ...artisan, description: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase">Catégories de services</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-2",
                    artisan.categories?.includes(cat.id) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-100 hover:border-blue-200"
                  )}
                >
                  <span className="text-lg">🛠️</span>
                  {cat.nameFr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Tarif indicatif (DH/heure)
            </label>
            <input
              type="number"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={artisan.hourlyRate}
              onChange={e => setArtisan({ ...artisan, hourlyRate: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              artisan.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
            )}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Disponibilité</p>
              <p className="text-xs text-gray-500">{artisan.isActive ? 'Actif - Vous apparaissez dans les recherches' : 'Inactif - Vous êtes masqué'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setArtisan({ ...artisan, isActive: !artisan.isActive })}
            className={cn(
              "w-14 h-8 rounded-full transition-all relative",
              artisan.isActive ? "bg-blue-600" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
              artisan.isActive ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        <Button type="submit" className="w-full py-4 text-lg shadow-lg shadow-blue-200" isLoading={saving}>
          <Save className="w-5 h-5 mr-2" />
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  );
}
