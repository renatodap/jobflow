"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { 
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Lightbulb,
  Target,
  TrendingUp,
  Calendar,
  Dumbbell,
  Apple,
  Moon,
  Zap,
  Heart,
  MessageCircle,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'suggestion' | 'insight' | 'plan';
  metadata?: {
    category?: string;
    confidence?: number;
    sources?: string[];
    actionItems?: string[];
  };
}

interface CoachingInsight {
  id: string;
  title: string;
  description: string;
  category: 'workout' | 'nutrition' | 'sleep' | 'recovery' | 'motivation';
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  icon: any;
  color: string;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: any;
  category: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: '1',
    label: 'Plan Today\'s Workout',
    prompt: 'Based on my recent training and recovery, what should I focus on in today\'s workout?',
    icon: Dumbbell,
    category: 'Workout'
  },
  {
    id: '2',
    label: 'Nutrition Advice',
    prompt: 'Looking at my recent meals and goals, what nutrition adjustments should I make?',
    icon: Apple,
    category: 'Nutrition'
  },
  {
    id: '3',
    label: 'Sleep Optimization',
    prompt: 'How can I improve my sleep quality based on my current patterns?',
    icon: Moon,
    category: 'Sleep'
  },
  {
    id: '4',
    label: 'Progress Review',
    prompt: 'Can you analyze my recent progress and suggest areas for improvement?',
    icon: TrendingUp,
    category: 'Progress'
  },
  {
    id: '5',
    label: 'Motivation Boost',
    prompt: 'I\'m feeling unmotivated today. Can you help me get back on track?',
    icon: Zap,
    category: 'Motivation'
  },
  {
    id: '6',
    label: 'Weekly Planning',
    prompt: 'Help me plan an effective workout and nutrition schedule for this week.',
    icon: Calendar,
    category: 'Planning'
  }
];

const SAMPLE_INSIGHTS: CoachingInsight[] = [
  {
    id: '1',
    title: 'Recovery Opportunity',
    description: 'Your sleep quality has improved 15% this week. Consider adding an extra training session.',
    category: 'recovery',
    priority: 'medium',
    actionable: true,
    icon: Moon,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  },
  {
    id: '2',
    title: 'Protein Timing',
    description: 'You\'re hitting your daily protein target, but spreading it more evenly could improve muscle synthesis.',
    category: 'nutrition',
    priority: 'low',
    actionable: true,
    icon: Apple,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  },
  {
    id: '3',
    title: 'Strength Plateau',
    description: 'Your bench press has plateaued. Time to try a new rep scheme or accessory work.',
    category: 'workout',
    priority: 'high',
    actionable: true,
    icon: Dumbbell,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }
];

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [insights, setInsights] = useState<CoachingInsight[]>(SAMPLE_INSIGHTS);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversationHistory();
    generatePersonalizedInsights();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationHistory = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (conversations) {
        const formattedMessages: Message[] = conversations.map(conv => ({
          id: conv.id,
          role: conv.role,
          content: conv.message,
          timestamp: conv.created_at,
          type: conv.metadata?.type || 'text',
          metadata: conv.metadata
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const generatePersonalizedInsights = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // In a real implementation, this would analyze user data and generate insights
      // For now, we'll use the sample insights
      console.log('Generating personalized insights...');
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: 'coaching',
          includePersonalData: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        type: data.type || 'text',
        metadata: {
          confidence: data.confidence,
          sources: data.sources,
          actionItems: data.actionItems
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save conversation to database
      await saveConversation(userMessage, assistantMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (userMessage: Message, assistantMessage: Message) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase.from('ai_conversations').insert([
        {
          user_id: user.id,
          role: userMessage.role,
          message: userMessage.content,
          metadata: userMessage.metadata,
          created_at: userMessage.timestamp
        },
        {
          user_id: user.id,
          role: assistantMessage.role,
          message: assistantMessage.content,
          metadata: assistantMessage.metadata,
          created_at: assistantMessage.timestamp
        }
      ]);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const handleInsightAction = (insight: CoachingInsight) => {
    const prompt = `Can you give me more specific advice about: ${insight.description}`;
    sendMessage(prompt);
    setSelectedInsight(insight.id);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                AI Coach
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Your personalized fitness and wellness assistant
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Welcome to your AI Coach!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      I'm here to help you optimize your workouts, nutrition, sleep, and overall wellness journey. 
                      Ask me anything or try one of the quick actions below.
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-3",
                        message.role === 'user'
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      )}
                    >
                      <p className={cn(
                        "text-sm",
                        message.role === 'user' 
                          ? 'text-white' 
                          : 'text-slate-900 dark:text-slate-100'
                      )}>
                        {message.content}
                      </p>
                      
                      {message.metadata?.actionItems && message.metadata.actionItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Action Items:
                          </p>
                          <ul className="space-y-1">
                            {message.metadata.actionItems.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2 text-xs">
                                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about workouts, nutrition, sleep, or anything wellness-related..."
                      className="pr-12"
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startVoiceInput}
                      disabled={isLoading || isListening}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className="flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {QUICK_ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      onClick={() => handleQuickAction(action)}
                      className="w-full justify-start text-left h-auto py-3"
                      disabled={isLoading}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{action.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{action.category}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Personalized Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Insights for You
              </h3>
              <div className="space-y-4">
                {insights.map(insight => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={insight.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all hover:shadow-sm",
                        insight.color,
                        selectedInsight === insight.id && "ring-2 ring-amber-500"
                      )}
                      onClick={() => handleInsightAction(insight)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-xs opacity-80 line-clamp-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-60 capitalize">
                              {insight.priority} priority
                            </span>
                            {insight.actionable && (
                              <Lightbulb className="w-3 h-3 opacity-60" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Coach Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Coach Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Conversations</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Insights Generated</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{insights.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Response Time</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">~2s</span>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Coach Online</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
