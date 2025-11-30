// src/components/Navbar.jsx
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
    const navBarToggler = document.querySelector('.navbar-toggler')
    const navBarResponsive = document.getElementById('navbarResponsive')
    if (navBarResponsive?.classList.contains('show')) {
      navBarToggler?.click()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
      <div className="container">
        {/* Logo → Home */}
        <Link className="navbar-brand" to="/" onClick={closeCollapse}>
          Detail Empire FMG
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          Menu <i className="fas fa-bars ms-1"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav text-uppercase ms-auto py-4 py-lg-0">
            {/* Ir directamente a la pantalla de reservar */}
            <li className="nav-item">
              <Link className="nav-link" to="/reservas" onClick={closeCollapse}>
                Reservar
              </Link>
            </li>

            {/* Secciones de la landing */}
            <li className="nav-item">
              <a className="nav-link" href="#services" onClick={closeCollapse}>
                Servicios
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#portfolio" onClick={closeCollapse}>
                Trabajos
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#team" onClick={closeCollapse}>
                Team
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#contact" onClick={closeCollapse}>
                Contacto
              </a>
            </li>

            {/* Opciones según login */}
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile" onClick={closeCollapse}>
                    Perfil
                  </Link>
                </li>

                {user.role === 'ADMIN' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/services" onClick={closeCollapse}>
                      Admin servicios
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    style={{ textDecoration: 'none' }}
                    onClick={() => {
                      closeCollapse()
                      handleLogout()
                    }}
                  >
                    Salir
                  </button>
                </li>
              </>
            )}

            {!user && (
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={closeCollapse}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
