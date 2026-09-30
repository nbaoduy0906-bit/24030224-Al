import React, { useState, useEffect, useRef } from 'react';

const LightningIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 5.23a.75.75 0 011.214-.5l7.5 6a.75.75 0 01-.482 1.343H13.11l1.575 6.74a.75.75 0 01-1.214.5l-7.5-6a.75.75 0 01.482-1.343h4.437l-1.575-6.74z" clipRule="evenodd" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M16.5 7.5h-9v9h9v-9z" />
    <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75V6.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A1.5 1.5 0 017.5 5.25h9a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 15.75v-9zm6.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
  </svg>
);

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi there! I'm your English AI Tutor. Let's practice! How was your day today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [energy, setEnergy] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ad states
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
  
  const messagesEndRef = useRef(null);
  const MAX_ENERGY = 3;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const callGeminiAPI = async (userText) => {
    const apiKey = ""; // API key is handled securely by the Canvas environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    // Format chat history for the API payload
    const formattedHistory = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    formattedHistory.push({ role: 'user', parts: [{ text: userText }] });

    const payload = {
      contents: formattedHistory,
      systemInstruction: {
        parts: [{ 
          text: "You are a helpful, encouraging English tutor. Correct any grammar mistakes the user makes, explain why it was wrong briefly, and then continue the conversation to keep them practicing. Keep responses conversational and not too lengthy." 
        }]
      }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
      return "I couldn't quite catch that. Could you say it again?";
    } catch (error) {
      console.error("API Error:", error);
      return "Oops, I lost connection! Let's try again.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || energy <= 0 || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setEnergy(prev => prev - 1);
    setIsLoading(true);

    const aiResponse = await callGeminiAPI(userMessage);
    
    setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    setIsLoading(false);
  };

  const handleWatchAd = () => {
    setIsAdPlaying(true);
    setAdCountdown(3);

    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAdPlaying(false);
          setEnergy(MAX_ENERGY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 font-sans p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[80vh] relative ring-1 ring-slate-200">
        
        {/* App Header */}
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center space-x-2">
            <BotIcon />
            <h1 className="text-xl font-bold tracking-tight">English AI Tutor</h1>
          </div>
          
          <div className="flex items-center bg-teal-800/40 rounded-full px-3 py-1.5 border border-teal-500/30">
            <LightningIcon className="w-5 h-5 text-amber-300 mr-1" />
            <span className="font-bold text-sm">{energy}/{MAX_ENERGY}</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-br-sm' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
              }`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {}
        <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {energy > 0 ? (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-[15px]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-teal-600 text-white rounded-full p-3.5 flex items-center justify-center hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <SendIcon />
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 animate-fade-in-up">
              <p className="text-slate-500 text-sm mb-3 font-medium">You are out of energy!</p>
              <button
                onClick={handleWatchAd}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transform transition-all active:scale-[0.98]"
              >
                <PlayIcon />
                Watch Ad to Get +3 <LightningIcon className="w-5 h-5 mx-1 text-amber-300" />
              </button>
            </div>
          )}
        </div>

        {/* Simulated Ad Fullscreen Overlay */}
        {isAdPlaying && (
          <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-white p-6 animate-fade-in">
            {/* Fake Ad Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-6 shadow-2xl animate-pulse"></div>
              <h2 className="text-2xl font-black mb-2 text-center">Learn 50 Languages Fast!</h2>
              <p className="text-slate-400 text-center mb-8 text-sm">Download the ultimate app today. (Simulated Ad)</p>
            </div>
            
            {/* Reward Countdown */}
            <div className="w-full max-w-[200px] mb-10">
              <div className="bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-700">
                <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Reward in</span>
                <span className="font-bold text-4xl text-amber-400">{adCountdown}</span>
              </div>
              
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                <div 
                  className="bg-amber-400 h-1.5 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((3 - adCountdown) / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}