import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Hammer, Mail, Lock, Chrome } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await signIn(user);
      navigate('/');
    } catch (err: any) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await signIn(user);
      navigate('/');
    } catch (err: any) {
      setError('Erreur lors de la connexion avec Google.');
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
          <p className="text-gray-500 mt-2">Connectez-vous pour continuer</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            Se connecter
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 uppercase tracking-wider">Ou</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full py-3 flex items-center gap-3"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <Chrome className="w-5 h-5 text-red-500" />
          Continuer avec Google
        </Button>

        <p className="mt-8 text-center text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
