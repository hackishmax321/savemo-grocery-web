import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const carouselSlides = [
  {
    id: 1,
    image: '/banners/ban1.jpg',
    title: 'Welcome to Our Marketplace',
    description: 'Discover amazing items from trusted sellers',
    buttonText: 'Shop Now',
    overlayPosition: 'bottom-right',
  },
  {
    id: 2,
    image: '/banners/ban2.jpg',
    title: 'Summer Collection 2024',
    description: 'Hot deals up to 50% off',
    buttonText: 'Explore Deals',
    overlayPosition: 'bottom-right',
  },
];

// Enhanced Custom Arrow Components with better styling
const PrevArrow = ({ onClick, currentSlide }) => {
  return (
    <button
      onClick={onClick}
      className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-20 
                 bg-white/90 hover:bg-white text-gray-800 rounded-full 
                 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 
                 flex items-center justify-center 
                 shadow-lg hover:shadow-xl 
                 transition-all duration-300 hover:scale-110 
                 focus:outline-none focus:ring-2 focus:ring-white/50
                 opacity-70 hover:opacity-100
                 border-2 border-white/30"
      aria-label="Previous slide"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

const NextArrow = ({ onClick, currentSlide, slideCount }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-20 
                 bg-white/90 hover:bg-white text-gray-800 rounded-full 
                 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 
                 flex items-center justify-center 
                 shadow-lg hover:shadow-xl 
                 transition-all duration-300 hover:scale-110 
                 focus:outline-none focus:ring-2 focus:ring-white/50
                 opacity-70 hover:opacity-100
                 border-2 border-white/30"
      aria-label="Next slide"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

const GlassOverlay = ({ title, description, buttonText, position = 'bottom-left' }) => {
  const positionClasses = {
    'bottom-left': 'left-4 sm:left-6 bottom-4 sm:bottom-6 text-left',
    'bottom-center': 'left-1/2 transform -translate-x-1/2 bottom-4 sm:bottom-6 text-center',
    'bottom-right': 'right-4 sm:right-6 bottom-4 sm:bottom-6 text-right'
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-10 max-w-xs sm:max-w-sm md:max-w-md`}>
      <div className="bg-black/30 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20 shadow-2xl">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 md:mb-3">{title}</h2>
        <p className="text-white/90 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base lg:text-lg">{description}</p>
        {buttonText && (
          <button className="bg-white text-gray-900 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 text-xs sm:text-sm md:text-base">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

const HomeCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    fade: false,
    adaptiveHeight: true,
    prevArrow: <PrevArrow currentSlide={currentSlide} />,
    nextArrow: <NextArrow currentSlide={currentSlide} slideCount={carouselSlides.length} />,
    beforeChange: (oldIndex, newIndex) => {
      setCurrentSlide(newIndex);
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
        }
      }
    ],
    appendDots: dots => (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <ul className="flex space-x-2 md:space-x-3">{dots}</ul>
      </div>
    ),
    customPaging: i => (
      <div 
        className={`transition-all duration-300 cursor-pointer ${
          i === currentSlide 
            ? 'w-4 md:w-8 h-2 md:h-3 bg-white rounded-full' 
            : 'w-2 h-2 md:w-3 md:h-3 bg-white/50 hover:bg-white/80 rounded-full'
        }`} 
      />
    ),
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        sliderRef.current?.slickPrev();
      } else if (e.key === 'ArrowRight') {
        sliderRef.current?.slickNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="relative w-full overflow-hidden bg-gray-100"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Slider ref={sliderRef} {...settings}>
        {carouselSlides.map((slide) => (
          <div key={slide.id} className="relative outline-none">
            {/* Image Container */}
            <div className="relative w-full flex justify-center items-center">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-auto max-h-[600px] object-contain"
                style={{
                  maxHeight: '80vh',
                }}
                onError={(e) => {
                  e.target.src = '/fallback-image.jpg';
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0  pointer-events-none"></div>
              
              {/* Glass Overlay Container */}
              {/* <GlassOverlay
                title={slide.title}
                description={slide.description}
                buttonText={slide.buttonText}
                position={slide.overlayPosition}
              /> */}
            </div>
          </div>
        ))}
      </Slider>
      
      {/* Navigation hint - appears on hover */}
      <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 
                      transition-opacity duration-300 
                      ${isHovering ? 'opacity-100' : 'opacity-0'}
                      bg-black/60 text-white text-xs px-3 py-1.5 rounded-full 
                      pointer-events-none backdrop-blur-sm border border-white/20`}>
        <span className="flex items-center space-x-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Use keyboard arrows</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default HomeCarousel;