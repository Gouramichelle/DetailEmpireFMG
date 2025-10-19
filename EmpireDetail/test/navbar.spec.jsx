
// test/Navbar.spec.jsx
import Navbar from '../src/components/Navbar';
import { render, screen } from '@testing-library/react';


describe('Navbar', () => {
  // Utilidad para obtener el elemento principal del nav
  const getMainNav = () =>
    document.getElementById('mainNav') ||
    screen.getByRole('navigation');

  it('muestra los enlaces principales del sitio', () => {
    render(<Navbar />);

    // Ajusta/duplica si tus labels exactos cambian
    expect(screen.getByRole('link', { name: /servicios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /trabajos|portafolio|portfolio/i })).toBeInTheDocument();
    // "reservas" si tienes esa sección (sino, comenta esta línea)
    // expect(screen.getByRole('link', { name: /reservas/i })).toBeInTheDocument();
    // "team" o "equipo" según tu texto
    expect(
      screen.getByRole('link', { name: /team|equipo/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contacto/i })).toBeInTheDocument();
  });

  it('agrega y quita la clase "navbar-shrink" según el scroll', () => {
    render(<Navbar />);
    const nav = getMainNav();

    // Simula posición arriba (no debería estar shrunken)
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(nav.classList.contains('navbar-shrink')).toBeFalse();

    // Simula scroll hacia abajo
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(nav.classList.contains('navbar-shrink')).toBeTrue();

    // Vuelve arriba
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(nav.classList.contains('navbar-shrink')).toBeFalse();
  });
});
