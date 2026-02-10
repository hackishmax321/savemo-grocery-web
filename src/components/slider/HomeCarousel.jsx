import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Sample slides data
const carouselSlides = [
  {
    id: 1,
    image: '/banners/ban1.jpg',
    title: 'Welcome to Our Marketplace',
    description: 'Discover amazing items from trusted sellers',
    buttonText: 'Shop Now',
    overlayPosition: 'bottom-left' // You can customize positions
  },
  {
    id: 2,
    image: '/banners/ban2.jpg',
    title: 'Summer Collection 2024',
    description: 'Hot deals up to 50% off',
    buttonText: 'Explore Deals',
    overlayPosition: 'bottom-center'
  },
];

// Glass overlay component
const GlassOverlay = ({ title, description, buttonText, position = 'bottom-left' }) => {
  const positionClasses = {
    'bottom-left': 'left-6 bottom-6 text-left',
    'bottom-center': 'left-1/2 transform -translate-x-1/2 bottom-6 text-center',
    'bottom-right': 'right-6 bottom-6 text-right'
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-10 max-w-md`}>
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
        <p className="text-white/90 mb-4 text-lg">{description}</p>
        {buttonText && (
          <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

const HomeCarousel = () => {
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
    fade: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        }
      }
    ]
  };

  return (
    <div className="relative h-140 w-full overflow-hidden">
      <Slider {...settings}>
        {carouselSlides.map((slide) => (
          <div key={slide.id} className="relative h-140">
            {/* Background Image */}
            <div 
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>
            
            {/* Glass Overlay Container */}
            <GlassOverlay
              title={slide.title}
              description={slide.description}
              buttonText={slide.buttonText}
              position={slide.overlayPosition}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HomeCarousel;