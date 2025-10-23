import Navbar from './components/Navbar.jsx'
import Header from './components/Header.jsx'
import Services from './components/Services.jsx'
import Portfolio from './components/Portfolio.jsx'
import Team from './components/Team.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Reservas from './components/Reservas.jsx'
import Auth from './components/Auth.jsx'
export default function App() {
  return (
    <>
      <Navbar />
      <Header />
      <Auth />
      <Services />
      <Portfolio />
      <Team />
      <Reservas />
      <Contact />
      <Footer />
    </>
  )
}
