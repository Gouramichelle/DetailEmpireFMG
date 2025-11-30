// src/pages/NewReservation.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  VEHICLE_API_BASE,
  RESERVATION_API_BASE,
  SERVICE_API_BASE,
  authFetch,
} from "../api/client.js";
import { uploadImageToCloudinary } from "../api/cloudinary.js";

export default function NewReservationPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);

  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Proteger ruta: si no hay usuario, redirigir a login
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // Cargar vehículos del usuario y servicios activos
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoadingData(true);
      setError("");
      try {
        const [vehRes, svcRes] = await Promise.all([
          authFetch(`${VEHICLE_API_BASE}/my`, {}, user.token),
          authFetch(`${SERVICE_API_BASE}`, {}, user.token),
        ]);

        if (!vehRes.ok) {
          throw new Error("No se pudieron cargar tus vehículos.");
        }
        if (!svcRes.ok) {
          throw new Error("No se pudieron cargar los servicios.");
        }

        const vehJson = await vehRes.json();
        const svcJson = await svcRes.json();

        const vehiclesArr = vehJson || [];
        const servicesArr = svcJson || [];

        setVehicles(vehiclesArr);
        setServices(servicesArr);

        if (vehiclesArr.length > 0 && !vehicleId) {
          setVehicleId(String(vehiclesArr[0].id));
        }
        if (servicesArr.length > 0 && !serviceId) {
          setServiceId(String(servicesArr[0].id));
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar datos para la reserva.");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  async function handleFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadImageToCloudinary(file);
        urls.push(url);
      }
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error(err);
      setError("Error al subir imágenes. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(urlToRemove) {
    setPhotos((prev) => prev.filter((u) => u !== urlToRemove));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!vehicleId || !serviceId || !date) {
      setError("Debes seleccionar vehículo, servicio y fecha/hora.");
      return;
    }

    setSaving(true);
    try {
      const isoDate = date.length === 16 ? `${date}:00` : date;

      const body = {
        vehicleId: Number(vehicleId),
        serviceId: Number(serviceId),
        date: isoDate,
        notes: notes || null,
        photos,
      };

      const res = await authFetch(
        `${RESERVATION_API_BASE}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        user.token
      );

      if (!res.ok) {
        let msg = "Error al crear la reserva.";
        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      setSuccess("Reserva creada con éxito.");
      setNotes("");
      setPhotos([]);
      // Si quieres, puedes redirigir al perfil:
      // navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <section className="page-section">
        <div className="container">
          <p>Cargando...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h2 className="text-uppercase mb-4">Crear reserva</h2>

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

        {loadingData ? (
          <p>Cargando vehículos y servicios...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* VEHÍCULO */}
            <div className="mb-3">
              <label className="form-label">Vehículo</label>
              {vehicles.length === 0 ? (
                <div className="alert alert-warning">
                  No tienes vehículos registrados. Primero debes registrar uno en tu{" "}
                  <Link to="/profile">perfil</Link>.
                </div>
              ) : (
                <select
                  className="form-select"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.year}) – {v.plate}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* SERVICIO */}
            <div className="mb-3">
              <label className="form-label">Servicio</label>
              {services.length === 0 ? (
                <div className="alert alert-warning">
                  No hay servicios disponibles por el momento. Inténtalo más tarde.
                </div>
              ) : (
                <select
                  className="form-select"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} – ${s.price}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* FECHA Y HORA */}
            <div className="mb-3">
              <label className="form-label">Fecha y hora</label>
              <input
                type="datetime-local"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* NOTAS */}
            <div className="mb-3">
              <label className="form-label">Notas (opcional)</label>
              <textarea
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional sobre tu vehículo o la reserva"
              />
            </div>

            {/* FOTOS */}
            <div className="mb-3">
              <label className="form-label">Fotos del vehículo (opcional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
              />
              {uploading && (
                <small className="form-text">Subiendo imágenes...</small>
              )}

              {!!photos.length && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {photos.map((url) => (
                    <div
                      key={url}
                      className="position-relative"
                      style={{ width: "100px" }}
                    >
                      <img
                        src={url}
                        alt="Foto subida"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                          height: "80px",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        style={{ position: "absolute", top: 0, right: 0 }}
                        onClick={() => removePhoto(url)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                saving ||
                uploading ||
                vehicles.length === 0 ||
                services.length === 0
              }
            >
              {saving ? "Guardando..." : "Guardar reserva"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
