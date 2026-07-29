import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, History, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const IncidentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am the ORION AI. Ask me about the factory status or past incidents.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch history periodically
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/history');
        const data = await res.json();
        if (data.history) setHistory(data.history);
      } catch (e) {
        console.error("Failed to fetch history", e);
      }
    };
    
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to AI backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-4rem)]">
      
      {/* Incident History Panel (Left Side on large screens) */}
      <div className="flex-1 bg-[#0f111a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-gradient-to-r from-red-950/20 to-transparent">
          <History className="w-6 h-6 text-red-400" />
          <h2 className="font-semibold text-lg text-slate-200">Incident History</h2>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {history.length === 0 ? (
            <div className="text-slate-500 text-base text-center py-8">No active fault detected. All systems operating within bounds.</div>
          ) : (
            history.map((incident) => (
              <div key={incident.id} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-slate-400">
                    {new Date(incident.timestamp + "Z").toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-base text-slate-200 font-medium leading-snug mb-4">
                  {incident.fault_reason}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Healed in {incident.duration}s
                  </span>
                  <span className="text-green-400 font-mono font-bold text-base">${incident.cost_averted}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grok AI Chatbot Panel (Right Side on large screens) */}
      <div className="flex-1 bg-[#0f111a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-gradient-to-r from-purple-950/20 to-transparent">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          <h2 className="font-semibold text-lg text-slate-200">Grok AI Assistant</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
              <div className={`p-4 rounded-2xl text-base shadow-md ${
                msg.role === 'user' 
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100 rounded-br-sm' 
                  : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-bl-sm leading-relaxed'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm p-3">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" />
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce delay-75" />
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce delay-150" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-900/40 flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Grok about the factory status or past incidents..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-base text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-purple-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
