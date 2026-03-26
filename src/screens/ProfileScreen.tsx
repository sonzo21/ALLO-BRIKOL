import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, Shield, Bell, Settings, HelpCircle, Hammer, Briefcase } from 'lucide-react';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';
import { CITIES } from '../constants';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!profile) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 mt-8 mb-12">
        <div className="relative">
          <img
            src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/200`}
            alt={profile.displayName}
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
            referrerPolicy="no-referrer"
          />
          <div className={cn(
            "absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg",
            profile.role === 'artisan' ? "bg-orange-500" : "bg-blue-600"
          )}>
            {profile.role === 'artisan' ? <Hammer className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{profile.displayName || 'Utilisateur'}</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mt-1">{profile.role === 'artisan' ? 'Artisan Professionnel' : 'Client'}</p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Nom complet</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Téléphone</label>
              <input
                type="tel"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Ville</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              >
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 py-3" onClick={() => setEditing(false)}>Annuler</Button>
            <Button type="submit" className="flex-1 py-3" isLoading={saving}>Enregistrer</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          {/* Menu Sections */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Paramètres du compte</h2>
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <button onClick={() => setEditing(true)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">Informations personnelles</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
              
              {profile.role === 'artisan' && (
                <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-gray-700">Profil professionnel</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              )}

              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">Sécurité et confidentialité</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Aide et support</h2>
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">Centre d'aide</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">Paramètres de l'application</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors border border-red-100"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
