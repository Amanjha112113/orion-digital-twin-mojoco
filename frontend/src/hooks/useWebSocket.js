import { useEffect, useState, useRef } from 'react';

export function useWebSocket(url) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let ws = null;
    let timeoutId = null;

    const connect = () => {
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) setConnected(true);
      };

      ws.onmessage = (event) => {
        if (isMounted) {
          try {
            const payload = JSON.parse(event.data);
            setData(payload);
          } catch (err) {
            // Ignore parse errors
          }
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          setConnected(false);
          // Auto-reconnect after 2 seconds
          timeoutId = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        if (isMounted) setConnected(false);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, [url]);

  return { data, isConnected: connected };
}

export default useWebSocket;
