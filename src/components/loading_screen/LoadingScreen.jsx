// components/LoadingScreen.jsx
import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <motion.div 
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="loading-content">
        <motion.img 
          src="/logo/logo-main2.png" 
          alt="Logo" 
          className="loading-logo"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="loading-spinner"
          animate={{ 
            rotate: 360
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeDasharray="16 48"
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;