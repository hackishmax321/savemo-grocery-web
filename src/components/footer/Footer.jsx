import React from 'react'

function Footer() {
  return (
    <footer className=" bg-secondary/80 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo/Brand Column */}
          <div className="flex flex-col items-center md:items-start">
            {/* FIGURE SECTION - Add your logo/image here */}
            <figure className="mb-6">
              <img 
                src="/logo-white.svg" // Replace with your logo
                alt="ShopSphere Logo" 
                className="h-12 w-auto"
              />
              <figcaption className="text-center md:text-left text-sm text-white/80 mt-2">
                Premium Shopping Experience
              </figcaption>
            </figure>
            
            <p className="text-white/90 mb-6 max-w-xs text-center md:text-left">
              Your one-stop destination for all shopping needs. Quality products with exceptional service.
            </p>
            
            <div className="flex space-x-4">
              {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                <a 
                  key={social}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
                  aria-label={`Follow us on ${social}`}
                >
                  <span className="text-lg">
                    {social === 'twitter' && '𝕏'}
                    {social === 'facebook' && 'f'}
                    {social === 'instagram' && '📷'}
                    {social === 'linkedin' && 'in'}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2 w-full text-center md:text-left">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {['Home', 'Products', 'Best Sellers', 'New Arrivals', 'Deals'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-white/80 hover:text-white hover:underline transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    {link}
                  </a>
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
              Stay Updated
            </h3>
            <p className="text-white/90 mb-4 text-center md:text-left">
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            
            <form className="w-full">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-secondary hover:bg-white/90 font-semibold rounded-lg transition-colors duration-300 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
            </form>
            
            {/* Payment Methods FIGURE */}
            <div className="mt-8">
              <figure className="text-center md:text-left">
                <figcaption className="text-sm text-white/80 mb-3">
                  Secure Payment Methods
                </figcaption>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {['💳', '🛡️', '📱', '💰'].map((icon, index) => (
                    <span key={index} className="text-2xl bg-white/10 p-2 rounded-lg">
                      {icon}
                    </span>
                  ))}
                </div>
              </figure>
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
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Return Policy'].map((link) => (
                <a 
                  key={link}
                  href="#" 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer