import React, { useState } from 'react'
import { routes } from '../../constants/Routes'
import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import contactService from '../../services/Contact.service';

function Footer() {
  const [footerForm, setFooterForm] = useState({
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleFooterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    // Prepare contact data with fixed values for required fields
    const contactData = {
      name: "Newsletter Subscriber", // Fixed value
      email: footerForm.email,
      phone: "", // Empty as not required
      subject: "Newsletter/Contact from Footer", // Fixed subject
      message: footerForm.message || `Newsletter subscription request from ${footerForm.email}`
    };

    try {
      // Use contact service to save to database
      const result = await contactService.submitContactMessage(contactData);
      
      if (result.success) {
        setSubmitSuccess(true);
        setFooterForm({ email: '', message: '' });
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setSubmitError(result.error || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting footer contact:', error);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFooterInputChange = (e) => {
    setFooterForm({
      ...footerForm,
      [e.target.name]: e.target.value
    });
    if (submitError) setSubmitError('');
  };

  return (
    <footer className=" bg-secondary/80 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo/Brand Column */}
          <div className="flex flex-col items-center md:items-start">
            {/* FIGURE SECTION - Add your logo/image here */}
            <figure className="mb-6">
              <img 
                src="/logo/logo-main.png" // Replace with your logo
                alt="ShopSphere Logo" 
                className="h-25 w-auto"
              />
              <figcaption className="text-center md:text-left text-sm text-white/80 mt-2">
                Save more & Get more
              </figcaption>
            </figure>
            
            

            <p className="text-white/90 mb-4 text-center md:text-left">
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            
            <form className="w-full" onSubmit={handleFooterSubmit}>
              {submitSuccess && (
                <div className="mb-3 p-2 bg-green-500/20 text-green-100 text-sm rounded">
                  ✓ Message sent successfully!
                </div>
              )}
              
              {submitError && (
                <div className="mb-3 p-2 bg-red-500/20 text-red-100 text-sm rounded">
                  {submitError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  name="email"
                  value={footerForm.email}
                  onChange={handleFooterInputChange}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-white text-secondary font-semibold rounded-lg transition-colors duration-300 whitespace-nowrap ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white/90'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Subscribe'}
                </button>
              </div>
              <div className="mt-3">
                <textarea 
                  name="message"
                  value={footerForm.message}
                  onChange={handleFooterInputChange}
                  rows={3}
                  placeholder="Your messages"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 resize-y"
                />
              </div>
            </form>
            
            
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2 w-full text-center md:text-left">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {routes.map(({name, path}, index) => (
                <li key={index}>
                  <Link 
                    to={path} 
                    className="text-white/80 hover:text-white hover:underline transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2 w-full text-center md:text-left">
              Shop By Category
            </h3>
            <ul className="space-y-3">
              {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Books'].map((category) => (
                <li key={category}>
                  <a 
                    href="#" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2 w-full text-center md:text-left">
              Stay Updated Follow us
            </h3>
            <p className="text-white/90 mb-6 max-w-xs text-center md:text-left">
              Your one-stop destination for all shopping needs. Quality products with exceptional service.
            </p>
            
            
            
            {/* Payment Methods FIGURE */}
            <div className="flex space-x-4">
              {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                <a 
                  key={social}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
                  aria-label={`Follow us on ${social}`}
                >
                  <span className="text-lg">
                    {social === 'twitter' && <FaTwitter/>}
                    {social === 'facebook' && <FaFacebook/>}
                    {social === 'instagram' && <FaInstagram/>}
                    {social === 'linkedin' && <FaLinkedin/>}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/70 text-sm text-center md:text-left">
              © {new Date().getFullYear()} ShopSphere. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                { label: 'Privacy Policy', path: '/policy' },
                { label: 'Terms of Service', path: '/terms' },
                // { label: 'Cookie Policy', path: '/cookie-policy' }, 
                { label: 'Return Policy', path: '/return' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer