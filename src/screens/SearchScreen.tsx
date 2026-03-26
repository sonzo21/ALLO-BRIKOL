import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Search, MapPin, Star, ChevronLeft, Filter, X } from 'lucide-react';
import { db } from '../firebase';
import { ArtisanProfile } from '../types';
import { CATEGORIES, CITIES } from '../constants';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let q = query(collection(db, 'artisans'), where('isActive', '==', true), limit(20));
      
      if (selectedCategory) {
        q = query(q, where('categories', 'array-contains', selectedCategory));
      }
      if (selectedCity) {
        q = query(q, where('city', '==', selectedCity));
      }

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => doc.data() as ArtisanProfile);
      
      // Client-side text search (Firestore doesn't support full-text search natively)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        results = results.filter(a => 
          (a.firstName?.toLowerCase().includes(term)) || 
          (a.lastName?.toLowerCase().includes(term)) || 
          (a.description?.toLowerCase().includes(term))
        );
      }
      
      setArtisans(results);
    } catch (error) {
      console.error('Error searching artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedCategory, selectedCity]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un artisan..."
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 flex flex-col gap-4 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full whitespace-nowrap"
          >
            Toutes les catégories
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full whitespace-nowrap"
            >
              {cat.nameFr}
            </Button>
          ))}
        </div>
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
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
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
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{artisan.rating.toFixed(1)}</span>
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
            Aucun artisan trouvé pour votre recherche.
          </div>
        )}
      </div>
    </div>
  );
}
