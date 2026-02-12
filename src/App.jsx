import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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

function App() {
  const [showAuth, setShowAuth] = useState(false)
  
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  return (
    <div className=''>
      <Nav setShowAuth={() => setShowAuth(!showAuth)}/>
      {showAuth && <AuthModal isOpen={true} onClose={() => {
        setShowAuth(false)
      }} />}
      <Routes>
        <Route path='/' element={<OpenPage />} />
        <Route path='/products' element={<ItemsPage />} />
        <Route path='/about-us' element={<AboutUsPage />} />
        <Route path='/contact-us' element={<ContactUsPage />} />
        <Route path='/view-cart' element={<ViewCartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/return' element={<ReturnPolicyPage />} />
        <Route path='/policy' element={<PrivacyPolicyPage />} />
        <Route path='/terms' element={<TermsConditionsPage />} />

        <Route path='/dashboard' element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path='profile' element={<ProfilePage />} />
          <Route path='items-management' element={<ItemsManagementPage />} />
        </Route>
      </Routes>

      {!isDashboardRoute && <Footer />}

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