import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Zap, Users, Shield, FileText } from "lucide-react";

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
              <span className="text-xl font-bold text-slate-900">FormBuilder</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#examples" className="text-slate-600 hover:text-slate-900 transition-colors">Examples</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
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
              <Star className="w-4 h-4 fill-indigo-500" />
              Trusted by 10,000+ form creators
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6">
              Build Beautiful Forms
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                In Minutes
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Create stunning, responsive forms with our drag-and-drop builder. 
              No coding required. Collect responses, analyze data, and automate workflows.
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
                <div className="text-3xl font-bold text-slate-900 mb-2">10K+</div>
                <div className="text-slate-600">Forms Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">500K+</div>
                <div className="text-slate-600">Responses Collected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">99.9%</div>
                <div className="text-slate-600">Uptime</div>
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
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features to create, manage, and analyze your forms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
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

      {/* Examples Section */}
      <section id="examples" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Beautiful Form Examples
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what you can create with our form builder
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {examples.map((example, index) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">
                      {example.title}
                    </h4>
                    <p className="text-slate-600">
                      {example.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="space-y-4">
                <div className="bg-slate-100 h-12 rounded-lg animate-pulse"></div>
                <div className="bg-slate-100 h-4 rounded w-3/4 animate-pulse"></div>
                <div className="bg-slate-100 h-12 rounded-lg animate-pulse"></div>
                <div className="bg-slate-100 h-4 rounded w-1/2 animate-pulse"></div>
                <div className="bg-slate-100 h-32 rounded-lg animate-pulse"></div>
                <div className="bg-indigo-500 h-12 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Create Your First Form?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of form creators who trust FormBuilder for their data collection needs.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
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
                <span className="text-xl font-bold text-white">FormBuilder</span>
              </div>
              <p className="text-slate-400">
                Build beautiful forms that convert. No coding required.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#examples" className="hover:text-white transition-colors">Examples</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p>&copy; 2024 FormBuilder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Zap,
    title: "Drag & Drop Builder",
    description: "Create beautiful forms in minutes with our intuitive drag-and-drop interface. No coding skills required."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime. Your data is safe with us."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together with your team in real-time. Share forms and manage responses collaboratively."
  },
  {
    icon: FileText,
    title: "Multiple Form Types",
    description: "Create contact forms, surveys, registrations, payment forms, and more with pre-built templates."
  },
  {
    icon: Star,
    title: "Custom Branding",
    description: "Add your logo, colors, and fonts to match your brand identity perfectly."
  },
  {
    icon: CheckCircle,
    title: "Advanced Analytics",
    description: "Get insights into your form performance with detailed analytics and response tracking."
  }
];

const examples = [
  {
    title: "Contact Forms",
    description: "Beautiful contact forms with spam protection and automatic email notifications."
  },
  {
    title: "Event Registrations",
    description: "Create event registration forms with payment integration and attendee management."
  },
  {
    title: "Customer Surveys",
    description: "Design engaging surveys with conditional logic and real-time response tracking."
  },
  {
    title: "Lead Generation",
    description: "Capture leads with optimized forms that integrate with your CRM and marketing tools."
  },
  {
    title: "Feedback Forms",
    description: "Collect customer feedback with rating scales, comment boxes, and sentiment analysis."
  }
];