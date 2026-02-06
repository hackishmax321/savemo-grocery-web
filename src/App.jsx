import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/nav/Nav'

function App() {

  return (
    <div className=''>
      <Router>
        <Nav />
        <Routes>
          
        </Routes>

      </Router>
      
    </div>
  )
}

export default App
