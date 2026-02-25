import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'
import ItemsPage from './pages/ItemsPage'
import AboutUsPage from './pages/AboutUsPage'
import ContactUsPage from './pages/ContactUsPage'
import OpenPage from './pages/OpenPage'
import ViewCartPage from './pages/ViewCartPage'
import CheckoutPage from './pages/CheckoutPage'
import AuthModal from './components/modals/AuthModal'
import DashboardLayout from './components/dashboard/DashboardLayout'
import DashboardHomePage from './components/dashboard/DashboardHomePage'
import ProfilePage from './components/dashboard/ProfilePage'
import ItemsManagementPage from './components/dashboard/ItemsManagementPage'
import ReturnPolicyPage from './pages/ReturnPolicyPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsConditionsPage from './pages/TermsConditionsPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import PromotionsManagementPage from './components/dashboard/PromotionManagementPage'
import OrdersManagementPage from './components/dashboard/OrdersManagementPage'
import LoadingScreen from './components/loading_screen/LoadingScreen'
import DeliveryDetailsPage from './pages/DeliveryDetailsPage'

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  useEffect(() => {
    // Simulate loading time (you can replace this with actual loading logic)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Adjust time as needed

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className=''>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <>
            <Nav setShowAuth={() => setShowAuth(!showAuth)}/>
            {showAuth && <AuthModal isOpen={true} onClose={() => {
              setShowAuth(false)
            }} />}
            <Routes>
              <Route path='/' element={<OpenPage />} />
              <Route path='/products' element={<ItemsPage />} />
              <Route path='/products/:id' element={<ProductDetailsPage />} />
              <Route path='/about-us' element={<AboutUsPage />} />
              <Route path='/contact-us' element={<ContactUsPage />} />
              <Route path='/view-cart' element={<ViewCartPage />} />
              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path='/delivery' element={<DeliveryDetailsPage />} />
              <Route path='/return' element={<ReturnPolicyPage />} />
              <Route path='/policy' element={<PrivacyPolicyPage />} />
              <Route path='/terms' element={<TermsConditionsPage />} />

              <Route path='/dashboard' element={<DashboardLayout />}>
                <Route index element={<DashboardHomePage />} />
                <Route path='profile' element={<ProfilePage />} />
                <Route path='items-management' element={<ItemsManagementPage />} />
                <Route path='promotions-management' element={<PromotionsManagementPage />} />
                <Route path='orders-management' element={<OrdersManagementPage />} />
              </Route>
            </Routes>

            {!isDashboardRoute && <Footer />}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper