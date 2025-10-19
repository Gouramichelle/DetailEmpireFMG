import React, { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Debes ingresar tu nombre.'
    if (!emailRegex.test(form.email)) e.email = 'Debes ingresar un email válido.'
    if (!form.phone.trim()) e.phone = 'Debes ingresar tu número de celular.'
    if (!form.message.trim()) e.message = 'Debes ingresar un mensaje.'
    return e
  }

  const onSubmit = (ev) => {
    ev.preventDefault()
    setSuccess('')
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setSuccess('✅ Tu mensaje se envió correctamente.')
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <section className="page-section" id="contact">
      <div className="container">
        <div className="text-center">
          <h2 className="section-heading text-uppercase">Contáctanos</h2>
          <h3 className="section-subheading text-muted">Envíanos cualquier consulta o comentario</h3>
        </div>
        <form onSubmit={onSubmit}>
          <div className="row align-items-stretch mb-5">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} name="name" type="text" placeholder="Tu Nombre *" value={form.name} onChange={handleChange} />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="form-group mb-3">
                <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} name="email" type="text" placeholder="Tu Email *" value={form.email} onChange={handleChange} />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="form-group mb-3">
                <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} name="phone" type="text" placeholder="Tu Celular *" value={form.phone} onChange={handleChange} />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group form-group-textarea mb-3">
                <textarea className={`form-control ${errors.message ? 'is-invalid' : ''}`} name="message" placeholder="Escribe un mensaje *" value={form.message} onChange={handleChange}></textarea>
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>
            </div>
          </div>
          <div className="text-center">
            <button className="btn btn-primary btn-xl text-uppercase" type="submit">Enviar Mensaje</button>
            {success && <div className="alert alert-success mt-3" role="alert">{success}</div>}
          </div>
        </form>
      </div>
    </section>
  )
}
