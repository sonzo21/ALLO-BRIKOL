import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { LayoutGrid, Plus, MapPin, Calendar, MessageSquare, ChevronRight, Search, Filter, Hammer } from 'lucide-react';
import { db, auth } from '../firebase';
import { ServiceRequest } from '../types';
import { CATEGORIES, CITIES } from '../constants';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RequestsScreen() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<ServiceRequest>>({
    title: '',
    description: '',
    city: 'Casablanca',
    category: 'plomberie',
    status: 'open',
  });
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest)));
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const requestData = {
        ...newRequest,
        clientId: user.uid,
        clientName: profile?.displayName || 'Utilisateur',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'requests'), requestData);
      setShowModal(false);
      setNewRequest({ title: '', description: '', city: 'Casablanca', category: 'plomberie', status: 'open' });
      fetchRequests();
    } catch (error) {
      console.error('Error adding request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-6 mt-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de service</h1>
          <p className="text-gray-500 text-sm">Trouvez un artisan pour vos travaux</p>
        </div>
        {profile?.role === 'client' && (
          <button
            onClick={() => setShowModal(true)}
            className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Hammer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{req.title}</h3>
                    <p className="text-xs text-gray-400">
                      {req.createdAt?.toDate ? format(req.createdAt.toDate(), 'dd MMMM yyyy', { locale: fr }) : 'Récemment'}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  req.status === 'open' ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                )}>
                  {req.status === 'open' ? 'Ouverte' : 'Fermée'}
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{req.description}</p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{req.city}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <LayoutGrid className="w-3 h-3" />
                  <span>{CATEGORIES.find(c => c.id === req.category)?.nameFr || req.category}</span>
                </div>
              </div>

              {profile?.role === 'artisan' && req.status === 'open' && (
                <Button className="w-full py-3 rounded-xl flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Répondre à la demande
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            Aucune demande pour le moment.
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Publier une demande</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Titre de la demande</label>
                <input
                  type="text"
                  placeholder="Ex: Cherche plombier pour fuite"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newRequest.title}
                  onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Catégorie</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newRequest.category}
                    onChange={e => setNewRequest({ ...newRequest, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.nameFr}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Ville</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newRequest.city}
                    onChange={e => setNewRequest({ ...newRequest, city: e.target.value })}
                  >
                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea
                  placeholder="Détaillez votre besoin..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  value={newRequest.description}
                  onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full py-4 text-lg shadow-lg shadow-blue-200" isLoading={submitting}>
                Publier la demande
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
