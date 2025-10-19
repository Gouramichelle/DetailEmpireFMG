import React, { useEffect } from 'react'

export default function Navbar() {
  useEffect(() => {
    const onScroll = () => {
      const nav = document.getElementById('mainNav')
      if (!nav) return
      if (window.scrollY > 100) nav.classList.add('navbar-shrink')
      else nav.classList.remove('navbar-shrink')
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeCollapse = () => {
    const navResp = document.getElementById('navbarResponsive')
    if (navResp?.classList.contains('show')) {
      // bootstrap collapse may not be active; just hide class
      navResp.classList.remove('show')
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
      <div className="container">
        <a className="navbar-brand" href="#page-top" onClick={closeCollapse}>Detail Empire FMG</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
          Menu <i className="fas fa-bars ms-1"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav text-uppercase ms-auto py-4 py-lg-0">
            <li className="nav-item"><a className="nav-link" href="#reservas" onClick={closeCollapse}>Reservas</a></li>
            <li className="nav-item"><a className="nav-link" href="#services" onClick={closeCollapse}>Servicios</a></li>
            <li className="nav-item"><a className="nav-link" href="#portfolio" onClick={closeCollapse}>Trabajos</a></li>
            <li className="nav-item"><a className="nav-link" href="#team" onClick={closeCollapse}>Team</a></li>
            <li className="nav-item"><a className="nav-link" href="#contact" onClick={closeCollapse}>Contacto</a></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
