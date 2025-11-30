import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SuvaduLogo from '../components/common/SuvaduLogo';

// Razorpay Payment Links - Replace these with your actual payment links from Razorpay Dashboard
const RAZORPAY_PAYMENT_LINKS = {
  basic: 'https://rzp.io/rzp/suvadu-basic',      // Replace with your Basic plan payment link
  pro: 'https://rzp.io/rzp/suvadu-pro',          // Replace with your Pro plan payment link
  enterprise: 'https://rzp.io/rzp/suvadu-enterprise', // Replace with your Enterprise plan payment link
};

interface Plan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  employees: number;
  features: string[];
  paymentLink: string;
}

const PricingPage: React.FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      amount: 1000,
      currency: 'INR',
      description: 'Basic Plan - Up to 10 employees',
      employees: 10,
      features: ['Core separation workflows', 'Basic checklists', 'Email support', 'Standard reports'],
      paymentLink: RAZORPAY_PAYMENT_LINKS.basic,
    },
    {
      id: 'pro',
      name: 'Pro',
      amount: 2500,
      currency: 'INR',
      description: 'Pro Plan - Up to 50 employees',
      employees: 50,
      features: ['Advanced workflows', 'Custom checklists', 'Priority support', 'API access', 'Advanced analytics', 'Custom integrations'],
      paymentLink: RAZORPAY_PAYMENT_LINKS.pro,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      amount: 5500,
      currency: 'INR',
      description: 'Enterprise Plan - Unlimited employees',
      employees: -1,
      features: ['Custom workflows', 'White-label options', 'Dedicated support', 'SSO integration', 'Custom SLA', 'Onboarding assistance'],
      paymentLink: RAZORPAY_PAYMENT_LINKS.enterprise,
    },
  ];

  const handleSubscribe = (plan: Plan) => {
    // Open Razorpay payment link in new tab
    window.open(plan.paymentLink, '_blank');
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <SuvaduLogo size="sm" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-teal-600 font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Choose the plan that fits your organization. No hidden fees, cancel anytime.
          </p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isPopular = plan.id === 'pro';
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all ${
                  isPopular
                    ? 'bg-teal-600 text-white shadow-2xl scale-105 z-10'
                    : 'bg-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className={`text-5xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(plan.amount, plan.currency)}
                    </span>
                    <span className={`ml-2 ${isPopular ? 'text-teal-100' : 'text-gray-600'}`}>
                      /month
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${isPopular ? 'text-teal-100' : 'text-gray-500'}`}>
                    {plan.employees === -1 ? 'Unlimited' : `Up to ${plan.employees}`} employees
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${isPopular ? 'text-teal-200' : 'text-teal-600'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={isPopular ? 'text-teal-50' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition ${
                    isPopular
                      ? 'bg-white text-teal-600 hover:bg-gray-100'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  Start Free Trial
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Can I switch plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit/debit cards, UPI, net banking, and popular wallets through Razorpay.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-600">
                You can cancel anytime from your account settings. Your subscription will remain active until the end of the billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">Secure payments powered by</p>
          <div className="flex items-center justify-center space-x-8">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <span className="font-bold text-blue-600">Razorpay</span>
            </div>
            <div className="flex items-center text-gray-400">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Suvadu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
