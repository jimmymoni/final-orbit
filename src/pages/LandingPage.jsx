import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, Users, Zap, BarChart3, Clock, Target, ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/orbit-logo.png" alt="FinalApps Orbit" className="w-12 h-12 object-contain" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">FinalApps Orbit</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">About</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Features</button>
            <Button onClick={() => navigate('/login')} size="sm" className="rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
              <Sparkles className="w-4 h-4 text-finalapps-blue" />
              <span className="text-sm font-medium text-finalapps-blue">Transform Your Shopify Community Strategy</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-center text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              One workspace.
            </span>
            <br />
            <span className="bg-gradient-to-r from-finalapps-blue to-blue-600 bg-clip-text text-transparent">
              Zero missed opportunities.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-center text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            FinalApps Orbit transforms Shopify Community inquiries into trackable, actionable tasks.
            Assign automatically, reply faster, measure everything.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="rounded-full text-base px-8 py-6 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full text-base px-8 py-6 border-2 hover:bg-gray-50 transition-all"
            >
              See How It Works
            </Button>
          </div>

          {/* Hero Image/Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-32 bottom-0"></div>
            <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white p-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
                  {/* Mock Cards */}
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-2 bg-gray-100 rounded w-full mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-finalapps-blue to-blue-600 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-gray-600 font-medium">Inquiry Coverage</div>
              <p className="text-sm text-gray-500">Never miss a merchant opportunity</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-finalapps-blue to-blue-600 bg-clip-text text-transparent">
                4hrs
              </div>
              <div className="text-gray-600 font-medium">Avg Response Time</div>
              <p className="text-sm text-gray-500">With automatic escalation</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-finalapps-blue to-blue-600 bg-clip-text text-transparent">
                10x
              </div>
              <div className="text-gray-600 font-medium">Team Accountability</div>
              <p className="text-sm text-gray-500">Real-time performance tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Everything you need.
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Nothing you don't.
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for teams who want results, not busywork.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-finalapps-blue hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-finalapps-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Round-Robin Assignment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Fair, automatic distribution. Every team member gets their turn. No manual sorting.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-finalapps-blue hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-finalapps-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Deadlines</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automatic escalation when time runs out. No inquiry falls through the cracks.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-finalapps-blue hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-finalapps-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Scoring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track speed, quality, and outcomes. See who's crushing it and who needs coaching.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-finalapps-blue hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-finalapps-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">App Knowledge Base</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every app documented. Features, competitors, templates. Your team's brain, organized.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-finalapps-blue hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-finalapps-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Dashboard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Live updates. No refresh needed. See everything happening as it happens.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-finalapps-blue hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-finalapps-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Audit Trail</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every action logged forever. Assignments, replies, escalations. Full transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-finalapps-blue via-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full border border-white/30 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Start Free Today</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to transform your
            <br />
            Shopify Community strategy?
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join teams who've turned chaos into clarity. Get started in minutes, not weeks.
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-finalapps-blue hover:bg-gray-100 rounded-full text-base px-8 py-6 shadow-2xl hover:shadow-white/50 transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="mt-8 text-blue-100 text-sm">
            No credit card required • Setup in 5 minutes • Free forever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/orbit-logo.png" alt="FinalApps Orbit" className="w-12 h-12 object-contain" />
                <h3 className="text-xl font-bold text-gray-900">FinalApps Orbit</h3>
              </div>
              <p className="text-gray-600 text-sm max-w-sm">
                The internal platform for managing Shopify Community opportunities with accountability and precision.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-finalapps-blue transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-finalapps-blue transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-finalapps-blue transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-finalapps-blue transition-colors">About</a></li>
                <li><a href="#" className="hover:text-finalapps-blue transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-finalapps-blue transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2024 FinalApps, Inc. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Built with React, Tailwind CSS & Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
