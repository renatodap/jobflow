'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';

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

/**
 * Redesigned AI Assistant Banner - prominent, integrated chat experience
 * Fixed: Full-width banner design instead of tiny floating button
 * Features: Collapsible interface, sample questions, rate limiting display
 */
export default function AssistantBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Focus input when chat expands
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

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

  const handleSampleQuestion = (question: string) => {
    setInput(question);
    if (!isExpanded) {
      setIsExpanded(true);
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

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
      {/* Banner Header - Always Visible */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-full">
                <Sparkles className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Ask Feel Sharper</h2>
                <p className="text-sm text-slate-300">Get instant, evidence-based wellness guidance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
                <span>{remainingQueries}/3 questions remaining</span>
                {remainingQueries === 0 && resetTime && (
                  <span className="text-amber-400">
                    • Resets in {formatTimeUntilReset(resetTime)}
                  </span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-slate-700 border-slate-600"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Ask Question
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Sample Questions - Visible when collapsed */}
          {!isExpanded && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sampleQuestions.slice(0, 2).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleQuestion(question)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-full transition-colors duration-200"
                  disabled={remainingQueries === 0}
                >
                  "{question}"
                </button>
              ))}
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 transition-colors duration-200"
              >
                See more questions →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <div className="border-t border-slate-700 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Sample Questions Grid */}
            {messages.length === 0 && (
              <div className="py-6">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Try asking about:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuestion(question)}
                      className="text-left text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 p-3 rounded-lg transition-colors duration-200"
                      disabled={remainingQueries === 0}
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="py-4 max-h-96 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl ${message.isUser ? 'ml-12' : 'mr-12'}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.isUser
                            ? 'bg-amber-500 text-slate-900'
                            : 'bg-slate-700 text-slate-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-600">
                            <p className="text-xs text-slate-400 mb-2 font-medium">
                              Sources from Feel Sharper:
                            </p>
                            <div className="space-y-1">
                              {message.sources.map((source, index) => (
                                <a
                                  key={index}
                                  href={source.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {source.title}
                                  {source.similarity && (
                                    <span className="text-slate-500 ml-1">
                                      ({Math.round(source.similarity * 100)}% match)
                                    </span>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-slate-500 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="mr-12">
                      <div className="bg-slate-700 p-3 rounded-lg flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        <span className="text-sm text-slate-300">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="py-2 px-4 bg-red-900/20 border border-red-800 rounded-lg mb-4">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Input Area */}
            <div className="py-4 border-t border-slate-700">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={remainingQueries > 0 ? "Ask about sleep, energy, focus, or wellness..." : "Rate limit reached"}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isLoading || remainingQueries === 0}
                  maxLength={500}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || remainingQueries === 0}
                  variant="primary"
                  size="md"
                  className="px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                <span>{input.length}/500</span>
                <span className="text-slate-500">
                  This is general information - consult a healthcare professional for medical concerns.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
