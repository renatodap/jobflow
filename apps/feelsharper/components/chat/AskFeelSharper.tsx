'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  sources?: { title: string; link: string; similarity?: number }[];
  timestamp: Date;
}

interface ApiResponse {
  response: string;
  sources?: { title: string; link: string; similarity?: number }[];
  remainingQueries: number;
  resetTime: number;
  error?: string;
}

export default function AskFeelSharper() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQueries, setRemainingQueries] = useState(3);
  const [resetTime, setResetTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || remainingQueries === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-ID': `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          sessionId: `session_${Date.now()}`
        })
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Something went wrong`);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        sources: data.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRemainingQueries(data.remainingQueries);
      setResetTime(data.resetTime);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Sorry, something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimeUntilReset = (resetTime: number): string => {
    const now = Date.now();
    const diff = resetTime - now;
    
    if (diff <= 0) return 'now';
    
    const minutes = Math.ceil(diff / (60 * 1000));
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.ceil(diff / (60 * 60 * 1000));
    return `${hours}h`;
  };

  const sampleQuestions = [
    "Should I take magnesium at night?",
    "What's better for sleep: magnesium or ashwagandha?",
    "How do I build a morning routine for better energy?",
    "I wake up at 3am every night, what should I do?"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-amber hover:bg-amber-600 text-neutral-900 p-4 rounded-full shadow-strong transition-all duration-200 z-50 group"
        aria-label="Open Ask Feel Sharper chat"
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute -top-2 -right-2 bg-brand-amber text-neutral-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          <Sparkles className="h-3 w-3" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-neutral-0 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-strong flex flex-col z-50 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-t-2xl">
        <div>
          <h3 className="font-serif font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-amber" />
            Ask Feel Sharper
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {remainingQueries > 0 
              ? `${remainingQueries} questions remaining`
              : resetTime 
                ? `Resets in ${formatTimeUntilReset(resetTime)}`
                : 'Rate limited'
            }
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 dark:text-neutral-400 text-sm space-y-4">
            <div>
              <p className="font-medium mb-2">Ask me about wellness optimization:</p>
              <div className="space-y-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="block w-full text-left p-2 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              Direct, grounded, intentional wellness guidance.
            </p>
          </div>
        )}
        
        {messages.map(message => (
          <div
            key={message.id}
            className={`${message.isUser ? 'ml-8' : 'mr-8'}`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.isUser
                  ? 'bg-brand-amber text-neutral-900 ml-auto'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-0'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 font-medium">
                    Sources from Feel Sharper:
                  </p>
                  <div className="space-y-1">
                    {message.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-brand-amber hover:text-amber-600 hover:underline transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {source.title}
                        {source.similarity && (
                          <span className="text-neutral-500 ml-1">
                            ({Math.round(source.similarity * 100)}% match)
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="mr-8">
            <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Thinking...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={remainingQueries > 0 ? "Ask about sleep, energy, focus..." : "Rate limit reached"}
            className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber focus:border-transparent dark:bg-neutral-700 dark:text-neutral-0 placeholder-neutral-400 dark:placeholder-neutral-500"
            disabled={isLoading || remainingQueries === 0}
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || remainingQueries === 0}
            className="px-3 py-2 bg-brand-amber text-neutral-900 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{input.length}/500</span>
          {remainingQueries === 0 && resetTime && (
            <span className="text-brand-amber dark:text-brand-amber">
              Resets in {formatTimeUntilReset(resetTime)}
            </span>
          )}
        </div>
        
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
          This is general information - consult a healthcare professional for medical concerns.
        </p>
      </div>
    </div>
  );
}
