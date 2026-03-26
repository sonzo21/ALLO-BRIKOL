import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, PlusCircle, Hammer, LayoutGrid } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { cn } from './lib/utils';

// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const ChatListScreen = lazy(() => import('./screens/ChatListScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'));
const ArtisanDetailScreen = lazy(() => import('./screens/ArtisanDetailScreen'));
const ArtisanDashboardScreen = lazy(() => import('./screens/ArtisanDashboardScreen'));
const RequestsScreen = lazy(() => import('./screens/RequestsScreen'));
const ChatRoomScreen = lazy(() => import('./screens/ChatRoomScreen'));

function BottomNav() {
  const { profile } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/requests', icon: LayoutGrid, label: 'Demandes' },
    { path: '/chats', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  if (profile?.role === 'artisan') {
    navItems.splice(1, 0, { path: '/dashboard', icon: Hammer, label: 'Dashboard' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-400"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Chargement...</div>}>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/" element={<HomeScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/requests" element={<RequestsScreen />} />
          <Route path="/artisans/:id" element={<ArtisanDetailScreen />} />
          
          {/* Private Routes */}
          <Route path="/chats" element={<PrivateRoute><ChatListScreen /></PrivateRoute>} />
          <Route path="/chats/:id" element={<PrivateRoute><ChatRoomScreen /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfileScreen /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><ArtisanDashboardScreen /></PrivateRoute>} />
        </Routes>
      </Suspense>
      {user && !hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
