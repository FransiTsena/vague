"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { MessageSquare, X, Send, UserPlus, Headset, Sparkles, Minus, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  roomCards?: Array<{
    roomNumber: string;
    type: string;
    price: number;
    description: string;
  }>;
}

export default function ChatBot() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to VAGUE. How may we assist your stay today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) throw new Error("Connection error.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        
        let cleanedContent = assistantContent;
        let roomCardsData: any[] = [];

        // Use global flag /g to find all tags
        const tagMatches = assistantContent.matchAll(/\[\[ROOM_CARD:(\{[\s\S]*?\})\]\]/g);
        
        for (const match of tagMatches) {
          try {
            const rawJson = match[1];
            const parsed = JSON.parse(rawJson);
            roomCardsData.push(parsed);
            cleanedContent = cleanedContent.replace(match[0], "").trim();
          } catch (e) {
            // Wait for full tag
          }
        }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: "assistant", 
            content: cleanedContent,
            roomCards: roomCardsData.length > 0 ? roomCardsData : undefined
          };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Our apologies. Please try again or reach out to our concierge." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/251929945151", "_blank");
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`fixed bottom-10 right-10 z-[100] group flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]`}
      >
        <span className={`text-[10px] uppercase tracking-[0.4em] font-light transition-all duration-700 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 ${isDark ? "text-white" : "text-black"}`}>
          Concierge
        </span>
        <div className={`p-6 rounded-full border shadow-none hover:scale-105 active:scale-95 transition-all duration-500 relative overflow-hidden ${
          isDark ? "bg-black border-white/20" : "bg-white border-black/10"
        }`}>
          <MessageSquare className={`w-5 h-5 font-light ${isDark ? "text-white" : "text-black"}`} strokeWidth={1} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              filter: "blur(0px)",
              height: isMinimized ? "80px" : "640px"
            }}
            exit={{ opacity: 0, y: 40, filter: "blur(15px)" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className={`fixed bottom-10 right-10 z-[110] w-[400px] flex flex-col rounded-none border shadow-none ${
              isDark 
                ? "bg-black/95 border-white/10" 
                : "bg-white border-black/10"
            }`}
          >
            {/* Minimalist Header */}
            <header className={`p-8 flex justify-between items-start border-b ${
              isDark ? "border-white/5" : "border-black/5"
            }`}>
              <div className="space-y-1">
                <h3 className={`text-xs font-serif tracking-[0.3em] uppercase ${isDark ? "text-white" : "text-black"}`}>
                  VAGUE
                </h3>
                <p className={`text-[9px] uppercase tracking-[0.2em] font-light ${isDark ? "text-white/60" : "text-black/60"}`}>
                  Virtual Private Assistant
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsMinimized(!isMinimized)} className="opacity-40 hover:opacity-100 transition-opacity">
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </header>

            {!isMinimized && (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div className={`max-w-[90%] text-xs leading-relaxed tracking-wider font-light ${
                        m.role === "user" 
                          ? `${isDark ? "text-white" : "text-black"} italic` 
                          : `${isDark ? "text-neutral-400" : "text-neutral-600"}`
                      }`}>
                        {m.content}
                      </div>
                      
                      {m.roomCards && m.roomCards.length > 0 && (
                        <div className="w-full space-y-4">
                          {m.roomCards.map((card, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`w-full p-4 border rounded-none shadow-sm ${
                                isDark ? "bg-white/[0.03] border-white/10" : "bg-black/[0.02] border-black/5"
                              }`}
                            >
                              <div className="flex justify-between items-end mb-3">
                                <h4 className={`text-[9px] uppercase tracking-[0.3em] font-medium ${isDark ? "text-white" : "text-black"}`}>
                                  {card.type}
                                </h4>
                                <span className={`text-[10px] font-light tracking-widest ${isDark ? "text-white/60" : "text-black/60"}`}>
                                  ${card.price}
                                </span>
                              </div>
                              
                              <p className={`text-[9px] leading-relaxed mb-4 opacity-50 font-light max-w-[80%] ${isDark ? "text-white" : "text-black"}`}>
                                {card.description}
                              </p>

                              <button
                                onClick={() => window.location.href = `/booking?room=${card.roomNumber}`}
                                className={`w-full py-2.5 text-[8px] uppercase tracking-[0.4em] transition-all duration-700 hover:bg-current group relative overflow-hidden ${
                                  isDark ? "border border-white/20 text-white" : "border border-black/10 text-black"
                                }`}
                              >
                                <span className="relative z-10 group-hover:invert duration-700 transition-all">Book Stay</span>
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 opacity-30">
                        <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                        <div className="w-1 h-1 rounded-full bg-current animate-pulse delay-75" />
                        <div className="w-1 h-1 rounded-full bg-current animate-pulse delay-150" />
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-8 pt-0 flex gap-6 overflow-x-auto scrollbar-hide`}>
                    <button 
                        onClick={() => document.getElementById("stay-registration")?.scrollIntoView({ behavior: "smooth" })}
                        className={`text-[9px] uppercase tracking-[0.3em] font-light border-b border-transparent hover:border-current transition-all py-1 ${isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"}`}
                    >
                        Reservation
                    </button>
                    <button 
                        onClick={openWhatsApp}
                        className={`text-[9px] uppercase tracking-[0.3em] font-light border-b border-transparent hover:border-current transition-all py-1 ${isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"}`}
                    >
                        Concierge
                    </button>
                </div>

                <div className="p-8 pt-0">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Your inquiry..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      className={`w-full bg-transparent py-4 text-xs outline-none border-b font-light tracking-widest transition-all ${
                        isDark 
                          ? "border-white/20 focus:border-white/60 text-white placeholder:text-white/40" 
                          : "border-black/10 focus:border-black/60 text-black placeholder:text-black/40"
                      }`}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-0 group-focus-within:opacity-100 transition-all ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" strokeWidth={1} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
