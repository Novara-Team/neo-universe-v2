import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Mail,
  BookOpen,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Users,
  FileText,
  Video,
  Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const faqs: FAQItem[] = [
    {
      question: 'How do I get started with AI Universe?',
      answer: 'Getting started is easy! Simply create a free account, browse our extensive collection of AI tools, and start exploring. You can save favorites, create collections, and access personalized recommendations with our premium plans.',
      category: 'Getting Started'
    },
    {
      question: 'What are the differences between Free, Plus, and Pro plans?',
      answer: 'Free plan gives you access to basic features and tool browsing. Plus plan includes collections, priority submissions, and news access. Pro plan adds personal analytics, AI-powered recommendations, and advanced comparison tools.',
      category: 'Pricing & Plans'
    },
    {
      question: 'How do I submit an AI tool to the platform?',
      answer: 'Navigate to the Submit Tool page, fill in the required information including tool name, category, description, and website URL. Pro members get priority review and faster publishing times.',
      category: 'Submissions'
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes! You can cancel your subscription at any time from your Settings page. Your access will continue until the end of your current billing period.',
      category: 'Pricing & Plans'
    },
    {
      question: 'How often is the tool database updated?',
      answer: 'We update our database daily with new AI tools and verify existing listings regularly. Pro members get early access to newly added tools.',
      category: 'Platform'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor Stripe. All transactions are encrypted and secure.',
      category: 'Pricing & Plans'
    },
    {
      question: 'How does the AI comparison tool work?',
      answer: 'Our comparison tool allows you to select multiple AI tools and view them side-by-side. Pro members get access to advanced AI-powered comparisons that analyze features, pricing, and use cases automatically.',
      category: 'Features'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use industry-standard encryption and security practices. Your personal data is never shared with third parties, and all connections are secured with SSL/TLS.',
      category: 'Security'
    },
    {
      question: 'How do personal analytics work?',
      answer: 'Personal analytics (Pro plan only) track your activity on the platform, showing you insights about your tool discovery patterns, favorite categories, peak activity times, and more.',
      category: 'Features'
    },
    {
      question: 'Can I request a specific AI tool to be added?',
      answer: 'Yes! You can submit tools through our Submit Tool page. If you have a specific request, you can also contact us directly through this support page.',
      category: 'Submissions'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: contactForm
      });

      if (error) throw error;

      setSubmitted(true);
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'normal'
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again or email us directly at novara.team.company@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6">
            <HelpCircle className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">How can we help you?</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Get support, find answers, and connect with our team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-cyan-500/50 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
            <p className="text-slate-400 mb-4">Chat with our support team in real-time</p>
            <p className="text-sm text-cyan-400">Available 24/7</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-green-500/50 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
            <p className="text-slate-400 mb-4">Send us a detailed message</p>
            <p className="text-sm text-green-400">Response within 24h</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Documentation</h3>
            <p className="text-slate-400 mb-4">Browse our help articles and guides</p>
            <p className="text-sm text-purple-400">Self-service help</p>
          </div>
        </div>

        <div className="mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Search className="w-8 h-8 text-cyan-400" />
              Frequently Asked Questions
            </h2>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/50 hover:border-cyan-500/50 transition-colors"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400 font-medium">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{faq.question}</h3>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No results found. Try a different search term.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Mail className="w-7 h-7 text-cyan-400" />
              Contact Us
            </h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                  <textarea
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-green-400" />
                Support Hours
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Live Chat</span>
                  <span className="text-white font-medium">24/7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email Support</span>
                  <span className="text-white font-medium">24/7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Response Time</span>
                  <span className="text-green-400 font-medium">Within 24h</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Additional Resources</h3>
              <div className="space-y-4">
                <Link to="/docs" className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span className="text-slate-300 group-hover:text-white">Documentation</span>
                </Link>
                <a href="#" className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group">
                  <Video className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300 group-hover:text-white">Video Tutorials</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-300 group-hover:text-white">Community Forum</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300 group-hover:text-white">API Documentation</span>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Pro Support</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    Upgrade to Pro for priority support, dedicated account manager, and faster response times.
                  </p>
                  <a href="/pricing" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                    Learn More
                    <Zap className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
