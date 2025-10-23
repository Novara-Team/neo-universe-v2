import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Send, Bot, User, Lock, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { chatWithAIAssistant, ChatMessage, extractRequirementsFromConversation } from '../lib/ai-assistant';

export default function AISelect() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your AI tool selection assistant. I'm here to help you find the perfect AI tools for your needs.

I can help you with:
- Finding tools based on your specific requirements
- Comparing different tools
- Checking budget compatibility
- Understanding features and integrations
- Providing setup guidance

What kind of AI tools are you looking for today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const requirements = extractRequirementsFromConversation([...messages, userMessage]);
      const response = await chatWithAIAssistant([...messages, userMessage], requirements);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Show me free AI tools for content writing',
    'I need a tool for team collaboration',
    'What are the best AI tools for image generation?',
    'Compare ChatGPT and Claude',
    'Find tools with API access under $50/month',
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (!profile || profile.subscription_plan !== 'pro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Pro Feature</h2>
            <p className="text-slate-300 mb-8 text-lg">
              AI Select is an exclusive feature for Pro members. Get personalized tool recommendations through an intelligent chatbot assistant.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">AI Select</h1>
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full">
              PRO
            </span>
          </div>
          <p className="text-slate-400 text-lg">
            Your intelligent assistant for finding the perfect AI tools
          </p>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-[600px] overflow-y-auto p-6 space-y-6" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-3`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700'
                  }`}
                >
                  <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-slate-400 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-3 font-medium">Quick prompts to get started:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded-lg transition-all border border-slate-600 hover:border-cyan-500/50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-700 p-4 bg-slate-800/50">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about AI tools..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline font-medium">Send</span>
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-2 text-center">
              AI Select is available 24/7 to help you find the perfect tools
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Personalized</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Get recommendations tailored to your specific needs and requirements
            </p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Intelligent</h3>
            </div>
            <p className="text-slate-400 text-sm">
              AI-powered assistant understands context and provides smart suggestions
            </p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowRight className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Guided</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Step-by-step guidance from discovery to implementation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
