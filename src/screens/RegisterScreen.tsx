import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Hammer, Mail, Lock, User, Briefcase, ChevronRight } from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Veuillez choisir un type de compte.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await signIn(user, role);
      navigate('/');
    } catch (err: any) {
      setError("Erreur lors de l'inscription. L'email est peut-être déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Hammer className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Allo-Brikol</h1>
          <p className="text-gray-500 mt-2">Créez votre compte gratuitement</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
              role === 'client' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-200"
            )}
          >
            <User className="w-8 h-8" />
            <span className="font-semibold">Client</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('artisan')}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
              role === 'artisan' ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-orange-200"
            )}
          >
            <Briefcase className="w-8 h-8" />
            <span className="font-semibold">Artisan</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full py-3 text-lg" isLoading={loading}>
            S'inscrire
          </Button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
