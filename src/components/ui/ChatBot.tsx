"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { MessageSquare, X, Send,  UserPlus, Headset } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to VAGUE Resort. I'm your virtual concierge. How can I help you explore our services today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

      if (!response.ok) throw new Error("Failed to connect to the resort's systems.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: "assistant", 
            content: assistantContent 
          };
          return newMessages;
        });
      }

      // Auto-scroll logic if they ask for booking
      if (assistantContent.toLowerCase().includes("booking page") || assistantContent.toLowerCase().includes("book now")) {
          const bookingSection = document.getElementById("stay-registration");
          if (bookingSection) {
            setTimeout(() => {
              bookingSection.scrollIntoView({ behavior: "smooth" });
            }, 2000); // Give user time to read
          }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Apologies, I've encountered an issue. Please try again or ask for a human for assistance." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const requestHuman = () => {
    setMessages(prev => [...prev, { role: "assistant", content: "Understood. Our human concierge is available at +251 929 945 151. Would you like to message them on WhatsApp or call now?" }]);
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/251929945151", "_blank");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-cognac text-white shadow-2xl hover:scale-110 transition-transform active:scale-95"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] flex flex-col rounded-3xl overflow-hidden border shadow-2xl ${
              isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/10"
            }`}
          >
            {/* Header */}
            <header className="p-4 bg-cognac text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
              
                <div>
                  <h3 className="text-sm font-bold">VAGUE Concierge</h3>
                  <p className="text-[10px] text-white/70">AI-Powered Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === "user" 
                      ? "bg-cognac text-white rounded-br-none" 
                      : isDark ? "bg-white/5 text-neutral-200 rounded-bl-none" : "bg-black/5 text-neutral-800 rounded-bl-none"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-current opacity-25" />
                      <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                      <div className="w-1 h-1 rounded-full bg-current opacity-75" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-white/5">
                <button 
                    onClick={() => {
                        const bookingSection = document.getElementById("stay-registration");
                        if (bookingSection) bookingSection.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`whitespace-nowrap flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${isDark ? "border-white/10 hover:bg-white/5 text-neutral-400" : "border-black/10 hover:bg-black/5 text-neutral-600"}`}
                >
                    <UserPlus className="w-3 h-3" /> Book Now
                </button>
                <button 
                    onClick={openWhatsApp}
                    className={`whitespace-nowrap flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${isDark ? "border-white/10 hover:bg-green-500/20 text-green-500" : "border-black/10 hover:bg-green-500/10 text-green-600"}`}
                >
                    <Headset className="w-3 h-3" /> WhatsApp +251 929 945 151
                </button>
            </div>

            {/* Input Area */}
            <div className={`p-4 ${isDark ? "bg-black/50" : "bg-neutral-50/50"}`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className={`w-full py-3 px-4 rounded-xl text-sm outline-none transition-all ${
                    isDark ? "bg-white/5 text-white focus:bg-white/10" : "bg-black/5 text-black focus:bg-black/10"
                  }`}
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-cognac hover:scale-110 active:scale-95 disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
