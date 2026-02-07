'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/lib/hooks/useSocket';
import { ChatSummary, Message, UserRole } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { 
  MessageCircle, 
  Loader2, 
  Search,
  Users,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderChat } from './OrderChat';

interface AdminChatStats {
  totalMessages: number;
  todayMessages: number;
  activeChats: number;
}

export function AdminChatMonitor() {
  const { toast } = useToast();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [stats, setStats] = useState<AdminChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatSummary | null>(null);
  const [recentMessages, setRecentMessages] = useState<Record<string, Message[]>>({});

  const { joinAdmin, onNewMessage } = useSocket();

  // Fetch chats and stats
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const [chatsRes, statsRes] = await Promise.all([
        apiClient.get('/chat/admin/all'),
        apiClient.get('/chat/admin/stats')
      ]);

      setChats(chatsRes.data.data.chats);
      setStats(statsRes.data.data.stats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch chat data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchData();
    joinAdmin();
  }, [fetchData, joinAdmin]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((data) => {
      // Update the chat's last message
      setChats(prev => prev.map(chat => {
        if (chat.contractId === data.contractId) {
          return {
            ...chat,
            lastMessage: data.message,
            totalMessages: chat.totalMessages + 1
          };
        }
        return chat;
      }));
    });

    return () => unsubscribe?.();
  }, [onNewMessage]);

  // Filter chats by search query
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.seller.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-600';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-600';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-amber-500/10 text-amber-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading chat monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 via-card to-muted/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-3xl font-bold">{stats.totalMessages.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/10 via-card to-muted/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.todayMessages.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 via-card to-muted/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Active Chats</p>
              <p className="text-3xl font-bold text-blue-600">{stats.activeChats.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md h-[700px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Order Chats
                  <Badge variant="secondary" className="ml-1">
                    {chats.length}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fetchData(false)}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, buyers, sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="divide-y">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.contractId}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                      selectedChat?.contractId === chat.contractId && "bg-muted"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{chat.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge className={cn("text-[10px] h-4", getStatusColor(chat.status))}>
                            {chat.status}
                          </Badge>
                        </div>
                      </div>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {format(new Date(chat.lastMessage.createdAt), 'MMM d')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="truncate">
                        {chat.buyer.name} ↔ {chat.seller.name}
                      </span>
                    </div>

                    {chat.lastMessage ? (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        <span className="font-medium">
                          {chat.lastMessage.sender.name}:
                        </span>{' '}
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        No messages yet
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-[10px] h-4">
                        {chat.totalMessages} messages
                      </Badge>
                      {chat.lastMessage && chat.lastMessage.sender.role === UserRole.ADMIN && (
                        <Badge className="text-[10px] h-4 bg-purple-500/10 text-purple-600">
                          You replied
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}

                {filteredChats.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chats found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat View */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="space-y-4">
              {/* Chat Header */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">{selectedChat.title}</h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>Buyer: {selectedChat.buyer.name}</span>
                        <span>•</span>
                        <span>Seller: {selectedChat.seller.name}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/admin/orders/${selectedChat.contractId}`, '_blank')}
                    >
                      View Order <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Component */}
              <OrderChat
                contractId={selectedChat.contractId}
                buyerName={selectedChat.buyer.name}
                sellerName={selectedChat.seller.name}
              />
            </div>
          ) : (
            <Card className="border-0 shadow-md h-[700px] flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a chat to view</p>
                <p className="text-sm">Choose an order from the list to monitor or participate in the conversation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
