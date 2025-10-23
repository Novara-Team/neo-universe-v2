import { Sparkles, Target, Users, Zap, Globe2, Rocket, TrendingUp, Shield, Award, BarChart3, Layers, Search, Bot, Code, Palette, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full px-6 py-2 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wide">ABOUT AI UNIVERSE</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Discover the Future of
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Artificial Intelligence
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive platform for exploring, comparing, and mastering the world's most innovative AI tools
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/50">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                AI Universe was built to democratize access to artificial intelligence by making powerful AI tools simple, fast, and accessible to everyone.
              </p>
              <p className="text-slate-400 leading-relaxed">
                In a world where new AI technologies emerge daily, we provide a centralized platform where users can explore, compare, and discover the perfect tools for their unique needs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                To become the world's most trusted destination for AI tool discovery, empowering millions to work smarter and achieve more.
              </p>
              <p className="text-slate-400 leading-relaxed">
                We envision a future where everyone, from content creators to developers, can harness the full potential of AI to transform their work and unlock new possibilities.
              </p>
            </div>
          </div>

          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Why Choose AI Universe</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Everything you need to navigate the AI revolution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-cyan-500/50">
                  <Globe2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1000+ Tools</h3>
                <p className="text-slate-400 leading-relaxed">
                  Comprehensive directory of curated AI tools across all categories
                </p>
              </div>

              <div className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:bg-slate-800/50 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/50">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Search</h3>
                <p className="text-slate-400 leading-relaxed">
                  Advanced filtering and AI-powered search to find exactly what you need
                </p>
              </div>

              <div className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:bg-slate-800/50 hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-emerald-500/50">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Updates</h3>
                <p className="text-slate-400 leading-relaxed">
                  Stay ahead with the latest AI news, tools, and industry trends
                </p>
              </div>

              <div className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:bg-slate-800/50 hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-amber-500/50">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Community Driven</h3>
                <p className="text-slate-400 leading-relaxed">
                  Join thousands of AI enthusiasts sharing and discovering tools
                </p>
              </div>
            </div>
          </div>

          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Explore by Category</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                AI tools for every use case and industry
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: MessageSquare, name: 'Content Writing', color: 'from-cyan-500 to-blue-500' },
                { icon: Palette, name: 'Design & Art', color: 'from-pink-500 to-rose-500' },
                { icon: Code, name: 'Development', color: 'from-emerald-500 to-teal-500' },
                { icon: Bot, name: 'Chatbots', color: 'from-violet-500 to-purple-500' },
                { icon: BarChart3, name: 'Analytics', color: 'from-amber-500 to-orange-500' },
                { icon: Layers, name: 'Productivity', color: 'from-blue-500 to-cyan-500' },
              ].map((category, index) => (
                <Link
                  key={index}
                  to="/explore"
                  className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-sm">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:border-cyan-500/30 transition-all duration-500">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  1000+
                </div>
                <p className="text-slate-400 font-medium">AI Tools Catalogued</p>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:border-blue-500/30 transition-all duration-500">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                  50K+
                </div>
                <p className="text-slate-400 font-medium">Active Users</p>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:border-emerald-500/30 transition-all duration-500">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <p className="text-slate-400 font-medium">Platform Availability</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border border-cyan-500/20 rounded-3xl p-12 sm:p-16 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-pulse pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-semibold">JOIN THE REVOLUTION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals leveraging AI to work smarter, faster, and more creatively
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/explore"
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-2xl shadow-cyan-500/50 font-semibold text-lg hover:scale-105 duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Explore AI Tools
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </span>
                </Link>
                <Link
                  to="/submit"
                  className="group px-8 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-white rounded-xl hover:bg-slate-800 hover:border-cyan-500/50 transition-all font-semibold text-lg hover:scale-105 duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Submit Your Tool
                    <Rocket className="w-5 h-5 group-hover:translate-y-[-4px] transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
