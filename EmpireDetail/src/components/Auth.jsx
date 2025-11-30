import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";
const AUTH_API = `${API_BASE_URL}/api/auth`;

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones básicas según modo
    if (mode === "register") {
      if (!form.name || !form.email || !form.password) {
        setError("Completa todos los campos requeridos.");
        return;
      }
    } else if (mode === "login") {
      if (!form.email || !form.password) {
        setError("Ingresa tu email y contraseña.");
        return;
      }
    } else if (mode === "forgot") {
      if (!form.email) {
        setError("Ingresa tu email para recuperar la contraseña.");
        return;
      }
    }

    setLoading(true);
    try {
      let endpoint = "";
      let payload = {};

      if (mode === "login") {
        endpoint = "/login";
        payload = {
          email: form.email,
          password: form.password,
        };
      } else if (mode === "register") {
        endpoint = "/register";
        payload = {
          name: form.name,
          email: form.email,
          password: form.password,
        };
      } else if (mode === "forgot") {
        endpoint = "/forgot-password";
        payload = {
          email: form.email,
        };
      }

      const url = `${AUTH_API}${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Error de autenticación";

        if (response.status === 401 || response.status === 403) {
          message =
            mode === "forgot"
              ? "Si el correo existe, se enviaron instrucciones."
              : "Correo o contraseña incorrectos.";
        }

        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const data = JSON.parse(errorText);
              message = data.message || data.error || message;
            } catch {
              message = errorText;
            }
          }
        } catch {
          // ignore
        }

        throw new Error(message);
      }

      // forgot-password: solo mostramos mensaje y volvemos a login
      if (mode === "forgot") {
        const text = await response.text();
        setSuccess(
          text ||
            "Si el correo existe, se enviaron instrucciones para recuperar tu contraseña."
        );
        setTimeout(() => {
          setMode("login");
          setSuccess("");
        }, 2500);
        return;
      }

      // login / register: esperamos JSON con token, etc.
      const data = await response.json();
      login(data);

      if (mode === "register") {
        setSuccess("Registro exitoso. Redirigiendo a tu perfil...");
      } else {
        setSuccess("Inicio de sesión exitoso. Redirigiendo a tu perfil...");
      }

      setTimeout(() => {
        navigate("/profile");
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setMode("forgot");
    setError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, password: "" }));
  };

  return (
    <section className="page-section" id="Auth">
      <div className="container" style={{ maxWidth: 600 }}>
        <h2 className="text-uppercase text-center mb-4">
          {mode === "login"
            ? "Iniciar sesión"
            : mode === "register"
            ? "Crear cuenta"
            : "Recuperar contraseña"}
        </h2>

        {/* Tabs login / registro */}
        <div className="d-flex justify-content-center mb-4">
          <button
            type="button"
            className={`btn me-2 ${
              mode === "login" ? "btn-warning" : "btn-outline-warning"
            }`}
            onClick={() => handleModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn ${
              mode === "register" ? "btn-warning" : "btn-outline-warning"
            }`}
            onClick={() => handleModeChange("register")}
          >
            Registrarme
          </button>
        </div>

        <div className="card shadow">
          <div className="card-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {mode === "register" && (
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tucorreo@dominio.com"
                />
              </div>

              {(mode === "login" || mode === "register") && (
                <>
                  <div className="mb-1">
                    <label className="form-label">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>

                  {mode === "login" && (
                    <div className="mb-3 text-end">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        style={{ fontSize: "0.9rem" }}
                        onClick={handleForgotPassword}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                </>
              )}

              {mode === "forgot" && (
                <p className="mb-3 text-muted" style={{ fontSize: "0.9rem" }}>
                  Ingresa tu correo y, si existe en el sistema, se enviarán
                  instrucciones para recuperar tu contraseña.
                </p>
              )}

              <button
                type="submit"
                className="btn btn-warning w-100 text-uppercase"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : mode === "login"
                  ? "Entrar"
                  : mode === "register"
                  ? "Registrarme"
                  : "Enviar instrucciones"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-3 text-muted">
          Una vez autenticado, podrás gestionar tus vehículos, revisar tus
          reservas y, si eres administrador, administrar los servicios.
        </p>
      </div>
    </section>
  );
}
