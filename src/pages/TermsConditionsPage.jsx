import React from 'react';
import { 
  FaFileContract, 
  FaLock, 
  FaTruck, 
  FaServer, 
  FaUserSlash, 
  FaCreditCard, 
  FaHeadset, 
  FaCheckCircle, 
  FaUndo, 
  FaGavel, 
  FaBalanceScale,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

function TermsConditionsPage() {
  // Terms sections data for organized display
  const termsSections = [
    {
      id: 1,
      title: "Password and Security",
      icon: <FaLock className="text-2xl" />,
      content: [
        "When you register to use the Site you will be asked to create a password. You must keep this password confidential and must not disclose it or share it with anyone.",
        "You will be responsible for all activities and orders that occur or are submitted under your password.",
        "If you know or suspect that someone else knows your password you should notify us by contacting Customer Services immediately.",
        "You could be held liable for losses incurred by SaveMo or any other party due to someone else using your password.",
        "You may not use anyone else's password at any time without the permission of the password holder."
      ]
    },
    {
      id: 2,
      title: "Delivery",
      icon: <FaTruck className="text-2xl" />,
      content: [
        "We are precluded by law from delivering any meat items on (Full moon) Poya holidays.",
        "Our delivery service may also not be available on certain mercantile holidays in Sri Lanka, which holidays are decided at our discretion.",
        "We deliver only within the cities as identified on the Site.",
        "Upon delivery of the goods, the person accepting the goods ordered must check and validate the ordered items and the quantity provided.",
        "Items delivered as provided herein cannot be returned or exchanged for any reason."
      ]
    },
    {
      id: 3,
      title: "Availability of the Site",
      icon: <FaServer className="text-2xl" />,
      content: [
        "Although we aim to offer you the best service possible, we make no promise that the services at the Site will meet your requirements.",
        "We cannot guarantee that the service will be fault free.",
        "If a fault occurs in the service you should report it to the Customer Services or by email at savemoshop@gmail.com, and we will attempt to correct the fault as soon as we reasonably can."
      ]
    },
    {
      id: 4,
      title: "Our right to suspend or cancel your registration",
      icon: <FaUserSlash className="text-2xl" />,
      content: [
        "We may suspend or cancel your registration immediately at our reasonable discretion or if you breach your obligations under these Terms and Conditions.",
        "You can cancel this agreement at any time by informing us in writing. If you do so, you must stop using the Site.",
        "The suspension or cancellation of your registration and your right to use the Site shall not affect either party's rights or liabilities."
      ]
    },
    {
      id: 5,
      title: "Payments",
      icon: <FaCreditCard className="text-2xl" />,
      content: [
        "Your payments are processed through Secure Payment gateway iPay operated by LOLC Finance.",
        "Your card details will be securely transmitted to the Bank for transaction authorization using SSL 128bit encryption.",
        "All payments will be accepted in US Dollars for orders placed from abroad and Sri Lankan Rupees for orders placed from Sri Lanka based on customer selection."
      ]
    },
    {
      id: 6,
      title: "Customer Service",
      icon: <FaHeadset className="text-2xl" />,
      content: [
        "If you have any queries, please contact us online at www.savemo.lk or via telephone: 0777258358."
      ]
    },
    {
      id: 7,
      title: "Acceptance of Orders",
      icon: <FaCheckCircle className="text-2xl" />,
      content: [
        "Your order is an offer to buy from us. We will send you an order acknowledgement email detailing the products you have ordered.",
        "Nothing that we do or say will amount to any acceptance of your offer until we send you an email notifying you of the order acknowledgment.",
        "At this point, a contract will be made between us for you to buy and us to sell the products that you have ordered from us.",
        "After the time the contract is made, you cannot amend your order."
      ]
    },
    {
      id: 8,
      title: "Grocery Return",
      icon: <FaUndo className="text-2xl" />,
      content: [
        "Perishable goods (e.g. Meat, Vegetables, Fresh Frozen Food & dairy) - within 24 hours.",
        "Non-Perishable goods (e.g. Household, Detergents, Health) - up to 5 days."
      ]
    },
    {
      id: 9,
      title: "Indemnity",
      icon: <FaGavel className="text-2xl" />,
      content: [
        "You agree to defend, indemnify and hold harmless savemo.lk and its affiliates from and against any and all claims, damages, costs and expenses, including attorneys' fees, arising from or related to your use of the Website or any breach by you of these Terms and Conditions and/or the applicable laws."
      ]
    },
    {
      id: 10,
      title: "Legal Compliance",
      icon: <FaBalanceScale className="text-2xl" />,
      content: [
        "You may not access, download, use or export the Site, or the content, software, products or services provided on the Site in violation of any other applicable laws or regulations.",
        "The www.savemo.lk is owned and operated by SaveMo, a business registered in Sri Lanka whose registered office is at No.69, Temple Avenue, Colombo 10, Sri Lanka."
      ]
    }
  ];

  return (
    <div className='min-h-screen px-4 sm:px-8 lg:px-12 py-8 bg-primary text-black mt-16 md:mt-20'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section - Similar to PrivacyPolicyPage */}
        <div className='text-left mb-12'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='bg-font-secondary text-white p-3 rounded-lg'>
              <FaFileContract className="text-3xl md:text-4xl" />
            </div>
            <h1 className='head-text font-bold text-4xl md:text-5xl lg:text-6xl text-font-secondary'>
              Terms & Conditions
            </h1>
          </div>
          
          {/* Welcome and Agreement Banner */}
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-font-secondary mb-6'>
            <p className='text-lg text-gray-800 font-medium mb-2'>
              Welcome to savemo.lk
            </p>
            <p className='text-gray-700 leading-relaxed'>
              This website is provided by SaveMo as a service to our customers. Your use of www.savemo.lk service 
              constitutes your <span className='font-semibold text-font-secondary'>unconditional agreement</span> to follow 
              and be bound by these terms and conditions. You hereby confirm that you have read, understood and 
              accepted all contents.
            </p>
          </div>

          {/* Important Notice - Changes to Terms */}
          <div className='flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
            <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className='font-semibold text-yellow-800 mb-1'>Changes to Terms and Conditions</h3>
              <p className='text-sm text-yellow-700'>
                We reserve the right at our absolute discretion to change the Terms and Conditions from time to time 
                with or without notice to you. Any such changes will take effect when posted on the Website and it is 
                your responsibility to read the Terms and Conditions on each occasion you use this Website. Your 
                continued use of the Website shall signify your comprehension and acceptance to be bound by the latest 
                Terms and Conditions.
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <p className='text-sm text-gray-500 mt-4'>
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Grid - Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16'>
          {/* Left Column - Main Terms Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Links to Other Sites Notice */}
            <div className='bg-white rounded-2xl p-6 shadow-xl border border-gray-100'>
              <div className='flex items-start gap-3'>
                <div className='bg-gray-100 p-2 rounded-lg'>
                  <FaServer className="text-gray-600 text-xl" />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800 mb-2'>Third Party Links</h3>
                  <p className='text-gray-600 text-sm'>
                    This Website may contain links to other sites operated by parties other than www.savemo.lk, 
                    and we are not responsible for the privacy practices or the content of such websites. You 
                    hereby confirm that you are aware of the risks and threats connected with electronic data 
                    transmission.
                  </p>
                </div>
              </div>
            </div>

            {/* All Terms Sections */}
            {termsSections.map((section) => (
              <div key={section.id} className='bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='bg-font-secondary text-white p-3 rounded-lg'>
                    {section.icon}
                  </div>
                  <h2 className='text-2xl font-bold text-font-secondary'>
                    {section.id}. {section.title}
                  </h2>
                </div>
                
                <div className='space-y-3'>
                  {section.content.map((paragraph, idx) => (
                    <div key={idx} className='flex items-start gap-3 text-gray-700'>
                      <span className='text-font-secondary font-bold mt-1'>•</span>
                      <p className='flex-1 leading-relaxed'>{paragraph}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Sidebar Information */}
          <div className='space-y-8'>
            {/* Quick Summary Card */}
            <div className='bg-gradient-to-r from-font-secondary to-font-primary text-white rounded-2xl p-6 shadow-xl'>
              <div className='flex items-center gap-3 mb-4'>
                <FaFileContract className="text-2xl" />
                <h3 className='text-xl font-bold'>Quick Summary</h3>
              </div>
              
              <div className='space-y-4'>
                <div className='flex items-start gap-3 bg-white/10 p-3 rounded-lg'>
                  <span className='text-lg'>🔐</span>
                  <div>
                    <p className='font-semibold text-sm'>Password Security</p>
                    <p className='text-xs text-white/80'>Keep your password confidential</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3 bg-white/10 p-3 rounded-lg'>
                  <span className='text-lg'>🚚</span>
                  <div>
                    <p className='font-semibold text-sm'>Delivery</p>
                    <p className='text-xs text-white/80'>No deliveries on Poya days</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3 bg-white/10 p-3 rounded-lg'>
                  <span className='text-lg'>💳</span>
                  <div>
                    <p className='font-semibold text-sm'>Secure Payments</p>
                    <p className='text-xs text-white/80'>SSL 128bit encryption via iPay</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-3 bg-white/10 p-3 rounded-lg'>
                  <span className='text-lg'>🔄</span>
                  <div>
                    <p className='font-semibold text-sm'>Returns</p>
                    <p className='text-xs text-white/80'>Perishable: 24h | Non-perishable: 5 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Service Card */}
            <div className='bg-white rounded-2xl p-6 shadow-xl border border-gray-100'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='bg-font-secondary/10 p-2 rounded-lg'>
                  <FaHeadset className="text-font-secondary text-xl" />
                </div>
                <h3 className='text-xl font-bold text-font-secondary'>Customer Service</h3>
              </div>
              
              <div className='space-y-4'>
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <FaPhone className="text-font-secondary text-sm" />
                  <div>
                    <p className='text-xs text-gray-500'>Call Us</p>
                    <p className='font-semibold text-gray-800'>0777 258 358</p>
                  </div>
                </div>
                
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <FaEnvelope className="text-font-secondary text-sm" />
                  <div>
                    <p className='text-xs text-gray-500'>Email Us</p>
                    <a href="mailto:savemoshop@gmail.com" className='font-semibold text-font-secondary hover:underline'>
                      savemoshop@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <FaMapMarkerAlt className="text-font-secondary text-sm" />
                  <div>
                    <p className='text-xs text-gray-500'>Registered Office</p>
                    <p className='text-sm text-gray-800'>No.69, Temple Avenue, Colombo 10, Sri Lanka</p>
                  </div>
                </div>
              </div>
              
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <a 
                  href="/contact-us" 
                  className='text-font-secondary hover:text-font-alternate font-medium text-sm flex items-center gap-2 transition-colors'
                >
                  Contact Customer Support →
                </a>
              </div>
            </div>

            {/* Important Information Card */}
            <div className='bg-white rounded-2xl p-6 shadow-xl border border-gray-100'>
              <h3 className='text-lg font-bold text-font-secondary mb-4 flex items-center gap-2'>
                <FaExclamationTriangle className="text-yellow-500" />
                Important Information
              </h3>
              
              <div className='space-y-3'>
                <div className='p-3 bg-red-50 rounded-lg'>
                  <p className='text-sm font-semibold text-red-800 mb-1'>No Returns on Delivery</p>
                  <p className='text-xs text-red-600'>Items delivered cannot be returned or exchanged for any reason</p>
                </div>
                
                <div className='p-3 bg-blue-50 rounded-lg'>
                  <p className='text-sm font-semibold text-blue-800 mb-1'>Order Acceptance</p>
                  <p className='text-xs text-blue-600'>Contract is formed only after order acknowledgment email</p>
                </div>
                
                <div className='p-3 bg-purple-50 rounded-lg'>
                  <p className='text-sm font-semibold text-purple-800 mb-1'>Legal Compliance</p>
                  <p className='text-xs text-purple-600'>Registered business in Sri Lanka</p>
                </div>
              </div>
            </div>

            {/* Indemnity Notice Card */}
            <div className='bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-2xl p-6 shadow-xl'>
              <div className='flex items-center gap-3 mb-3'>
                <FaGavel className="text-xl" />
                <h3 className='text-lg font-bold'>Indemnity</h3>
              </div>
              <p className='text-sm text-gray-200 leading-relaxed'>
                You agree to defend, indemnify and hold harmless savemo.lk and its affiliates from and against any 
                and all claims, damages, costs and expenses, including attorneys' fees, arising from or related to 
                your use of the Website or any breach by you of these Terms and Conditions and/or the applicable laws.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Agreement Note */}
        <div className='mt-8'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-green-600 text-2xl'>✓</span>
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800 text-lg mb-1'>Your Agreement</h4>
                  <p className='text-gray-600'>
                    By using www.savemo.lk, you confirm that you have read, understood, and agree to be bound by 
                    these Terms and Conditions. The website is owned and operated by SaveMo, registered in Sri Lanka.
                  </p>
                </div>
              </div>
              <div className='flex gap-4 md:flex-shrink-0'>
                <a href="/privacy" className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium'>
                  Privacy Policy
                </a>
                <a href="/contact-us" className='px-4 py-2 bg-font-secondary text-white rounded-lg hover:bg-font-alternate transition-colors text-sm font-medium'>
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditionsPage;