import React from 'react';
import { 
  FaUndo, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaClock, 
  FaBoxOpen, 
  FaTruck, 
  FaCreditCard, 
  FaExchangeAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaShieldAlt,
  FaTimesCircle,
  FaHourglassHalf,
  FaClipboardCheck
} from 'react-icons/fa';

function ReturnPolicyPage() {
  // Refund policy sections data
  const refundSections = [
    {
      id: 1,
      title: "Eligibility for Refunds",
      icon: <FaCheckCircle className="text-2xl" />,
      content: [
        "Refunds will be considered only under the following circumstances:",
        "• Incorrect item delivered (wrong product or wrong quantity)",
        "• Item delivered is damaged, spoiled, or expired at the time of delivery",
        "• Missing items in the delivered order",
        "All issues must be reported at the time of delivery or within the applicable return window mentioned below."
      ]
    },
    {
      id: 2,
      title: "Return & Refund Timeframes",
      icon: <FaClock className="text-2xl" />,
      subsections: [
        {
          title: "Perishable Goods",
          description: "Including meat, vegetables, fresh/frozen food, and dairy products",
          rules: [
            "Must be reported within 24 hours of delivery",
            "Items must be unused and in original condition",
            "No refunds will be processed after 24 hours"
          ]
        },
        {
          title: "Non-Perishable Goods",
          description: "Including household items, detergents, health products, etc.",
          rules: [
            "Must be reported within 5 days of delivery",
            "Items must be unused, unopened, and in original packaging"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Non-Refundable Items",
      icon: <FaTimesCircle className="text-2xl" />,
      content: [
        "Refunds or returns will not be accepted in the following cases:",
        "• Change of mind after delivery",
        "• Items damaged due to improper storage by the customer",
        "• Items reported outside the allowed return period",
        "• Items partially used, opened, or tampered with",
        "• Delivery delays caused by external factors such as weather, holidays, or force majeure"
      ]
    },
    {
      id: 4,
      title: "Refund Method",
      icon: <FaCreditCard className="text-2xl" />,
      content: [
        "• Approved refunds will be processed using the original payment method",
        "• Online payments will be refunded via the same payment gateway used (iPay / bank / card)",
        "• Refund processing may take 7–14 working days, depending on the bank or payment provider",
        "• Cash refunds are not provided unless explicitly approved by SaveMo"
      ]
    },
    {
      id: 5,
      title: "Replacement Policy",
      icon: <FaExchangeAlt className="text-2xl" />,
      content: [
        "Where applicable, SaveMo may offer a replacement instead of a refund, at its sole discretion.",
        "Replacements will be arranged based on product availability."
      ]
    },
    {
      id: 6,
      title: "Order Verification at Delivery",
      icon: <FaClipboardCheck className="text-2xl" />,
      content: [
        "Customers (or the person accepting delivery) are requested to:",
        "• Verify items and quantities at the time of delivery",
        "• Raise any concerns immediately with the delivery personnel",
        "Once delivery is accepted, SaveMo reserves the right to decline refund requests that do not comply with this policy."
      ]
    },
    {
      id: 7,
      title: "Cancellation Policy",
      icon: <FaCalendarAlt className="text-2xl" />,
      content: [
        "• Orders cannot be modified or cancelled once order confirmation is completed",
        "• Refunds for cancelled orders are not guaranteed and will be assessed case-by-case"
      ]
    }
  ];

  return (
    <div className='min-h-screen px-4 sm:px-8 lg:px-12 py-8 bg-primary text-black mt-16 md:mt-20'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section */}
        <div className='text-left mb-12'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='bg-font-secondary text-white p-3 rounded-lg'>
              <FaUndo className="text-3xl md:text-4xl" />
            </div>
            <h1 className='head-text font-bold text-4xl md:text-5xl lg:text-6xl text-font-secondary'>
              Refund & Return Policy
            </h1>
          </div>
          
          {/* Customer Satisfaction Banner */}
          <div className='bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-l-4 border-font-secondary mb-6'>
            <p className='text-lg text-gray-800 font-medium mb-2'>
              At SaveMo, customer satisfaction is important to us.
            </p>
            <p className='text-gray-700 leading-relaxed'>
              This Refund Policy outlines the conditions under which refunds, returns, or replacements may be provided.
              By placing an order on our website, you agree to the terms stated below.
            </p>
          </div>

          {/* Last Updated */}
          <p className='text-sm text-gray-500 mt-4'>
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Grid - Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16'>
          {/* Left Column - Main Refund Policy Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Quick Reference Cards - Timeframes Summary */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div className='bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-100'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                    <span className='text-red-600 text-lg'>🥩</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-800'>Perishable Goods</h3>
                    <p className='text-xs text-gray-600'>Meat, Vegetables, Dairy</p>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-700'>Return Window:</span>
                  <span className='font-bold text-red-600'>24 Hours</span>
                </div>
              </div>
              
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 text-lg'>🧴</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-800'>Non-Perishable Goods</h3>
                    <p className='text-xs text-gray-600'>Household, Detergents, Health</p>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-700'>Return Window:</span>
                  <span className='font-bold text-blue-600'>5 Days</span>
                </div>
              </div>
            </div>

            {/* All Refund Policy Sections */}
            {refundSections.map((section) => (
              <div key={section.id} className='bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='bg-font-secondary text-white p-3 rounded-lg'>
                    {section.icon}
                  </div>
                  <h2 className='text-2xl font-bold text-font-secondary'>
                    {section.id}. {section.title}
                  </h2>
                </div>
                
                {/* Regular content */}
                {section.content && (
                  <div className='space-y-2'>
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className='text-gray-700 leading-relaxed'>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Subsections for Timeframes */}
                {section.subsections && (
                  <div className='space-y-6'>
                    {section.subsections.map((subsection, idx) => (
                      <div key={idx} className='bg-gray-50 p-5 rounded-lg'>
                        <h3 className='font-bold text-gray-800 mb-2 text-lg'>{subsection.title}</h3>
                        <p className='text-sm text-gray-600 mb-3'>{subsection.description}</p>
                        <ul className='space-y-2'>
                          {subsection.rules.map((rule, ruleIdx) => (
                            <li key={ruleIdx} className='flex items-start gap-2 text-gray-700'>
                              <span className='text-font-secondary font-bold mt-1'>•</span>
                              <span className='text-sm'>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column - Sidebar Information */}
          <div className='space-y-8'>
            {/* Contact Us Card - Priority Display */}
            <div className='bg-gradient-to-r from-font-secondary to-font-primary text-white rounded-2xl p-6 shadow-xl'>
              <div className='flex items-center gap-3 mb-4'>
                <FaEnvelope className="text-2xl" />
                <h3 className='text-xl font-bold'>Contact Us</h3>
              </div>
              
              <p className='text-white/90 mb-4 text-sm'>
                For refund or return requests, please contact us with your order number and details:
              </p>
              
              <div className='space-y-3'>
                <div className='flex items-center gap-3 bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors'>
                  <FaEnvelope className="text-lg flex-shrink-0" />
                  <div>
                    <p className='text-xs text-white/80'>Email:</p>
                    <a 
                      href="mailto:savemoshop@gmail.com" 
                      className='font-semibold text-sm hover:underline'
                    >
                      savemoshop@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className='flex items-center gap-3 bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors'>
                  <FaPhone className="text-lg flex-shrink-0" />
                  <div>
                    <p className='text-xs text-white/80'>Phone:</p>
                    <p className='font-semibold text-sm'>077 725 8358</p>
                  </div>
                </div>
                
                <div className='flex items-center gap-3 bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors'>
                  <FaGlobe className="text-lg flex-shrink-0" />
                  <div>
                    <p className='text-xs text-white/80'>Website:</p>
                    <a 
                      href="http://www.savemo.lk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className='font-semibold text-sm hover:underline'
                    >
                      www.savemo.lk
                    </a>
                  </div>
                </div>
              </div>
              
              <div className='mt-4 pt-4 border-t border-white/20'>
                <p className='text-xs text-white/70'>
                  Please have your order number ready when contacting us.
                </p>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className='bg-white rounded-2xl p-6 shadow-xl border border-gray-100'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='bg-font-secondary/10 p-2 rounded-lg'>
                  <FaShieldAlt className="text-font-secondary text-xl" />
                </div>
                <h3 className='text-xl font-bold text-font-secondary'>Quick Summary</h3>
              </div>
              
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <span className='text-green-600 text-xs font-bold'>✓</span>
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800 text-sm'>Eligible for Refund</p>
                    <p className='text-xs text-gray-600'>Wrong/damaged/missing items</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <span className='text-red-600 text-xs font-bold'>✗</span>
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800 text-sm'>Not Eligible</p>
                    <p className='text-xs text-gray-600'>Change of mind, used items, delayed reporting</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <FaHourglassHalf className="text-blue-600 text-xs" />
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800 text-sm'>Processing Time</p>
                    <p className='text-xs text-gray-600'>7-14 working days for refunds</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes Card */}
            <div className='bg-white rounded-2xl p-6 shadow-xl border border-gray-100'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='bg-yellow-50 p-2 rounded-lg'>
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                </div>
                <h3 className='text-lg font-bold text-gray-800'>Important Notes</h3>
              </div>
              
              <div className='space-y-3'>
                <div className='p-3 bg-yellow-50 rounded-lg'>
                  <p className='text-sm font-semibold text-yellow-800 mb-1'>Verify at Delivery</p>
                  <p className='text-xs text-yellow-700'>Check items and quantities immediately upon delivery. Raise concerns right away.</p>
                </div>
                
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm font-semibold text-gray-800 mb-1'>No Cancellations</p>
                  <p className='text-xs text-gray-600'>Orders cannot be modified or cancelled once confirmed.</p>
                </div>
                
                <div className='p-3 bg-purple-50 rounded-lg'>
                  <p className='text-sm font-semibold text-purple-800 mb-1'>Replacement Option</p>
                  <p className='text-xs text-purple-600'>Replacements may be offered instead of refunds, subject to availability.</p>
                </div>
              </div>
            </div>

            {/* Policy Updates Card */}
            <div className='bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-2xl p-6 shadow-xl'>
              <div className='flex items-center gap-3 mb-3'>
                <FaClock className="text-xl" />
                <h3 className='text-lg font-bold'>Policy Updates</h3>
              </div>
              <p className='text-sm text-gray-200 leading-relaxed'>
                SaveMo reserves the right to modify or update this Refund Policy at any time without prior notice. 
                Any changes will be effective once published on the website.
              </p>
              <div className='mt-4 pt-3 border-t border-gray-600'>
                <p className='text-xs text-gray-300'>
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Agreement Note */}
        <div className='mt-8'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <FaUndo className="text-green-600 text-xl" />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800 text-lg mb-1'>Your Acceptance</h4>
                  <p className='text-gray-600'>
                    By placing an order on SaveMo, you acknowledge that you have read, understood, and agree to 
                    be bound by this Refund Policy. We are committed to ensuring your satisfaction with every purchase.
                  </p>
                </div>
              </div>
              <div className='flex gap-4 md:flex-shrink-0'>
                <a href="/terms" className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium'>
                  Terms & Conditions
                </a>
                <a href="/contact" className='px-4 py-2 bg-font-secondary text-white rounded-lg hover:bg-font-alternate transition-colors text-sm font-medium'>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnPolicyPage;