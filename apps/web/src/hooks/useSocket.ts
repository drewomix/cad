import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_EVENT_NAMESPACE } from '@cad/shared';

export function useSocket(onReady: (socket: Socket) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io((import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3333') + SOCKET_EVENT_NAMESPACE, {
      withCredentials: true
    });
    socketRef.current = socket;
    onReady(socket);
    return () => {
      socket.disconnect();
    };
  }, [onReady]);

  return socketRef;
}
