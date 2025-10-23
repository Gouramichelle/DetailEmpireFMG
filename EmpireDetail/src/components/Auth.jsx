// === src/components/Auth.jsx ===
import React, { useState } from "react";

// Bootstrap ya está en el proyecto (index.html + styles.css del theme).
// Demo sin backend: guarda usuarios en localStorage y valida login localmente.
const USER_KEY = "demo_users";
const UserStore = {
  all() { try { return JSON.parse(localStorage.getItem(USER_KEY)) || []; } catch { return []; } },
  save(list) { localStorage.setItem(USER_KEY, JSON.stringify(list)); },
  add(user) { const list = UserStore.all(); list.push(user); UserStore.save(list); },
  findByEmail(email) { return UserStore.all().find(u => u.email.toLowerCase() === email.toLowerCase()); }
};

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  return (
    <section className="page-section" id="auth">
      <div className="container" style={{maxWidth: 540}}>
        <div className="text-center mb-4">
          <h2 className="section-heading text-uppercase">
            {mode === 'login' ? 'Inicia sesión' : mode === 'register' ? 'Crea tu cuenta' : 'Recuperar contraseña'}
          </h2>
          <p className="text-muted">
            {mode === 'login' && <>¿Aún no tienes cuenta? <button className="btn btn-link p-0" onClick={() => setMode('register')}>Regístrate</button></>}
            {mode === 'register' && <>¿Ya tienes cuenta? <button className="btn btn-link p-0" onClick={() => setMode('login')}>Inicia sesión</button></>}
            {mode === 'reset' && <>¿Recordaste tu contraseña? <button className="btn btn-link p-0" onClick={() => setMode('login')}>Volver al login</button></>}
          </p>
        </div>

        <div className="card shadow border-0">
          <div className="card-body p-4 p-md-5">
            {mode === 'login' && <Login onGoReset={() => setMode('reset')} />}
            {mode === 'register' && <Register onRegistered={() => setMode('login')} />}
            {mode === 'reset' && <Reset onDone={() => setMode('login')} />}
          </div>
        </div>
      </div>
    </section>
  );
}

