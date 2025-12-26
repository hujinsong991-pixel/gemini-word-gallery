
import React, { useState, useEffect, useRef } from 'react';
import { DictionaryEntry, Message } from '../types';
import { createChatSession } from '../services/geminiService';

interface Props {
  entry: DictionaryEntry;
  onClose: () => void;
}

const ChatInterface: React.FC<Props> = ({ entry, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Welcome. I am here to discuss the nuances of "${entry.word}". What aspects shall we explore?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChatSession(entry);
  }, [entry]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "Pardon? Could you rephrase your inquiry?" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection interrupted. Let us try once more." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-stone-900 flex flex-col animate-fade-in md:max-w-md md:mx-auto md:inset-y-4 md:shadow-2xl transition-colors duration-500">
      <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900 transition-colors">
        <div className="space-y-1">
          <h3 className="font-serif text-xl text-stone-900 dark:text-stone-300">Linguistic Dialogue</h3>
          <p className="text-[9px] text-stone-400 dark:text-stone-600 uppercase tracking-widest font-bold">Regarding "{entry.word}"</p>
        </div>
        <button onClick={onClose} className="p-2 text-stone-300 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
               <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-stone-300 dark:text-stone-700">
                 {m.role === 'user' ? 'Visitor' : 'Curator'}
               </span>
               <p className={`text-sm leading-relaxed transition-colors ${m.role === 'user' ? 'text-stone-600 dark:text-stone-500' : 'text-stone-900 dark:text-stone-300 font-serif'}`}>
                 {m.text}
               </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-1.5 opacity-30">
                <div className="w-1 h-1 bg-stone-900 dark:bg-stone-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-stone-900 dark:bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-stone-900 dark:bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 transition-colors">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your inquiry..."
            className="flex-1 py-3 bg-transparent border-b border-stone-200 dark:border-stone-700 focus:outline-none focus:border-stone-900 dark:focus:border-stone-300 transition-all font-light text-sm italic text-stone-900 dark:text-stone-300"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="text-stone-300 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-300 disabled:opacity-10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
