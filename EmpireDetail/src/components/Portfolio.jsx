export default function Portfolio() {
  const items = [
    { img: '/assets/img/portfolio/im1.jpg', title: 'Trabajo 1', subtitle: '' },
    { img: '/assets/img/portfolio/im2.jpg', title: 'Trabajo 2', subtitle: '' },
    { img: '/assets/img/portfolio/im3.jpg', title: 'Trabajo 3', subtitle: '' },
    { img: '/assets/img/portfolio/im4.jpg', title: 'Trabajo 4', subtitle: '' },
    { img: '/assets/img/portfolio/5.jpg', title: 'Trabajo 5', subtitle: '' },
    { img: '/assets/img/portfolio/6.jpg', title: 'Trabajo 6', subtitle: '' },
  ]
  return (
    <section className="page-section bg-light" id="portfolio">
      <div className="container">
        <div className="text-center">
          <h2 className="section-heading text-uppercase">Trabajos</h2>
          <h3 className="section-subheading text-muted">Transformación y compromiso, entregando siempre calidad en cada detalle.</h3>
        </div>
        <div className="row">
          {items.map((it, idx) => (
            <div className="col-lg-4 col-sm-6 mb-4" key={idx}>
              <div className="portfolio-item">
                <a className="portfolio-link" href={it.img} target="_blank" rel="noreferrer">
                  <div className="portfolio-hover">
                    <div className="portfolio-hover-content"><i className="fas fa-plus fa-3x"></i></div>
                  </div>
                  <img className="img-fluid" src={it.img} alt={it.title} />
                </a>
                <div className="portfolio-caption">
                  <div className="portfolio-caption-heading">{it.title}</div>
                  <div className="portfolio-caption-subheading text-muted">{it.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
