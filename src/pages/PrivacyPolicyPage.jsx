import React from 'react';
import { FaShieldAlt, FaUserSecret, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen px-4 sm:px-8 lg:px-12 py-8 bg-primary text-black mt-16 md:mt-20'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section - Similar to ContactUsPage */}
        <div className='text-left mb-12'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='bg-font-secondary text-white p-3 rounded-lg'>
              <FaShieldAlt className="text-3xl md:text-4xl" />
            </div>
            <h1 className='head-text font-bold text-4xl md:text-5xl lg:text-6xl text-font-secondary'>
              Privacy Policy
            </h1>
          </div>
          <p className='text-lg text-left md:text-xl text-gray-700 max-w-4xl'>
            At SaveMo, we understand that you care about your privacy and the protection of your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
          </p>
          <p className='text-sm text-gray-500 mt-4'>
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Grid - Two Column Layout Similar to Contact Form */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16'>
          {/* Left Column - Main Privacy Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Personal Data Section */}
            <div className='bg-white rounded-2xl p-8 shadow-xl'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-font-secondary text-white p-2 rounded-lg'>
                  <FaUserSecret className="text-2xl" />
                </div>
                <h2 className='text-2xl font-bold text-font-secondary'>Personal Data</h2>
              </div>
              
              <div className='space-y-4 text-gray-700 leading-relaxed'>
                <p>
                  All personal data collected by <span className='font-semibold text-font-secondary'>SaveMo Online Stores</span> (hereinafter referred to as "SaveMo") 
                  in connection with the services we offer is controlled by SaveMo as the data controller. Personal data means any 
                  information that can be used to identify a specific individual directly or indirectly.
                </p>
                
                <div className='bg-blue-50 p-6 rounded-lg border-l-4 border-font-secondary'>
                  <p className='font-medium text-gray-800'>
                    You may be asked to provide your personal data when you are in contact with us. You are not required to 
                    provide us the personal data that we request, but if you decide not to do so, we may not be able to provide 
                    you with a high quality service or respond to any queries you may have.
                  </p>
                </div>
                
                <p>
                  SaveMo will keep your personal data for as long as required for the said purpose. Your data may also be retained 
                  so that we can continue to provide you a better service by improving your overall experience.
                </p>
                
                <p>
                  This Privacy Notice also applies to <span className='font-semibold'>SaveMo's marketing content</span> which includes offers, promotions and 
                  advertisements for our various products and services.
                </p>
              </div>
            </div>

            {/* Personal Data Usage Section */}
            <div className='bg-white rounded-2xl p-8 shadow-xl'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-font-secondary text-white p-2 rounded-lg'>
                  <FaShieldAlt className="text-2xl" />
                </div>
                <h2 className='text-2xl font-bold text-font-secondary'>Personal Data Usage</h2>
              </div>
              
              <p className='text-gray-700 mb-6'>
                SaveMo collects, stores and utilises your personal data for the following purposes:
              </p>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {[
                  {
                    title: 'Processing of payments',
                    description: 'when you make a payment for a service provided by SaveMo'
                  },
                  {
                    title: 'Status updates',
                    description: 'to provide you with the status of your orders etc.'
                  },
                  {
                    title: 'Enquiries/complaints',
                    description: 'to handle and reply to your enquiries, requests and complaints'
                  },
                  {
                    title: 'Products/Services',
                    description: 'to develop and improve our products, services, communication methods and the functionality of our website'
                  },
                  {
                    title: 'Communication',
                    description: 'to communicate information to you via traditional mail, email or SMS'
                  },
                  {
                    title: 'Verification',
                    description: 'to verify the identity of individuals contacting us by telephone or email'
                  },
                  {
                    title: 'Training',
                    description: 'for internal training and quality assurance purposes'
                  },
                  {
                    title: 'Customer needs',
                    description: 'To better understand and assess the changing needs, interests of customers so that we can improve our website, our current products and services, and/or develop new products and services'
                  },
                  {
                    title: 'Newsletter',
                    description: 'to manage your registration and/or subscription to our newsletter'
                  }
                ].map((item, index) => (
                  <div key={index} className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300'>
                    <div className='flex-shrink-0 w-6 h-6 bg-font-secondary/20 rounded-full flex items-center justify-center mt-0.5'>
                      <span className='text-font-secondary text-xs font-bold'>{index + 1}</span>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-1'>{item.title}</h4>
                      <p className='text-sm text-gray-600'>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protecting Your Personal Data Section */}
            <div className='bg-white rounded-2xl p-8 shadow-xl'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-font-secondary text-white p-2 rounded-lg'>
                  <FaLock className="text-2xl" />
                </div>
                <h2 className='text-2xl font-bold text-font-secondary'>Protecting your Personal Data</h2>
              </div>
              
              <div className='bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-4'>
                <p className='text-gray-800 font-medium mb-3'>
                  At SaveMo, we believe the security of your personal data is of utmost importance.
                </p>
                <p className='text-gray-700'>
                  By using the latest technologies and tools at our disposal, we make all possible efforts to protect your 
                  personal data from misuse, interference, loss, unauthorized access, modification or disclosure.
                </p>
              </div>
              
              <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                  <span className='text-green-600 text-xl'>✓</span>
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800'>Limited Access</h4>
                  <p className='text-sm text-gray-600'>
                    Only a carefully selected group of SaveMo employees will have access to your personal data at any given time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Information & Summary */}
          <div className='space-y-8'>
            {/* Quick Contact Card - Similar to Social Media Card in ContactUsPage */}
            <div className='bg-gradient-to-r from-font-secondary to-font-primary text-white rounded-2xl p-6 shadow-xl'>
              <div className='flex items-center gap-3 mb-4'>
                <FaEnvelope className="text-2xl" />
                <h3 className='text-xl font-bold'>Further Information</h3>
              </div>
              
              <p className='text-white/90 mb-6'>
                If you have any questions or concerns about SaveMo's Privacy Notice, please reach out to us:
              </p>
              
              <div className='space-y-4'>
                <div className='flex items-center gap-3 bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors'>
                  <FaEnvelope className="text-lg flex-shrink-0" />
                  <div>
                    <p className='text-sm text-white/80'>Email us at:</p>
                    <a 
                      href="mailto:savemoshop@gmail.com" 
                      className='font-semibold hover:underline'
                    >
                      savemoshop@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className='flex items-center gap-3 bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors'>
                  <FaPaperPlane className="text-lg flex-shrink-0" />
                  <div>
                    <p className='text-sm text-white/80'>Or submit a request through:</p>
                    <a 
                      href="/contact" 
                      className='font-semibold hover:underline'
                    >
                      Contact Us Form
                    </a>
                  </div>
                </div>
              </div>
              
              <div className='mt-6 pt-4 border-t border-white/20'>
                <p className='text-sm text-white/70'>
                  We typically respond within 24-48 hours
                </p>
              </div>
            </div>

            {/* Summary Card - Similar to Map Card */}
            <div className='bg-white rounded-2xl p-6 shadow-xl'>
              <h3 className='text-xl font-bold text-font-secondary mb-4 flex items-center gap-2'>
                <FaShieldAlt className="text-font-secondary" />
                Privacy Commitment
              </h3>
              
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-green-600 text-sm font-bold'>✓</span>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-800 mb-1'>Data Controller</h4>
                    <p className='text-sm text-gray-600'>SaveMo controls all personal data collected through our services</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-blue-600 text-sm font-bold'>⏱️</span>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-800 mb-1'>Data Retention</h4>
                    <p className='text-sm text-gray-600'>We keep your data only as long as needed for the stated purposes</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-purple-600 text-sm font-bold'>🔒</span>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-800 mb-1'>Security</h4>
                    <p className='text-sm text-gray-600'>Latest technologies protect your data from unauthorized access</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-yellow-600 text-sm font-bold'>👥</span>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-800 mb-1'>Limited Access</h4>
                    <p className='text-sm text-gray-600'>Only selected employees have access to your information</p>
                  </div>
                </div>
              </div>
              
              <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500 italic'>
                  This Privacy Policy applies to all SaveMo services, marketing content, offers, promotions and advertisements.
                </p>
              </div>
            </div>

            {/* Contact Info Card - Similar to Location Card */}
            <div className='bg-white rounded-2xl p-6 shadow-xl border border-gray-100'>
              <div className='flex items-center gap-3 mb-4'>
                <FaPhone className="text-font-secondary text-xl" />
                <h3 className='text-lg font-bold text-font-secondary'>Need Immediate Help?</h3>
              </div>
              
              <p className='text-gray-600 text-sm mb-4'>
                Our customer support team is available 7:00 AM - 10:00 PM daily
              </p>
              
              <div className='space-y-2'>
                <div className='flex items-center gap-3 text-gray-700'>
                  <FaPhone className="text-sm text-gray-500" />
                  <span>+94 777 258 358</span>
                </div>
                <div className='flex items-center gap-3 text-gray-700'>
                  <FaEnvelope className="text-sm text-gray-500" />
                  <span>savemoshop@gmail.com</span>
                </div>
                <div className='flex items-center gap-3 text-gray-700'>
                  <FaMapMarkerAlt className="text-sm text-gray-500" />
                  <span>No.69, Temple Avenue, Colombo 10, Sri Lanka</span>
                </div>
              </div>
              
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <a 
                  href="/contact" 
                  className='text-font-secondary hover:text-font-alternate font-medium text-sm flex items-center gap-2 transition-colors'
                >
                  <FaPaperPlane className="text-xs" />
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note - Similar to Contact Cards Grid but single card */}
        <div className='mt-8'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <FaShieldAlt className="text-font-secondary text-2xl" />
                <div>
                  <h4 className='font-semibold text-gray-800'>Your Privacy Matters</h4>
                  <p className='text-sm text-gray-600'>
                    SaveMo is committed to protecting your personal data and respecting your privacy.
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <a href="/terms" className='text-sm text-font-secondary hover:underline'>Terms of Service</a>
                <span className='text-gray-400'>|</span>
                <a href="/cookies" className='text-sm text-font-secondary hover:underline'>Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;