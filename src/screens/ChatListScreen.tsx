import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { MessageSquare, Search, ChevronRight, Clock, User } from 'lucide-react';
import { db, auth } from '../firebase';
import { Chat, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatWithPartner extends Chat {
  partner: UserProfile | null;
}

export default function ChatListScreen() {
  const [chats, setChats] = useState<ChatWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatData = await Promise.all(snapshot.docs.map(async (chatDoc) => {
        const data = chatDoc.data() as Chat;
        const partnerId = data.participants.find(id => id !== user.uid);
        let partner = null;
        if (partnerId) {
          const partnerDoc = await getDoc(doc(db, 'users', partnerId));
          if (partnerDoc.exists()) {
            partner = partnerDoc.data() as UserProfile;
          }
        }
        return { id: chatDoc.id, ...data, partner };
      }));
      setChats(chatData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="p-4 pb-24">
      <div className="flex flex-col gap-2 mb-6 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm">Discutez avec vos artisans ou clients</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une discussion..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Chat List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <Link
              key={chat.id}
              to={`/chats/${chat.id}`}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
            >
              <div className="relative">
                <img
                  src={chat.partner?.photoURL || `https://picsum.photos/seed/${chat.partner?.uid}/200`}
                  alt={chat.partner?.displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{chat.partner?.displayName || 'Utilisateur'}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {chat.updatedAt?.toDate ? format(chat.updatedAt.toDate(), 'HH:mm') : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'Aucun message'}</p>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            Aucune discussion pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
