import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Zap, Users, Shield, FileText, Heart, Sparkles, Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Sangh Forms</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#examples" className="text-slate-600 hover:text-slate-900 transition-colors">Examples</a>
              <a href="#community" className="text-slate-600 hover:text-slate-900 transition-colors">Community</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Heart className="w-4 h-4 fill-indigo-500" />
              Built for Yuva Sangha Community
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6">
              Beautiful Forms for
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sangha Community
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Create stunning, responsive forms specifically designed for Yuva Sangha initiatives. 
              Collect registrations, manage events, and engage your community effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/login" 
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl hover:border-slate-400 transition-all duration-300 font-semibold text-lg">
                View Demo
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
                <div className="text-slate-600">Sanghas Using</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">50K+</div>
                <div className="text-slate-600">Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">100%</div>
                <div className="text-slate-600">Community Focused</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Built for Sangha Needs
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Specialized features designed specifically for Yuva Sangha community management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by Sangha Community
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of Yuva volunteers who trust Sangh Forms for their community initiatives
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-slate-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-700 italic">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Perfect for Sangha Activities
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Create beautiful forms for all your community events and initiatives
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {examples.map((example, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {example.title}
                    </h4>
                    <p className="text-slate-600">
                      {example.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="space-y-4">
                <div className="bg-white h-12 rounded-lg border border-slate-200 shadow-sm"></div>
                <div className="bg-white h-4 rounded w-3/4 text-transparent">Form field label</div>
                <div className="bg-white h-12 rounded-lg border border-slate-200 shadow-sm"></div>
                <div className="bg-white h-4 rounded w-1/2 text-transparent">Another field</div>
                <div className="bg-white h-32 rounded-lg border border-slate-200 shadow-sm"></div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-12 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Submit Registration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Start Your Sangha Journey Today
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Community Engagement?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of Yuva Sanghas already using our platform to create beautiful, effective forms for their community initiatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Start Free Today
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold text-lg">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Sangh Forms</span>
              </div>
              <p className="text-slate-400">
                Beautiful forms built for Yuva Sangha community. Engage, register, and grow together.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#examples" className="hover:text-white transition-colors">Examples</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Sangha</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Yuva</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Initiatives</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Get Involved</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p>Built with ❤️ for the Yuva Sangha Community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Users,
    title: "Sangha Hierarchy",
    description: "Built-in support for Vibhaag, Khanda, Valaya, and Milan hierarchy. Perfect for organizational structure."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade security ensuring all community data remains safe and confidential."
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Get started in minutes with pre-built templates designed for Sangha activities and events."
  },
  {
    icon: Heart,
    title: "Community First",
    description: "Built specifically for Yuva Sangha needs with features that matter to your community."
  },
  {
    icon: FileText,
    title: "Smart Forms",
    description: "Conditional logic, file uploads, and custom validation for all your registration needs."
  },
  {
    icon: CheckCircle,
    title: "Real-time Analytics",
    description: "Track registrations, attendance, and engagement with beautiful, easy-to-understand dashboards."
  }
];

const examples = [
  {
    title: "Yuva Training Registration",
    description: "Complete registration forms for workshops, shibirs, and training programs with hierarchical data capture."
  },
  {
    title: "Event Participation",
    description: "Manage event registrations with automatic confirmation emails and attendance tracking."
  },
  {
    title: "Volunteer Sign-ups",
    description: "Coordinate volunteer efforts with custom forms that capture skills, availability, and preferences."
  },
  {
    title: "Community Feedback",
    description: "Collect valuable feedback from your Sangha members to improve programs and initiatives."
  },
  {
    title: "Membership Management",
    description: "Streamline new member onboarding with automated forms and database integration."
  }
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Yuva Pramukh, Bengaluru Dakshin",
    initials: "RK",
    quote: "Sangh Forms transformed how we manage our Yuva registrations. The hierarchy support is perfect for our organizational structure!"
  },
  {
    name: "Priya Sharma",
    role: "Event Coordinator, Mumbai Vibhaag",
    initials: "PS",
    quote: "Beautiful forms that our Yuva members love to fill. The analytics help us plan better events."
  },
  {
    name: "Amit Patel",
    role: "Digital Head, Delhi Sangh",
    initials: "AP",
    quote: "Finally, a form builder that understands Sangha needs. The community-focused features are incredible."
  }
];