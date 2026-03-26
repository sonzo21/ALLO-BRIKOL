import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Search, MapPin, Star, Filter, ChevronRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ArtisanProfile } from '../types';
import { CATEGORIES, CITIES } from '../constants';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function HomeScreen() {
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtisans = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'artisans'), where('isActive', '==', true), limit(10));
        
        if (selectedCategory) {
          q = query(q, where('categories', 'array-contains', selectedCategory));
        }
        if (selectedCity) {
          q = query(q, where('city', '==', selectedCity));
        }

        const querySnapshot = await getDocs(q);
        const fetchedArtisans = querySnapshot.docs.map(doc => doc.data() as ArtisanProfile);
        setArtisans(fetchedArtisans);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'artisans');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, [selectedCategory, selectedCity]);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-2 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Trouvez un artisan</h1>
        <p className="text-gray-500">Le meilleur service à votre porte</p>
      </div>

      {/* Search Bar */}
      <Link to="/search" className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <div className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 shadow-sm">
          Rechercher un service...
        </div>
      </Link>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Catégories</h2>
          <button className="text-blue-600 text-sm font-medium">Voir tout</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl transition-all",
                selectedCategory === cat.id ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-100"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                selectedCategory === cat.id ? "bg-blue-500" : "bg-blue-50"
              )}>
                {/* Dynamic Icon Rendering would go here, using a mapping or lucide component */}
                <span className="text-2xl">🛠️</span>
              </div>
              <span className="text-xs font-medium text-center">{cat.nameFr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedCity === null ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedCity(null)}
          className="rounded-full whitespace-nowrap"
        >
          Toutes les villes
        </Button>
        {CITIES.map((city) => (
          <Button
            key={city}
            variant={selectedCity === city ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCity(city)}
            className="rounded-full whitespace-nowrap"
          >
            {city}
          </Button>
        ))}
      </div>

      {/* Artisan List */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Artisans recommandés</h2>
        </div>
        
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : artisans.length > 0 ? (
          artisans.map((artisan) => (
            <Link
              key={artisan.uid}
              to={`/artisans/${artisan.uid}`}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-all"
            >
              <img
                src={artisan.photoURL || `https://picsum.photos/seed/${artisan.uid}/200`}
                alt={`${artisan.firstName} ${artisan.lastName}`}
                className="w-24 h-24 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{artisan.firstName} {artisan.lastName}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{artisan.city}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artisan.categories.slice(0, 2).map(cat => (
                      <span key={cat} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-medium">
                        {CATEGORIES.find(c => c.id === cat)?.nameFr || cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{artisan.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({artisan.reviewCount})</span>
                  </div>
                  <span className="text-blue-600 font-bold text-sm">
                    {artisan.hourlyRate ? `${artisan.hourlyRate} DH/h` : 'Sur devis'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucun artisan trouvé pour ces critères.
          </div>
        )}
      </div>
    </div>
  );
}
