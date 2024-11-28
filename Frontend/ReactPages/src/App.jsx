import React from 'react'
import Home from './pages/playerPages/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './pages/playerPages/Authentication';
import Dashboard from './pages/playerPages/Dashboard'
import AdminDashboard from './pages/adminPages/AdminDashboard';
import AddQuiz from './pages/adminPages/AddQuiz1';

const App = () => {

  return (

    <Router>
      <Routes>
        {/* Default Route for Player (Homepage) */}
        <Route path='/' element={<Home />} />
        <Route path='/authenticate' element={<Authentication />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path='/addQuiz' element={<AddQuiz />} />

      </Routes>

    </Router>
  )
}

export default App
