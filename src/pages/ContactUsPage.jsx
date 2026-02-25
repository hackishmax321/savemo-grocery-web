import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaTwitter, FaPaperPlane, FaLinkedin } from 'react-icons/fa';
import MapWrapper from '../components/maps/MapWrapper';
import contactService from '../services/Contact.service';

function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (submitError) setSubmitError('');  
  };

  const handleSubmit = async (e) => { // CHANGED: Make async
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(''); // Clear previous errors
    
    // Validate form data
    const validation = contactService.validateContactData(formData);
    if (!validation.isValid) {
      setSubmitError(Object.values(validation.errors)[0]);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Submit to Firestore using contact service
      const result = await contactService.submitContactMessage(formData);
      
      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        setSubmitError(result.error || 'Failed to submit message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const contactInfo = [
    {
      icon: <FaPhone className="text-xl" />,
      title: 'Call Us',
      details: ['+94 777 258 358'],
      description: 'Available 7:00 AM - 10:00 PM daily'
    },
    {
      icon: <FaEnvelope className="text-xl" />,
      title: 'Email Us',
      details: ['savemoshop@gmail.com'],
      description: 'We respond within 24 hours'
    },
    {
      icon: <FaMapMarkerAlt className="text-xl" />,
      title: 'Visit Us',
      details: ['No.69, Temple Avenue, Colombo 10, Sri Lanka'],
      description: 'Four convenient locations'
    },
    {
      icon: <FaClock className="text-xl" />,
      title: 'Business Hours',
      details: ['Monday - Friday: 7:00 AM - 10:00 PM', 'Saturday - Sunday: 8:00 AM - 10:00 PM'],
      description: 'Extended hours on weekends'
    }
  ];

  const socialMedia = [
    { icon: <FaFacebook />, name: 'Facebook', url: '#', color: 'bg-blue-600' },
    { icon: <FaInstagram />, name: 'Instagram', url: '#', color: 'bg-pink-600' },
  ];

  const frequentlyAsked = [
    {
      question: 'What are your delivery areas?',
      answer: 'We deliver across the Western Province. Free delivery for orders above Rs. 5000.'
    },
    {
      question: 'How can I track my order?',
      answer: 'You will receive a tracking link via SMS and email once your order is dispatched.'
    },
    {
      question: 'Do you accept returns?',
      answer: 'Yes, we accept returns within 7 days of purchase for unopened and non-perishable items.'
    },
    {
      question: 'Are your products locally sourced?',
      answer: 'Over 70% of our products are sourced directly from local farmers and producers.'
    }
  ];

  return (
    <div className='min-h-screen px-4 sm:px-8 lg:px-12 py-8 bg-primary text-black mt-16 md:mt-20'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-left mb-12'>
          <h1 className='head-text font-bold text-4xl md:text-5xl lg:text-6xl text-font-secondary mb-4'>
            Contact SaveMo
          </h1>
          <p className='text-lg text-left md:text-xl text-gray-700 max-w-3xl'>
            Get in touch with Sri Lanka's leading grocery network. We're here to help with your questions, 
            feedback, and grocery needs.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
          {contactInfo.map((info, index) => (
            <div 
              key={index} 
              className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100'
            >
              <div className='flex items-center gap-4 mb-4'>
                <div className='bg-font-secondary text-white p-3 rounded-lg'>
                  {info.icon}
                </div>
                <h3 className='text-xl font-bold text-font-secondary'>{info.title}</h3>
              </div>
              <div className='space-y-2'>
                {info.details.map((detail, idx) => (
                  <p key={idx} className='text-gray-700'>{detail}</p>
                ))}
              </div>
              <p className='text-sm text-gray-500 mt-4'>{info.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid - Form and Map */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
          {/* Contact Form */}
          <div className='bg-white rounded-2xl p-8 shadow-xl'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='bg-font-secondary text-white p-2 rounded-lg'>
                <FaPaperPlane className="text-2xl" />
              </div>
              <h2 className='text-2xl font-bold text-font-secondary'>Send Us a Message</h2>
            </div>
            
            {submitSuccess && (
              <div className='mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200'>
                <p className='font-semibold'>Thank you for contacting us!</p>
                <p className='text-sm'>We'll get back to you within 24 hours.</p>
              </div>
            )}

            {submitError && (
              <div className='mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200'>
                <p className='font-semibold'>Submission Error</p>
                <p className='text-sm'>{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Full Name *
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-font-secondary focus:ring-2 focus:ring-font-secondary/20 outline-none transition-colors'
                    placeholder='Your Name'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email Address *
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-font-secondary focus:ring-2 focus:ring-font-secondary/20 outline-none transition-colors'
                    placeholder='xxx@example.com'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-font-secondary focus:ring-2 focus:ring-font-secondary/20 outline-none transition-colors'
                    placeholder='+94 77 xxx xxxx'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Subject *
                  </label>
                  <select
                    name='subject'
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-font-secondary focus:ring-2 focus:ring-font-secondary/20 outline-none transition-colors'
                  >
                    <option value=''>Select a subject</option>
                    <option value='general'>General Inquiry</option>
                    <option value='order'>Order Support</option>
                    <option value='delivery'>Delivery Inquiry</option>
                    <option value='feedback'>Feedback & Suggestions</option>
                    <option value='wholesale'>Wholesale Inquiry</option>
                    <option value='career'>Career Opportunities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Your Message *
                </label>
                <textarea
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-font-secondary focus:ring-2 focus:ring-font-secondary/20 outline-none transition-colors resize-none'
                  placeholder='Please type your message here...'
                />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg text-white font-semibold transition-all duration-300 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-font-secondary hover:bg-font-alternate transform hover:-translate-y-1'
                }`}
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Map and Social Media */}
          <div className='space-y-8'>
            {/* Map */}
            <div className='bg-white rounded-2xl p-6 shadow-xl'>
              <h3 className='text-2xl font-bold text-font-secondary mb-6'>Our Locations</h3>
              <div className='rounded-xl overflow-hidden h-80 bg-gray-100'>
                {/* Replace with your Google Map component */}
                <MapWrapper />
                <div className='w-full h-full '>
                  <div className='text-center'>
                    <FaMapMarkerAlt className='text-4xl text-font-secondary mx-auto mb-4' />
                    <p className='text-gray-600 mb-2'>Interactive Map</p>
                    <p className='text-sm text-gray-500'>4 branches in Western Province</p>
                  </div>
                </div>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-2'>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-sm font-semibold text-gray-700'>Wattala Branch</p>
                  <p className='text-xs text-gray-500'>123 Galle Road</p>
                </div>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-sm font-semibold text-gray-700'>Colombo 10 Branch</p>
                  <p className='text-xs text-gray-500'>456 Maradana Road</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className='bg-gradient-to-r from-font-secondary to-font-primary text-white rounded-2xl p-6 shadow-xl'>
              <h3 className='text-2xl font-bold mb-6'>Connect With Us</h3>
              <p className='mb-6 text-white/90'>
                Follow us on social media for the latest updates, promotions, and healthy living tips.
              </p>
              <div className='flex gap-4'>
                {[
                                { name: 'facebook', link: 'https://fb.com/savemodeals', icon: FaFacebook },
                                { name: 'instagram', link: 'https://www.instagram.com/_savemo_', icon: FaInstagram }
                              ].map((social) => (
                                <a 
                                  key={social.name}
                                  href={social.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
                                  aria-label={`Follow us on ${social.name}`}
                                >
                                  <span className="text-lg">
                                    <social.icon />
                                  </span>
                                </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default ContactUsPage;