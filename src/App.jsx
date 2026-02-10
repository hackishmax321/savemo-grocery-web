import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'
import ItemsPage from './pages/ItemsPage'
import AboutUsPage from './pages/AboutUsPage'
import ContactUsPage from './pages/ContactUsPage'
import OpenPage from './pages/OPenPage'
import ViewCartPage from './pages/ViewCartPage'
import CheckoutPage from './pages/CheckoutPage'

function App() {

  return (
    <div className=''>
      <Router>
        <Nav />
        <Routes>
          <Route Component={OpenPage} path='/'/>
          <Route Component={ItemsPage} path='/products'/>
          <Route Component={AboutUsPage} path='/about-us' />
          <Route Component={ContactUsPage} path='/contact-us' />
          <Route Component={ViewCartPage} path='/view-cart' />
          <Route Component={CheckoutPage} path='/checkout' />
          
        </Routes>

        <Footer />

      </Router>
      
    </div>
  )
}

export default App
