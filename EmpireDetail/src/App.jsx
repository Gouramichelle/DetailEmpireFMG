// src/App.jsx
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Header from './components/Header.jsx'
import Services from './components/Services.jsx'
import Portfolio from './components/Portfolio.jsx'
import Team from './components/Team.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Reservas from './components/Reservas.jsx'
import Auth from './components/Auth.jsx'

import ProfilePage from './pages/Profile.jsx'
import NewReservationPage from './pages/NewReservation.jsx'
import AdminServicesPage from './pages/AdminServices.jsx'

// Landing principal (sin login)
function HomePage() {
  return (
    <>
      <Header />
      {/* La sección de marketing de reservas que ya tenías */}
      <Reservas />
      <Services />
      <Portfolio />
      <Team />
      <Contact />
    </>
  )
}

// Página de login
function LoginPage() {
  return (
    <>
      <Auth />
    </>
  )
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reservas" element={<NewReservationPage />} />
        <Route path="/admin/services" element={<AdminServicesPage />} />
      </Routes>

      <Footer />
    </>
  )
}
