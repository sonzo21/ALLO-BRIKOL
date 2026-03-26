import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Send, ChevronLeft, Phone, MoreVertical, Paperclip, Smile, Hammer } from 'lucide-react';
import { db, auth } from '../firebase';
import { Message, UserProfile, Chat } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ChatRoomScreen() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    // Fetch partner info
    const fetchPartner = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', id));
      if (chatDoc.exists()) {
        const data = chatDoc.data() as Chat;
        const partnerId = data.participants.find(pid => pid !== user.uid);
        if (partnerId) {
          const partnerDoc = await getDoc(doc(db, 'users', partnerId));
          if (partnerDoc.exists()) {
            setPartner(partnerDoc.data() as UserProfile);
          }
        }
      }
    };
    fetchPartner();

    // Listen for messages
    const q = query(
      collection(db, 'chats', id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return unsubscribe;
  }, [id, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', id, 'messages'), {
        chatId: id,
        senderId: user.uid,
        text: messageText,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'chats', id), {
        lastMessage: messageText,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <img
            src={partner?.photoURL || `https://picsum.photos/seed/${partner?.uid}/200`}
            alt={partner?.displayName}
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">{partner?.displayName || 'Utilisateur'}</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">En ligne</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.uid;
          const showTime = index === 0 || 
            (msg.createdAt?.toDate && messages[index-1].createdAt?.toDate && 
             msg.createdAt.toDate().getTime() - messages[index-1].createdAt.toDate().getTime() > 300000);

          return (
            <div key={msg.id} className="flex flex-col gap-1">
              {showTime && msg.createdAt?.toDate && (
                <div className="text-center my-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase bg-gray-100 px-2 py-1 rounded-full">
                    {format(msg.createdAt.toDate(), 'HH:mm', { locale: fr })}
                  </span>
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                isMe ? "bg-blue-600 text-white self-end rounded-tr-none" : "bg-white text-gray-900 self-start rounded-tl-none border border-gray-100"
              )}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 pb-6">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button type="button" className="text-gray-400 p-2">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Écrivez votre message..."
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              newMessage.trim() ? "bg-blue-600 text-white shadow-blue-200" : "bg-gray-100 text-gray-400 shadow-none"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
