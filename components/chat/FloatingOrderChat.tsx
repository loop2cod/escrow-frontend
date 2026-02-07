'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { Message, UserRole } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { 
  Send, 
  Loader2, 
  MessageCircle, 
  CheckCheck, 
  Check,
  X,
  Minimize2,
  Maximize2,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface FloatingOrderChatProps {
  contractId: string;
  buyerName: string;
  sellerName: string;
  buyerId: string;
  sellerId: string;
  orderStatus: string;
}

// Module-level singleton socket
let globalSocket: Socket | null = null;
let globalSocketUsers = 0;

const playMessageSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {}
};

export function FloatingOrderChat({ 
  contractId, 
  buyerName, 
  sellerName,
  buyerId,
  sellerId,
}: FloatingOrderChatProps) {
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingRef = useRef<Map<string, { tempId: string; content: string }>>(new Map());
  const isOpenRef = useRef(isOpen);
  
  isOpenRef.current = isOpen;

  // Get or create global socket
  const getSocket = useCallback(() => {
    if (globalSocket?.connected) {
      return globalSocket;
    }
    return null;
  }, []);

  // Initialize
  useEffect(() => {
    if (!user) return;
    const token = Cookies.get('accessToken');
    if (!token) return;

    // Create socket if needed
    if (!globalSocket) {
      const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      globalSocket = io(apiUrl, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    const socket = globalSocket;
    socketRef.current = socket;
    globalSocketUsers++;

    // Connect handler
    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join-contract', contractId);
    };

    const onDisconnect = () => setIsConnected(false);

    const onNewMessage = (data: { contractId: string; message: Message }) => {
      if (data.contractId !== contractId) return;
      
      const msg = data.message;
      const pending = pendingRef.current.get(msg.content);
      
      setMessages(prev => {
        // Case 1: This is our own message coming back from server
        if (pending && msg.senderId === user?.id) {
          // Replace temp with real
          return prev.map(m => m.id === pending.tempId ? msg : m);
        }
        
        // Case 2: Message from someone else
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Clean up pending
      if (pending && msg.senderId === user?.id) {
        pendingRef.current.delete(msg.content);
      }

      setLastMessage(msg);

      // Handle notifications for messages from others
      if (msg.senderId !== user?.id) {
        socket.emit('message-received', { messageId: msg.id, contractId });
        
        if (isOpenRef.current) {
          socket.emit('message-read', { messageId: msg.id, contractId });
          apiClient.patch(`/chat/${contractId}/read`).catch(() => {});
        } else {
          setUnreadCount(c => c + 1);
          setShowPreview(true);
          setTimeout(() => setShowPreview(false), 6000);
          if (soundEnabled) playMessageSound();
          
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: `${msg.sender.name}: ${msg.content}`,
              icon: '/favicon.ico',
            });
          }
        }
      }
    };

    const onTyping = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (data.isTyping) {
          next.add(data.userId);
          setTimeout(() => setTypingUsers(p => { const n = new Set(p); n.delete(data.userId); return n; }), 3000);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    const onOnline = (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (data.isOnline) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    };

    const onDelivered = (data: { messageId: string }) => {
      setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'DELIVERED' } : m));
    };

    const onRead = (data: { messageId: string }) => {
      setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'READ' } : m));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-message', onNewMessage);
    socket.on('user-typing', onTyping);
    socket.on('user-online', onOnline);
    socket.on('message-delivered', onDelivered);
    socket.on('message-read', onRead);

    if (socket.connected) {
      onConnect();
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch messages
    setIsLoading(true);
    apiClient.get(`/chat/${contractId}/messages`).then(res => {
      setMessages(res.data.data.messages);
      apiClient.patch(`/chat/${contractId}/read`).catch(() => {});
    }).finally(() => setIsLoading(false));

    return () => {
      globalSocketUsers--;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-message', onNewMessage);
      socket.off('user-typing', onTyping);
      socket.off('user-online', onOnline);
      socket.off('message-delivered', onDelivered);
      socket.off('message-read', onRead);
      socket.emit('leave-contract', contractId);
      
      if (globalSocketUsers <= 0) {
        socket.disconnect();
        globalSocket = null;
      }
      setMessages([]);
    };
  }, [contractId, user?.id]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized && messages.length > 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, isOpen, isMinimized]);

  // Update title
  useEffect(() => {
    const original = document.title;
    document.title = unreadCount > 0 && !isOpen ? `(${unreadCount}) New Message - ${original}` : original;
    return () => { document.title = original; };
  }, [unreadCount, isOpen]);

  // Send message - ONLY use socket, let server broadcast back
  const handleSend = useCallback(async () => {
    if (!inputMessage.trim() || !socketRef.current || isSending) return;
    
    setIsSending(true);
    const content = inputMessage.trim();
    setInputMessage('');

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      contractId,
      senderId: user!.id,
      content,
      type: 'TEXT',
      status: 'SENT', // Will be replaced when server confirms
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: { id: user!.id, name: user!.name || 'You', email: user!.email || '', role: user!.role as UserRole },
    };

    pendingRef.current.set(content, { tempId, content });
    setMessages(prev => [...prev, tempMsg]);

    try {
      // Only emit via socket - server will create message and broadcast back
      socketRef.current.emit('send-message', { contractId, content, type: 'TEXT' });
      
      // The server will broadcast the message back via 'new-message' event
      // which will replace the temp message
    } catch {
      toast({ title: 'Error', description: 'Failed to send', variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== tempId));
      pendingRef.current.delete(content);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, contractId, user, isSending, toast]);

  const handleTyping = useCallback(() => {
    socketRef.current?.emit('typing', { contractId, isTyping: true });
    setTimeout(() => socketRef.current?.emit('typing', { contractId, isTyping: false }), 2000);
  }, [contractId]);

  const getStatus = (status: string) => {
    if (status === 'READ') return <CheckCheck className="h-3 w-3 text-blue-500" />;
    if (status === 'DELIVERED') return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  const isOtherOnline = () => onlineUsers.has(user?.id === buyerId ? sellerId : buyerId);
  const otherName = user?.id === buyerId ? sellerName : user?.id === sellerId ? buyerName : `${buyerName} & ${sellerName}`;

  const groups = messages.reduce((acc: { date: string; messages: Message[] }[], msg) => {
    const date = format(new Date(msg.createdAt), 'yyyy-MM-dd');
    const last = acc[acc.length - 1];
    if (last?.date === date) last.messages.push(msg);
    else acc.push({ date, messages: [msg] });
    return acc;
  }, []);

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3">
          {showPreview && lastMessage && (
            <div onClick={() => setIsOpen(true)} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-3 sm:p-4 max-w-[260px] sm:max-w-[320px] border cursor-pointer">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="relative">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-base">{lastMessage.sender.name?.[0]}</span>
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate">{lastMessage.sender.name}</p>
                  <p className="text-[10px] sm:text-xs text-green-600">New message</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}>
                  <X className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="bg-muted/50 rounded-xl p-2 sm:p-3">
                <p className="text-xs sm:text-sm line-clamp-2">{lastMessage.content}</p>
              </div>
            </div>
          )}
          
          {!isConnected && (
            <div className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
              <WifiOff className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">Reconnecting...</span>
            </div>
          )}
          
          <Button onClick={() => setIsOpen(true)} className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl hover:scale-110 relative", isConnected ? "bg-primary" : "bg-amber-500", unreadCount > 0 && "animate-pulse")}>
            {isConnected ? <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7" /> : <WifiOff className="h-4 w-4 sm:h-6 sm:w-6" />}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
            {isConnected && isOtherOnline() && !unreadCount && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-background rounded-full" />}
          </Button>
        </div>
      )}

      {isOpen && (
        <div className={cn("fixed z-50 flex flex-col bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border overflow-hidden", "inset-x-0 bottom-0 h-[85vh] sm:inset-auto sm:bottom-6 sm:right-6", isMinimized ? "sm:w-[320px] sm:h-[64px]" : "sm:w-[400px] sm:h-[600px]")}>
          <div className={cn("flex items-center justify-between px-3 py-2.5 border-b bg-gradient-to-r from-primary/10 to-muted/20", isMinimized && "cursor-pointer")} onClick={isMinimized ? () => setIsMinimized(false) : undefined}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                {isOtherOnline() && <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 border-2 border-background rounded-full animate-pulse" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-xs truncate">{otherName}</h3>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {isConnected ? (
                    <><Wifi className="h-2.5 w-2.5 text-green-500" />{isOtherOnline() ? <span className="text-green-600">Online</span> : <span>Offline</span>}{typingUsers.size > 0 && <span className="text-primary italic ml-1">typing...</span>}</>
                  ) : (
                    <><WifiOff className="h-2.5 w-2.5 text-amber-500" /><span className="text-amber-600">Connecting...</span></>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}>{soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>{isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}><X className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {!isConnected && (
                <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5">
                  <span className="text-[10px] text-amber-700 flex items-center gap-1"><WifiOff className="h-2.5 w-2.5" />Connection lost</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2"><MessageCircle className="h-6 w-6 text-primary/50" /></div>
                    <p className="text-xs font-medium">Start a conversation</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group.date} className="space-y-2">
                      <div className="flex items-center justify-center"><span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{format(new Date(group.date), 'MMMM d, yyyy')}</span></div>
                      {group.messages.map((msg, idx) => {
                        const isOwn = msg.senderId === user?.id;
                        const isAdmin = msg.sender.role === UserRole.ADMIN;
                        const showName = !isOwn && (idx === 0 || group.messages[idx - 1].senderId !== msg.senderId);
                        return (
                          <div key={msg.id} className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                            {showName && <span className="text-[9px] text-muted-foreground mb-0.5 ml-1">{msg.sender.name}{isAdmin && <Badge variant="secondary" className="ml-1 text-[7px] h-2.5 px-0.5">Admin</Badge>}</span>}
                            <div className={cn("max-w-[85%] px-3 py-1.5 rounded-2xl text-xs shadow-sm", isOwn ? "bg-primary text-primary-foreground rounded-br-md" : isAdmin ? "bg-purple-100 text-purple-900 rounded-bl-md" : "bg-muted rounded-bl-md")}>
                              <p className="break-words">{msg.content}</p>
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <span className={cn("text-[9px]", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                                {isOwn && getStatus(msg.status)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {typingUsers.size > 0 && (
                <div className="px-3 py-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 w-fit px-2.5 py-1 rounded-full">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="italic">typing...</span>
                  </div>
                </div>
              )}

              <div className="p-2.5 border-t bg-muted/20">
                <div className="flex items-center gap-2">
                  <Input ref={inputRef} placeholder={isConnected ? "Type a message..." : "Reconnecting..."} value={inputMessage} onChange={(e) => { setInputMessage(e.target.value); handleTyping(); }} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} className="flex-1 h-9 bg-background text-sm" disabled={isSending || !isConnected} />
                  <Button onClick={handleSend} disabled={!inputMessage.trim() || isSending || !isConnected} size="icon" className="h-9 w-9 shrink-0 rounded-full">{isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
