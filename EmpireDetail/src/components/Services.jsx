export default function Services() {
  const services = [
    {
      icon: 'fa-shopping-cart',
      title: 'Detailing',
      text: 'Tratamos cada rincón de tu vehículo con precisión y cuidado. Nuestro servicio de detailing renueva interiores y resalta cada detalle para que tu auto luzca impecable.'
    },
    {
      icon: 'fa-car',
      title: 'Scanner automotriz',
      text: 'Con tecnología de diagnóstico avanzada, detectamos fallas y optimizamos el rendimiento de tu vehículo.'
    },
    {
      icon: 'fa-lock',
      title: 'Láminas de Seguridad',
      text: 'Protege a tu familia y tu vehículo con láminas de alta resistencia que bloquean rayos UV y entregan mayor privacidad.'
    }
  ]
  return (
    <section className="page-section" id="services">
      <div className="container">
        <div className="text-center">
          <h2 className="section-heading text-uppercase">Servicios</h2>
          <h3 className="section-subheading text-muted">Realizamos todo tipo de servicios mecánicos, especializados en el detallado automotriz.</h3>
        </div>
        <div className="row text-center">
          {services.map((s, i) => (
            <div className="col-md-4" key={i}>
              <span className="fa-stack fa-4x">
                <i className="fas fa-circle fa-stack-2x text-primary"></i>
                <i className={`fas ${s.icon} fa-stack-1x fa-inverse`}></i>
              </span>
              <h4 className="my-3">{s.title}</h4>
              <p className="text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
