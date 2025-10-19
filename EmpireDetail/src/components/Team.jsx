export default function Team() {
  const people = [
    { img: '/assets/img/team/juan.jpg', name: 'Goura Rodriguez', role: 'CEO' },
    { img: '/assets/img/team/gabriel.jpg', name: 'Francisco Monsalve', role: 'Jefe de Taller' },
    { img: '/assets/img/team/im5.jpg', name: 'Juan Guarnizo', role: 'Detailer' },
  ]
  return (
    <section className="page-section" id="team">
      <div className="container">
        <div className="text-center">
          <h2 className="section-heading text-uppercase">Equipo de Trabajo</h2>
          <h3 className="section-subheading text-muted">Compromiso y dedicación en cada tarea.</h3>
        </div>
        <div className="row">
          {people.map((p, i) => (
            <div className="col-lg-4" key={i}>
              <div className="team-member">
                <img className="mx-auto rounded-circle" src={p.img} alt={p.name} />
                <h4>{p.name}</h4>
                <p className="text-muted">{p.role}</p>
                <a className="btn btn-dark btn-social mx-2" href="#!" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a className="btn btn-dark btn-social mx-2" href="#!" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a className="btn btn-dark btn-social mx-2" href="#!" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <div className="col-lg-8 mx-auto text-center"><p className="large text-muted">Nos mueve la perfección y el compromiso para ofrecerte un servicio de calidad superior.</p></div>
        </div>
      </div>
    </section>
  )
}
