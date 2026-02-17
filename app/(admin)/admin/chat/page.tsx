'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { Message, UserRole } from '@/lib/types';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Send,
  Loader2,
  RefreshCw,
  Search,
  User,
  ShoppingCart,
  ArrowLeft,
  CheckCheck,
  Check,
  Wifi,
  WifiOff,
  ExternalLink,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Chat {
  contractId: string;
  title: string;
  status: string;
  buyer: { id: string; name: string; email: string; userReferenceId?: string };
  seller: { id: string; name: string; email: string; userReferenceId?: string };
  totalMessages: number;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string; role: string };
  } | null;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
  PENDING_REVIEW: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-100" },
  PENDING_ACCEPTANCE: { label: "Pending Acceptance", color: "text-blue-600", bg: "bg-blue-100" },
  AGREED: { label: "Agreed", color: "text-emerald-600", bg: "bg-emerald-100" },
  PAYMENT_SUBMITTED: { label: "Payment Submitted", color: "text-orange-600", bg: "bg-orange-100" },
  IN_PROGRESS: { label: "In Progress", color: "text-indigo-600", bg: "bg-indigo-100" },
  DELIVERED: { label: "Delivered", color: "text-purple-600", bg: "bg-purple-100" },
  DELIVERY_REVIEWED: { label: "Delivery Reviewed", color: "text-cyan-600", bg: "bg-cyan-100" },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-100" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100" },
  DISPUTED: { label: "Disputed", color: "text-red-600", bg: "bg-red-100" },
};

// Module-level singleton socket
let globalSocket: Socket | null = null;
let globalSocketUsers = 0;

