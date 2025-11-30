import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SuvaduLogo from '../components/common/SuvaduLogo';

const LandingPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  const features = [
    {
      icon: '📋',
      title: 'Smart Checklists',
      description: 'Automated task generation based on employee role, department, and separation type.',
    },
    {
      icon: '🔄',
      title: 'Workflow Automation',
      description: 'Streamlined approval processes with multi-level manager sign-offs.',
    },
    {
      icon: '📊',
      title: 'Real-time Tracking',
      description: 'Monitor separation progress with intuitive dashboards and status updates.',
    },
    {
      icon: '🔐',
      title: 'Role-based Access',
      description: 'Secure access control for employees, managers, and HR administrators.',
    },
    {
      icon: '📧',
      title: 'Notifications',
      description: 'Automated email alerts for pending tasks and deadline reminders.',
    },
    {
      icon: '📁',
      title: 'Document Management',
      description: 'Centralized storage for exit documents, clearances, and compliance records.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Initiate Separation',
      description: 'HR or manager initiates the separation process with employee details.',
    },
    {
      number: '02',
      title: 'Auto-generate Tasks',
      description: 'System creates personalized checklists based on role and department.',
    },
    {
      number: '03',
      title: 'Track Progress',
      description: 'All stakeholders complete their assigned tasks with real-time updates.',
    },
    {
      number: '04',
      title: 'Complete Exit',
      description: 'Final sign-off and documentation for a smooth transition.',
    },
  ];

  const testimonials = [
    {
      quote: "Suvadu reduced our offboarding time by 60%. The automated checklists ensure nothing falls through the cracks.",
      author: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp Inc."
    },
    {
      quote: "The multi-level approval workflow gives us complete visibility and compliance assurance.",
      author: "Michael Chen",
      role: "Operations Manager",
      company: "Global Solutions"
    },
    {
      quote: "Finally, an employee separation tool that actually works! Clean interface and powerful features.",
      author: "Emily Rodriguez",
      role: "People Operations Lead",
      company: "StartUp Hub"
    },
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: 10,
      period: 'month',
      employees: '10',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 10 employees',
        'Core separation workflows',
        'Basic checklists',
        'Email support',
        'Standard reports',
      ],
      highlighted: false,
      buttonText: 'Get Started',
    },
    {
      name: 'Pro',
      price: 25,
      period: 'month',
      employees: '50',
      description: 'Best for growing organizations',
      features: [
        'Up to 50 employees',
        'Advanced workflows',
        'Custom checklists',
        'Priority support',
        'API access',
        'Advanced analytics',
        'Custom integrations',
      ],
      highlighted: true,
      buttonText: 'Start Free Trial',
    },
    {
      name: 'Enterprise',
      price: 55,
      period: 'month',
      employees: 'Unlimited',
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited employees',
        'Custom workflows',
        'White-label options',
        'Dedicated support',
        'SSO integration',
        'Custom SLA',
        'Onboarding assistance',
        'Priority features',
      ],
      highlighted: false,
      buttonText: 'Contact Sales',
    },
  ];

  const demoScreens = [
    {
      title: 'Dashboard Overview',
      description: 'Get a bird\'s eye view of all ongoing separations, pending tasks, and key metrics at a glance.',
      image: '📊',
      features: ['Real-time status updates', 'Task completion metrics', 'Pending approvals count'],
    },
    {
      title: 'Separation Management',
      description: 'Initiate and manage employee separations with our intuitive interface. Track every step of the process.',
      image: '📋',
      features: ['One-click initiation', 'Auto-assigned checklists', 'Document tracking'],
    },
    {
      title: 'Task Checklists',
      description: 'Role-specific checklists ensure every department completes their responsibilities on time.',
      image: '✅',
      features: ['Department-wise tasks', 'Due date tracking', 'Completion certificates'],
    },
    {
      title: 'Approval Workflow',
      description: 'Multi-level approval process with clear visibility for managers and HR.',
      image: '👥',
      features: ['Manager approvals', 'HR sign-offs', 'Audit trail'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <SuvaduLogo size="sm" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-teal-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-teal-600 transition">How It Works</a>
              <a href="#demo" className="text-gray-600 hover:text-teal-600 transition">Demo</a>
              <a href="#pricing" className="text-gray-600 hover:text-teal-600 transition">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-teal-600 transition">Testimonials</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-teal-600 font-medium transition">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Employee Separation
              <span className="text-teal-600"> Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your offboarding process with intelligent checklists, automated workflows, 
              and real-time tracking. Ensure compliance and smooth transitions every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-teal-600 text-white px-8 py-4 rounded-lg hover:bg-teal-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <a
                href="#demo"
                className="bg-white text-teal-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border-2 border-teal-600"
              >
                Watch Demo
              </a>
            </div>
            <p className="text-gray-500 mt-4">No credit card required • 14-day free trial</p>
          </div>
          
          {/* Hero Image/Mockup */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-100 rounded-lg p-6 min-h-[300px]">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl mb-2">📊</div>
                      <div className="text-sm font-medium text-gray-600">Active Separations</div>
                      <div className="text-2xl font-bold text-teal-600">24</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl mb-2">✅</div>
                      <div className="text-sm font-medium text-gray-600">Completed This Month</div>
                      <div className="text-2xl font-bold text-green-600">18</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl mb-2">⏳</div>
                      <div className="text-sm font-medium text-gray-600">Pending Tasks</div>
                      <div className="text-2xl font-bold text-orange-600">45</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smooth Offboarding
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make employee separation efficient, compliant, and stress-free.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Suvadu Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to transform your employee separation process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="text-5xl font-bold text-teal-100 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See Suvadu in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our intuitive interface and powerful features through an interactive demo.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo Navigation */}
            <div className="space-y-4">
              {demoScreens.map((screen, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDemo(index)}
                  className={`w-full text-left p-6 rounded-xl transition-all ${
                    activeDemo === index
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`text-3xl ${activeDemo === index ? 'opacity-100' : 'opacity-70'}`}>
                      {screen.image}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{screen.title}</h3>
                      <p className={`text-sm ${activeDemo === index ? 'text-teal-100' : 'text-gray-600'}`}>
                        {screen.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Demo Screen Preview */}
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-1 shadow-2xl">
              <div className="bg-white rounded-xl p-8">
                <div className="text-6xl text-center mb-6">{demoScreens[activeDemo].image}</div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  {demoScreens[activeDemo].title}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {demoScreens[activeDemo].description}
                </p>
                <div className="space-y-3">
                  {demoScreens[activeDemo].features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
                  >
                    Try Live Demo →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-12 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              🔐 Demo Login Credentials
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-teal-600 mb-2">HR Admin</div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Email:</span> hr.admin@company.com</p>
                  <p><span className="font-medium">Password:</span> password123</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-teal-600 mb-2">Manager</div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Email:</span> eng.lead@company.com</p>
                  <p><span className="font-medium">Password:</span> password123</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-teal-600 mb-2">Employee</div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Email:</span> employee1@company.com</p>
                  <p><span className="font-medium">Password:</span> password123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your organization. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 transition-all ${
                  plan.highlighted
                    ? 'bg-teal-600 text-white shadow-2xl scale-105'
                    : 'bg-white shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-teal-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      ${plan.price}
                    </span>
                    <span className={`ml-2 ${plan.highlighted ? 'text-teal-100' : 'text-gray-600'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlighted ? 'text-teal-100' : 'text-gray-500'}`}>
                    {plan.employees} employees
                  </p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-teal-200' : 'text-teal-600'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlighted ? 'text-teal-50' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to="/register"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? 'bg-white text-teal-600 hover:bg-gray-100'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-500 mt-8">
            All plans include 14-day free trial • Cancel anytime • No credit card required
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by HR Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers say about transforming their offboarding process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                <div className="text-teal-600 text-4xl mb-4">"</div>
                <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Offboarding Process?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join hundreds of companies using Suvadu to streamline employee separations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-teal-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
            >
              Start Free Trial
            </Link>
            <a
              href="#demo"
              className="bg-transparent text-white px-8 py-4 rounded-lg hover:bg-teal-500 transition font-semibold text-lg border-2 border-white"
            >
              See Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <SuvaduLogo size="sm" />
              <p className="mt-4 text-sm">
                Streamline your employee separation process with intelligent automation.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white transition">Demo</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                <li><a href="/careers" className="hover:text-white transition">Careers</a></li>
                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Suvadu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
