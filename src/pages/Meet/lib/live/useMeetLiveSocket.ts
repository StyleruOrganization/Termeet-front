import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MeetQueries, type MeetResponse } from "@/entities/Meet";
import { getAccessToken } from "@/shared/api";

type LiveMessage = {
  type?: string;
  meet?: MeetResponse;
};

const liveUrl = (hash: string) => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const token = getAccessToken();
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${protocol}//${window.location.host}/api/meet/${hash}/ws${query}`;
};

export const useMeetLiveSocket = (hash: string, userId: string) => {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!hash) {
      return;
    }

    let stopped = false;
    let socket: WebSocket | null = null;
    let retry = 0;
    let pingTimer = 0;
    let reconnectTimer = 0;

    const clearTimers = () => {
      window.clearInterval(pingTimer);
      window.clearTimeout(reconnectTimer);
    };

    const connect = () => {
      if (stopped) {
        return;
      }

      socket = new WebSocket(liveUrl(hash));

      socket.onopen = () => {
        retry = 0;
        setConnected(true);
        pingTimer = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send("ping");
          }
        }, 25000);
      };

      socket.onmessage = event => {
        try {
          const payload = JSON.parse(event.data) as LiveMessage;
          if (payload.type !== "meet" || !payload.meet) {
            return;
          }
          queryClient.setQueryData([...MeetQueries.meet(hash).queryKey, userId], payload.meet);
        } catch {
          return;
        }
      };

      socket.onclose = () => {
        clearTimers();
        setConnected(false);
        if (stopped) {
          return;
        }
        const delay = Math.min(15000, 1000 * 2 ** retry);
        retry += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimers();
      socket?.close();
      setConnected(false);
    };
  }, [hash, queryClient, userId]);

  return connected;
};
