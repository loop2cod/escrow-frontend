'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { Message, UserRole } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { Send, Loader2, CheckCheck, Check, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface OrderChatProps {
  contractId: string;
  buyerName: string;
  sellerName: string;
  className?: string;
}

export function OrderChat({ contractId, buyerName, sellerName, className }: OrderChatProps) {
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Local state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingMessagesRef = useRef<Map<string, Message>>(new Map());
  const initializedRef = useRef(false);

  // Clear messages on mount/unmount
  useEffect(() => {
    setMessages([]);
    pendingMessagesRef.current.clear();
    return () => {
      setMessages([]);
      pendingMessagesRef.current.clear();
    };
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/chat/${contractId}/messages`);
      setMessages(response.data.data.messages);
      pendingMessagesRef.current.clear();
      await apiClient.patch(`/chat/${contractId}/read`);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  // Initialize socket
  useEffect(() => {
    if (!user) return;

    // Prevent double initialization (React StrictMode)
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = Cookies.get('accessToken');
    if (!token) return;

    if (socketRef.current) return;

    const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket = io(apiUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-contract', contractId);
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('new-message', (data) => {
      if (data.contractId !== contractId) return;
      
      const newMessage = data.message;
      const tempId = pendingMessagesRef.current.get(newMessage.content)?.id;
      
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        const filtered = tempId ? prev.filter(m => m.id !== tempId) : prev;
        return [...filtered, newMessage];
      });

      if (tempId) pendingMessagesRef.current.delete(newMessage.content);

      if (newMessage.senderId !== user.id) {
        socket.emit('message-received', { messageId: newMessage.id, contractId });
        socket.emit('message-read', { messageId: newMessage.id, contractId });
        apiClient.patch(`/chat/${contractId}/read`).catch(() => {});
      }
    });

    socket.on('user-typing', (data) => {
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
    });

    socket.on('user-online', (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (data.isOnline) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

    socket.on('message-delivered', (data) => {
      setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'DELIVERED' } : m));
    });

    socket.on('message-read', (data) => {
      setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'READ' } : m));
    });

    return () => {
      socket.emit('leave-contract', contractId);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      initializedRef.current = false;
      setMessages([]);
      pendingMessagesRef.current.clear();
    };
  }, [contractId, user?.id]);

  // Fetch on mount
  useEffect(() => {
    if (isConnected) {
      fetchMessages().then(() => {
        // Scroll to bottom after messages load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        }, 100);
      });
      inputRef.current?.focus();
    }
  }, [isConnected, fetchMessages]);

  // Scroll to bottom (show last message) when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !isConnected || !socketRef.current) return;
    if (isSending) return;

    setIsSending(true);
    const content = inputMessage.trim();
    setInputMessage('');

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      contractId,
      senderId: user!.id,
      content,
      type: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: { id: user!.id, name: user!.name || 'You', email: user!.email || '', role: user!.role as UserRole },
    };

    pendingMessagesRef.current.set(content, tempMessage);
    setMessages(prev => [...prev, tempMessage]);

    try {
      socketRef.current.emit('send-message', { contractId, content, type: 'TEXT' });
      await apiClient.post(`/chat/${contractId}/messages`, { content, type: 'TEXT' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      pendingMessagesRef.current.delete(content);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isConnected, contractId, user, isSending, toast]);

  const handleTyping = useCallback(() => {
    if (!isConnected || !socketRef.current) return;
    socketRef.current.emit('typing', { contractId, isTyping: true });
    setTimeout(() => socketRef.current?.emit('typing', { contractId, isTyping: false }), 2000);
  }, [isConnected, contractId]);

  const getMessageStatus = (status: string) => {
    if (status === 'READ') return <CheckCheck className="h-3 w-3 text-blue-500" />;
    if (status === 'DELIVERED') return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentGroup: { date: string; messages: Message[] } | null = null;
    msgs.forEach((message) => {
      const messageDate = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={cn("flex flex-col bg-background rounded-lg border h-[600px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">{buyerName.charAt(0)}</span>
            </div>
            {onlineUsers.size > 0 && <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{buyerName} and {sellerName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isConnected ? (
                <><Wifi className="h-3 w-3 text-green-500" /><span>{onlineUsers.size} online</span></>
              ) : (
                <><WifiOff className="h-3 w-3 text-amber-500" /><span className="text-amber-600">Connecting...</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3 text-2xl">💬</div>
            <p className="text-sm font-medium">No messages yet</p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{format(new Date(group.date), 'MMMM d, yyyy')}</span>
              </div>
              {group.messages.map((message, index) => {
                const isOwnMessage = message.senderId === user?.id;
                const isAdmin = message.sender.role === UserRole.ADMIN;
                const showSender = !isOwnMessage && (index === 0 || group.messages[index - 1].senderId !== message.senderId);
                return (
                  <div key={message.id} className={cn("flex flex-col", isOwnMessage ? "items-end" : "items-start")}>
                    {showSender && <span className="text-[10px] text-muted-foreground mb-1 ml-1">{message.sender.name}{isAdmin && <Badge variant="secondary" className="ml-1 text-[8px] h-3 px-1">Admin</Badge>}</span>}
                    <div className={cn("max-w-[85%] px-3.5 py-2 rounded-2xl text-sm shadow-sm", isOwnMessage ? "bg-primary text-primary-foreground rounded-br-md" : isAdmin ? "bg-purple-100 text-purple-900 rounded-bl-md" : "bg-muted rounded-bl-md")}>
                      <p className="break-words">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={cn("text-[10px]", isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground")}>{format(new Date(message.createdAt), 'h:mm a')}</span>
                        {isOwnMessage && getMessageStatus(message.status)}
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
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 w-fit px-3 py-1.5 rounded-full">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className="italic">{typingUsers.size} typing...</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex items-center gap-2">
          <Input ref={inputRef} placeholder={isConnected ? "Type a message..." : "Reconnecting..."} value={inputMessage} onChange={(e) => { setInputMessage(e.target.value); handleTyping(); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); }}} className="flex-1 h-10 bg-background" disabled={isSending || !isConnected} />
          <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isSending || !isConnected} size="icon" className="h-10 w-10 shrink-0 rounded-full">{isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
        </div>
      </div>
    </div>
  );
}
