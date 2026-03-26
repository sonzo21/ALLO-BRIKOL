import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Phone, MessageSquare, MapPin, Star, ChevronLeft, Share2, Heart, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { db, auth } from '../firebase';
import { ArtisanProfile, Review, Chat } from '../types';
import { CATEGORIES } from '../constants';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ArtisanDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchArtisanData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'artisans', id));
        if (docSnap.exists()) {
          setArtisan(docSnap.data() as ArtisanProfile);
          
          // Fetch reviews
          const q = query(collection(db, 'reviews'), where('artisanId', '==', id));
          const querySnapshot = await getDocs(q);
          setReviews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
        }
      } catch (error) {
        console.error('Error fetching artisan data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanData();
  }, [id]);

  const handleCall = () => {
    if (artisan?.phoneNumber) {
      window.open(`tel:${artisan.phoneNumber}`, '_self');
    }
  };

  const handleChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id) return;

    try {
      // Check if chat already exists
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      let existingChat = querySnapshot.docs.find(doc => 
        (doc.data() as Chat).participants.includes(id)
      );

      if (existingChat) {
        navigate(`/chats/${existingChat.id}`);
      } else {
        // Create new chat
        const newChat: Partial<Chat> = {
          participants: [user.uid, id],
          updatedAt: serverTimestamp(),
          lastMessage: 'Nouveau chat'
        };
        const docRef = await addDoc(collection(db, 'chats'), newChat);
        navigate(`/chats/${docRef.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!artisan) return <div className="text-center py-12">Artisan non trouvé.</div>;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header Image */}
      <div className="relative h-64 w-full">
        <img
          src={artisan.photoURL || `https://picsum.photos/seed/${artisan.uid}/800/600`}
          alt={`${artisan.firstName} ${artisan.lastName}`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{artisan.firstName} {artisan.lastName}</h1>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{artisan.city}</span>
              </div>
            </div>
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-blue-700 font-bold">{artisan.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {artisan.categories.map(cat => (
              <span key={cat} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {CATEGORIES.find(c => c.id === cat)?.nameFr || cat}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Tarif</span>
              <span className="text-blue-600 font-bold">{artisan.hourlyRate ? `${artisan.hourlyRate} DH/h` : 'Sur devis'}</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-gray-100">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Expérience</span>
              <span className="text-gray-900 font-bold">5+ ans</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Avis</span>
              <span className="text-gray-900 font-bold">{artisan.reviewCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-8">
        <div className="flex gap-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('about')}
            className={cn(
              "pb-3 text-sm font-bold transition-all border-b-2",
              activeTab === 'about' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
            )}
          >
            À propos
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "pb-3 text-sm font-bold transition-all border-b-2",
              activeTab === 'reviews' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
            )}
          >
            Avis ({artisan.reviewCount})
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'about' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {artisan.description || "Aucune description fournie."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Disponibilité</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Jours</p>
                      <p className="text-sm font-medium">Lun - Sam</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Horaires</p>
                      <p className="text-sm font-medium">08:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Cet artisan a été vérifié par notre équipe et possède tous les outils nécessaires pour vos travaux.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {review.clientName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.clientName}</p>
                          <p className="text-xs text-gray-400">
                            {review.createdAt?.toDate ? format(review.createdAt.toDate(), 'dd MMMM yyyy', { locale: fr }) : 'Récemment'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 italic">
                  Aucun avis pour le moment. Soyez le premier à en laisser un !
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-4 z-50">
        <Button
          variant="outline"
          className="flex-1 py-4 rounded-2xl flex items-center gap-2 border-2"
          onClick={handleChat}
        >
          <MessageSquare className="w-5 h-5" />
          Message
        </Button>
        <Button
          className="flex-1 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200"
          onClick={handleCall}
        >
          <Phone className="w-5 h-5" />
          Appeler
        </Button>
      </div>
    </div>
  );
}