function Alert({ type = "danger", children }) {
  return <div className={`alert alert-${type} small`} role="alert">{children}</div>;
}
function FormGroup({ label, error, hint, children }) {
  return (
    <div className="mb-3">
      <label className="form-label mb-1">{label}</label>
      {children}
      <div className="form-text">{error ? <span className="text-danger">{error}</span> : hint || null}</div>
    </div>
  );
}
function SubmitButton({ loading, children }) {
  return (
    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
      {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
      {loading ? "Procesando..." : children}
    </button>
  );
}
function PasswordInput({ value, onChange, id, placeholder = "••••••" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-group">
      <input id={id} type={show ? "text" : "password"} className="form-control" value={value} onChange={onChange} placeholder={placeholder} />
      <button type="button" className="btn btn-outline-secondary" onClick={() => setShow(s => !s)}>
        {show ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverOk, setServerOk] = useState("");
  function handleChange(e) { const { name, value } = e.target; setValues(v => ({ ...v, [name]: value })); }
  return { values, setValues, errors, setErrors, loading, setLoading, serverError, setServerError, serverOk, setServerOk, handleChange };
}

function Login({ onGoReset }) {
  const { values, errors, setErrors, loading, setLoading, serverError, setServerError, handleChange } = useForm({ email: "", password: "" });
  async function onSubmit(e) {
    e.preventDefault(); setServerError("");
    const nextErrors = {}; if (!values.email) nextErrors.email = "Requerido"; if (!values.password) nextErrors.password = "Requerido";
    setErrors(nextErrors); if (Object.keys(nextErrors).length) return;
    try {
      setLoading(true);
      const found = UserStore.findByEmail(values.email);
      if (!found || found.password !== values.password) throw new Error("Credenciales inválidas");
      alert(`¡Bienvenido ${found.name || found.email}! (demo local)`);
    } catch (err) { setServerError(err.message || "Error al iniciar sesión"); }
    finally { setLoading(false); }
  }
  return (
    <form onSubmit={onSubmit} noValidate>
      {serverError && <Alert>{serverError}</Alert>}
      <FormGroup label="Email" error={errors.email}>
        <input name="email" type="email" className="form-control" autoComplete="email" value={values.email} onChange={handleChange} placeholder="tucorreo@dominio.com" />
      </FormGroup>
      <FormGroup label="Contraseña" error={errors.password} hint="Mínimo 6 caracteres">
        <PasswordInput id="login-password" value={values.password} onChange={(e) => handleChange({ target: { name: "password", value: e.target.value } })} />
      </FormGroup>
      <div className="d-flex justify-content-end mb-3">
        <button type="button" className="btn btn-link p-0" onClick={onGoReset}>¿Olvidaste tu contraseña?</button>
      </div>
      <SubmitButton loading={loading}>Entrar</SubmitButton>
    </form>
  );
}

function Register({ onRegistered }) {
  const { values, errors, setErrors, loading, setLoading, serverError, setServerError, serverOk, setServerOk, handleChange } = useForm({ name: "", email: "", password: "", confirm: "" });
  async function onSubmit(e) {
    e.preventDefault(); setServerError(""); setServerOk("");
    const nextErrors = {};
    if (!values.name) nextErrors.name = "Requerido";
    if (!values.email) nextErrors.email = "Requerido";
    if (!values.password) nextErrors.password = "Requerido";
    if (!values.confirm) nextErrors.confirm = "Requerido";
    if (values.password && values.password.length < 6) nextErrors.password = "Mínimo 6 caracteres";
    if (values.confirm && values.confirm !== values.password) nextErrors.confirm = "No coincide";
    if (values.email && UserStore.findByEmail(values.email)) nextErrors.email = "Ya existe un usuario con este email";
    setErrors(nextErrors); if (Object.keys(nextErrors).length) return;
    try {
      setLoading(true);
      UserStore.add({ name: values.name, email: values.email, password: values.password });
      setServerOk("¡Registro exitoso! Ya puedes iniciar sesión.");
      onRegistered?.();
    } catch (err) { setServerError(err.message || "Error al registrar"); }
    finally { setLoading(false); }
  }
  return (
    <form onSubmit={onSubmit} noValidate>
      {serverError && <Alert>{serverError}</Alert>}
      {serverOk && <Alert type="success">{serverOk}</Alert>}
      <FormGroup label="Nombre" error={errors.name}>
        <input name="name" type="text" className="form-control" autoComplete="name" value={values.name} onChange={handleChange} placeholder="Tu nombre" />
      </FormGroup>
      <FormGroup label="Email" error={errors.email}>
        <input name="email" type="email" className="form-control" autoComplete="email" value={values.email} onChange={handleChange} placeholder="tucorreo@dominio.com" />
      </FormGroup>
      <FormGroup label="Contraseña" error={errors.password} hint="Mínimo 6 caracteres">
        <PasswordInput id="register-password" value={values.password} onChange={(e) => handleChange({ target: { name: "password", value: e.target.value } })} />
      </FormGroup>
      <FormGroup label="Confirmar contraseña" error={errors.confirm}>
        <PasswordInput id="register-confirm" value={values.confirm} onChange={(e) => handleChange({ target: { name: "confirm", value: e.target.value } })} />
      </FormGroup>
      <SubmitButton loading={loading}>Crear cuenta</SubmitButton>
      <p className="text-muted small mt-3 mb-0">Al registrarte, aceptas nuestros <a href="#">Términos</a> y <a href="#">Política de privacidad</a>.</p>
    </form>
  );
}

function Reset({ onDone }) {
  const { values, errors, setErrors, loading, setLoading, serverError, setServerError, serverOk, setServerOk, handleChange } = useForm({ email: "" });
  async function onSubmit(e) {
    e.preventDefault(); setServerError(""); setServerOk("");
    const nextErrors = {}; if (!values.email) nextErrors.email = "Requerido";
    setErrors(nextErrors); if (Object.keys(nextErrors).length) return;
    try {
      setLoading(true);
      const user = UserStore.findByEmail(values.email);
      if (!user) throw new Error("No existe un usuario con ese email");
      setServerOk("Te enviamos un enlace de recuperación (demo). Revisa tu correo.");
    } catch (err) { setServerError(err.message || "No se pudo procesar la solicitud"); }
    finally { setLoading(false); }
  }
  return (
    <form onSubmit={onSubmit} noValidate>
      {serverError && <Alert>{serverError}</Alert>}
      {serverOk && <Alert type="success">{serverOk}</Alert>}
      <FormGroup label="Email" error={errors.email}>
        <input name="email" type="email" className="form-control" autoComplete="email" value={values.email} onChange={handleChange} placeholder="tucorreo@dominio.com" />
      </FormGroup>
      <SubmitButton loading={loading}>Enviar enlace</SubmitButton>
      <div className="text-end mt-3">
        <button type="button" className="btn btn-link p-0" onClick={onDone}>Volver al login</button>
      </div>
    </form>
  );
}

