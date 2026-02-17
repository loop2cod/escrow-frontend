'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/auth-store';
import Cookies from 'js-cookie';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onReconnect?: (attempt: number) => void;
}

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  const { user } = useAuthStore();
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    isConnecting: true,
    connectionError: null,
    reconnectAttempts: 0,
  });

  // Keep options ref up to date without triggering re-renders
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, isConnecting: false }));
      return;
    }

    const token = Cookies.get('accessToken');
    if (!token) {
      setState(prev => ({ ...prev, isConnecting: false, connectionError: 'No token' }));
      return;
    }

    // Initialize socket with polling first for better compatibility
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://escrow-backend-production-8b93.up.railway.app').replace(/\/$/, '');
    const socket = io(apiUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setState({
        isConnected: true,
        isConnecting: false,
        connectionError: null,
        reconnectAttempts: 0,
      });
      optionsRef.current.onConnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionError: error.message,
      }));
      optionsRef.current.onError?.(error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: reason === 'io server disconnect' || reason === 'io client disconnect',
      }));
      optionsRef.current.onDisconnect?.(reason);
    });

    socket.on('reconnect', (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts');
      setState({
        isConnected: true,
        isConnecting: false,
        connectionError: null,
        reconnectAttempts: attempt,
      });
      optionsRef.current.onReconnect?.(attempt);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log('Socket reconnection attempt:', attempt);
      setState(prev => ({
        ...prev,
        isConnecting: true,
        reconnectAttempts: attempt,
      }));
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setState(prev => ({
        ...prev,
        connectionError: error.message,
      }));
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'Reconnection failed',
      }));
    });

    // Ping/pong for connection health check
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const joinContract = useCallback((contractId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-contract', contractId);
      console.log('Joined contract room:', contractId);
    } else {
      console.warn('Socket not connected, queueing join for:', contractId);
      const checkAndJoin = () => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('join-contract', contractId);
        } else {
          setTimeout(checkAndJoin, 500);
        }
      };
      setTimeout(checkAndJoin, 500);
    }
  }, []);

  const leaveContract = useCallback((contractId: string) => {
    socketRef.current?.emit('leave-contract', contractId);
  }, []);

  const sendMessage = useCallback((contractId: string, content: string, type: string = 'TEXT') => {
    if (!socketRef.current?.connected) {
      console.error('Socket not connected, cannot send message');
      throw new Error('Not connected to chat server');
    }
    socketRef.current.emit('send-message', { contractId, content, type });
  }, []);

  const setTyping = useCallback((contractId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { contractId, isTyping });
  }, []);

  const acknowledgeMessage = useCallback((messageId: string, contractId: string) => {
    socketRef.current?.emit('message-received', { messageId, contractId });
  }, []);

  const joinAdmin = useCallback(() => {
    socketRef.current?.emit('join-admin');
  }, []);

  // Event listener callbacks - use refs to maintain stability
  const listenersRef = useRef<{
    newMessage?: ((data: any) => void)[];
    userTyping?: ((data: any) => void)[];
    userOnline?: ((data: any) => void)[];
    messageDelivered?: ((data: any) => void)[];
  }>({});

  const onNewMessage = useCallback((callback: (data: { contractId: string; message: any }) => void) => {
    if (!listenersRef.current.newMessage) {
      listenersRef.current.newMessage = [];
    }
    listenersRef.current.newMessage.push(callback);
    socketRef.current?.on('new-message', callback);
    return () => {
      socketRef.current?.off('new-message', callback);
      listenersRef.current.newMessage = listenersRef.current.newMessage?.filter(cb => cb !== callback);
    };
  }, []);

  const onUserTyping = useCallback((callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (!listenersRef.current.userTyping) {
      listenersRef.current.userTyping = [];
    }
    listenersRef.current.userTyping.push(callback);
    socketRef.current?.on('user-typing', callback);
    return () => {
      socketRef.current?.off('user-typing', callback);
      listenersRef.current.userTyping = listenersRef.current.userTyping?.filter(cb => cb !== callback);
    };
  }, []);

  const onUserOnline = useCallback((callback: (data: { userId: string; isOnline: boolean }) => void) => {
    if (!listenersRef.current.userOnline) {
      listenersRef.current.userOnline = [];
    }
    listenersRef.current.userOnline.push(callback);
    socketRef.current?.on('user-online', callback);
    return () => {
      socketRef.current?.off('user-online', callback);
      listenersRef.current.userOnline = listenersRef.current.userOnline?.filter(cb => cb !== callback);
    };
  }, []);

  const onMessageDelivered = useCallback((callback: (data: { messageId: string }) => void) => {
    if (!listenersRef.current.messageDelivered) {
      listenersRef.current.messageDelivered = [];
    }
    listenersRef.current.messageDelivered.push(callback);
    socketRef.current?.on('message-delivered', callback);
    return () => {
      socketRef.current?.off('message-delivered', callback);
      listenersRef.current.messageDelivered = listenersRef.current.messageDelivered?.filter(cb => cb !== callback);
    };
  }, []);

  const reconnect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  return {
    socket: socketRef.current,
    ...state,
    joinContract,
    leaveContract,
    sendMessage,
    setTyping,
    acknowledgeMessage,
    joinAdmin,
    onNewMessage,
    onUserTyping,
    onUserOnline,
    onMessageDelivered,
    reconnect,
  };
}