export default function AdminChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingRef = useRef<Map<string, { tempId: string; content: string }>>(new Map());

  // Fetch chats list
  const fetchChats = useCallback(async () => {
    try {
      const res = await apiClient.get('/chat/admin/all');
      setChats(res.data.data.chats);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  }, []);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async (contractId: string) => {
    try {
      const res = await apiClient.get(`/chat/admin/${contractId}/messages`);
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchChats();
      setIsLoading(false);
    };
    load();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchChats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchChats]);

  // Socket setup for admin monitoring
  useEffect(() => {
    if (!user) return;
    const token = Cookies.get('accessToken');
    if (!token) return;

    // Create socket if needed
    if (!globalSocket) {
      const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://escrow-backend-production-8b93.up.railway.app';
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

    // Join admin room
    socket.emit('join-admin');

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNewMessage = (data: { contractId: string; message: Message }) => {
      // Update messages if this chat is selected
      if (selectedChat?.contractId === data.contractId) {
        const msg = data.message;
        const pending = pendingRef.current.get(msg.content);

        setMessages(prev => {
          if (pending && msg.senderId === user?.id) {
            return prev.map(m => m.id === pending.tempId ? msg : m);
          }
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        if (pending && msg.senderId === user?.id) {
          pendingRef.current.delete(msg.content);
        }

        // Mark as read
        socket.emit('message-read', { messageId: msg.id, contractId: data.contractId });
      }

      // Update chat list
      setChats(prev => {
        const chatIndex = prev.findIndex(c => c.contractId === data.contractId);
        if (chatIndex === -1) return prev;

        const newChats = [...prev];
        newChats[chatIndex] = {
          ...newChats[chatIndex],
          lastMessage: {
            id: data.message.id,
            content: data.message.content,
            createdAt: data.message.createdAt,
            sender: data.message.sender,
          },
          totalMessages: newChats[chatIndex].totalMessages + 1,
          updatedAt: new Date().toISOString(),
        };

        // Move to top
        const [chat] = newChats.splice(chatIndex, 1);
        return [chat, ...newChats];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-message-admin', onNewMessage);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      globalSocketUsers--;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-message-admin', onNewMessage);
      socket.emit('leave-admin');

      if (globalSocketUsers <= 0) {
        socket.disconnect();
        globalSocket = null;
      }
    };
  }, [user, selectedChat]);

  // Join selected contract room
  useEffect(() => {
    if (!selectedChat || !socketRef.current) return;

    const socket = socketRef.current;
    const contractId = selectedChat.contractId;

    socket.emit('join-contract', contractId);
    fetchMessages(contractId);

    const onNewMessage = (data: { contractId: string; message: Message }) => {
      if (data.contractId !== contractId) return;

      const msg = data.message;
      const pending = pendingRef.current.get(msg.content);

      setMessages(prev => {
        if (pending && msg.senderId === user?.id) {
          return prev.map(m => m.id === pending.tempId ? msg : m);
        }
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      if (pending && msg.senderId === user?.id) {
        pendingRef.current.delete(msg.content);
      }

      socket.emit('message-read', { messageId: msg.id, contractId });
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

    socket.on('new-message', onNewMessage);
    socket.on('user-typing', onTyping);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('user-typing', onTyping);
      socket.emit('leave-contract', contractId);
    };
  }, [selectedChat, user?.id, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!inputMessage.trim() || !socketRef.current || !selectedChat || isSending) return;

    setIsSending(true);
    const content = inputMessage.trim();
    setInputMessage('');

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      contractId: selectedChat.contractId,
      senderId: user!.id,
      content,
      type: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: { id: user!.id, name: user!.name || 'Admin', email: user!.email || '', role: UserRole.ADMIN },
    };

    pendingRef.current.set(content, { tempId, content });
    setMessages(prev => [...prev, tempMsg]);

    try {
      socketRef.current.emit('send-message', { contractId: selectedChat.contractId, content, type: 'TEXT' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send', variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== tempId));
      pendingRef.current.delete(content);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, selectedChat, user, isSending, toast]);

  const handleTyping = useCallback(() => {
    if (selectedChat) {
      socketRef.current?.emit('typing', { contractId: selectedChat.contractId, isTyping: true });
      setTimeout(() => socketRef.current?.emit('typing', { contractId: selectedChat.contractId, isTyping: false }), 2000);
    }
  }, [selectedChat]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedChat(null);
  };

  const getStatus = (status: string) => {
    if (status === 'READ') return <CheckCheck className="h-3 w-3 text-blue-500" />;
    if (status === 'DELIVERED') return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading chat management...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] flex flex-col space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 sm:h-9 sm:w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Chat Management</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Monitor and manage all order conversations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs hidden sm:inline-flex">
              <Wifi className="h-3 w-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs hidden sm:inline-flex">
              <WifiOff className="h-3 w-3 mr-1" /> Offline
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchChats()} disabled={isRefreshing} className="h-8 sm:h-9">
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex  min-h-0 overflow-hidden">
        {/* Chat List Sidebar */}
        <Card className={cn(
          "flex flex-col border-none transition-all duration-300 p-0 rounded-none",
          showMobileChat ? "hidden lg:flex lg:w-80" : "flex w-full lg:w-80"
        )}>
          <CardHeader className="pb-3 px-3 sm:px-4 pt-3 sm:pt-4 shrink-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Conversations</span>
              <span className="sm:hidden">Chats ({chats.length})</span>
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No chats found
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const statusConfig = STATUS_CONFIG[chat.status];
                  const isSelected = selectedChat?.contractId === chat.contractId;
                  const isLastMessageFromAdmin = chat.lastMessage?.sender.role === 'ADMIN';

                  return (
                    <button
                      key={chat.contractId}
                      onClick={() => handleSelectChat(chat)}
                      className={cn(
                        "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                        isSelected && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("text-sm font-medium truncate", isSelected && "text-primary")}>
                            {chat.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {chat.buyer.name} ↔ {chat.seller.name}
                          </p>
                          {chat.lastMessage && (
                            <p className={cn(
                              "text-xs mt-1 truncate",
                              isLastMessageFromAdmin ? "text-purple-600" : "text-muted-foreground"
                            )}>
                              {isLastMessageFromAdmin && "You: "}{chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {chat.lastMessage && (
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(chat.lastMessage.createdAt), 'h:mm a')}
                            </p>
                          )}
                          <Badge className={cn("text-[9px] mt-1", statusConfig?.bg, statusConfig?.color)}>
                            {statusConfig?.label || chat.status}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className={cn(
          "flex-1 flex flex-col border-none rounded-none transition-all duration-300 overflow-hidden p-0",
          showMobileChat ? "flex" : "hidden lg:flex"
        )}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b px-3 sm:px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8 -ml-1"
                    onClick={handleBackToList}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base font-semibold truncate">{selectedChat.title}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-0.5 truncate">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[60px] sm:max-w-none">{selectedChat.buyer.name}</span>
                      </span>
                      <span className="hidden sm:inline">↔</span>
                      <span className="flex items-center gap-0.5 truncate">
                        <ShoppingCart className="h-3 w-3" />
                        <span className="truncate max-w-[60px] sm:max-w-none">{selectedChat.seller.name}</span>
                      </span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <Badge className={cn(
                      "text-[10px] sm:text-xs",
                      STATUS_CONFIG[selectedChat.status]?.bg,
                      STATUS_CONFIG[selectedChat.status]?.color
                    )}>
                      {STATUS_CONFIG[selectedChat.status]?.label || selectedChat.status}
                    </Badge>
                    <Link href={`/admin/orders/${selectedChat.contractId}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
                        <ExternalLink className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Order</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((msg, idx) => {
                      const isOwn = msg.senderId === user?.id;
                      const isAdmin = msg.sender.role === 'ADMIN';
                      const showDate = idx === 0 ||
                        new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-3 sm:my-4">
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                          <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                            <span className="text-[10px] text-muted-foreground mb-0.5">
                              {msg.sender.name}
                              {isAdmin && (
                                <Badge variant="secondary" className="ml-1 text-[8px] h-3.5 px-1">
                                  Admin
                                </Badge>
                              )}
                            </span>
                            <div className={cn(
                              "max-w-[85%] sm:max-w-[75%] px-2 py-1.5 rounded-xl text-sm",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : isAdmin
                                  ? "bg-purple-100 text-purple-900 rounded-bl-sm"
                                  : "bg-muted rounded-bl-sm"
                            )}>
                              <p className="break-words text-xs">{msg.content}</p>
                              <div className="flex items-center justify-end gap-1">
                                <span className={cn("text-[7.5px]", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                  {format(new Date(msg.createdAt), 'h:mm a')}
                                </span>
                                {isOwn && getStatus(msg.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {typingUsers.size > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="italic">typing...</span>
                  </div>
                )}
              </CardContent>

              {/* Input */}
              <CardContent className="p-2 sm:p-3 border-t shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => { setInputMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    className="flex-1 h-9 sm:h-10"
                    disabled={!isConnected || isSending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || !isConnected || isSending}
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-amber-600 mt-2">Connecting to chat server...</p>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
              <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium text-center">Select a conversation</p>
              <p className="text-xs sm:text-sm text-center">Choose a chat from the sidebar to view messages</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
