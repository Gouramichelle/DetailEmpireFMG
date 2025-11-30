// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  VEHICLE_API_BASE,
  RESERVATION_API_BASE,
  SERVICE_API_BASE,
  authFetch,
} from "../api/client.js";


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]); 
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [editingVehicleId, setEditingVehicleId] = useState(null);


  const [vehicleForm, setVehicleForm] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
    color: "",
  });
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Si no hay usuario, redirigimos a login
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // Cargar vehículos y reservas del usuario
  useEffect(() => {
  if (!user) return;

  const loadData = async () => {
    setLoadingData(true);
    setError("");
    try {
      const [vehRes, resRes, svcRes] = await Promise.all([
        authFetch(`${VEHICLE_API_BASE}/my`, {}, user.token),
        authFetch(`${RESERVATION_API_BASE}/my`, {}, user.token),
        authFetch(`${SERVICE_API_BASE}`, {}, user.token), // 👈 servicios
      ]);

      if (!vehRes.ok) {
        throw new Error("No se pudieron cargar tus vehículos.");
      }
      if (!resRes.ok) {
        throw new Error("No se pudieron cargar tus reservas.");
      }
      if (!svcRes.ok) {
        throw new Error("No se pudieron cargar los servicios.");
      }

      const vehiclesJson = await vehRes.json();
      const reservationsJson = await resRes.json();
      const servicesJson = await svcRes.json();

      setVehicles(vehiclesJson || []);
      setReservations(reservationsJson || []);
      setServices(servicesJson || []); // 👈 guardamos servicios
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar los datos de tu perfil.");
    } finally {
      setLoadingData(false);
    }
  };

  loadData();
}, [user]);


  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  };

   const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return;

    if (
      !vehicleForm.brand ||
      !vehicleForm.model ||
      !vehicleForm.year ||
      !vehicleForm.plate
    ) {
      setError("Completa marca, modelo, año y patente para registrar el vehículo.");
      return;
    }

    setSavingVehicle(true);
    try {
      const payload = {
        brand: vehicleForm.brand,
        model: vehicleForm.model,
        year: Number(vehicleForm.year),
        plate: vehicleForm.plate,
        color: vehicleForm.color || "",
      };

      const isEditing = editingVehicleId !== null;
      const url = isEditing
        ? `${VEHICLE_API_BASE}/${editingVehicleId}`
        : `${VEHICLE_API_BASE}`;

      const method = isEditing ? "PUT" : "POST";

      const response = await authFetch(
        url,
        {
          method,
          body: JSON.stringify(payload),
        },
        user.token
      );

      if (!response.ok) {
        let message = isEditing
          ? "No se pudo actualizar el vehículo."
          : "No se pudo crear el vehículo.";
        try {
          const txt = await response.text();
          if (txt) message = txt;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const vehicle = await response.json();

      if (isEditing) {
        // Actualizar en la lista
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicle.id ? vehicle : v))
        );
      } else {
        // Agregar al final
        setVehicles((prev) => [...prev, vehicle]);
      }

      // Limpiar formulario y salir del modo edición
      setVehicleForm({
        brand: "",
        model: "",
        year: "",
        plate: "",
        color: "",
      });
      setEditingVehicleId(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar vehículo.");
    } finally {
      setSavingVehicle(false);
    }
  };
  const handleEditVehicle = (vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      plate: vehicle.plate || "",
      color: vehicle.color || "",
    });
  };


  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este vehículo?")) return;
    if (!user) return;

    try {
      const response = await authFetch(
        `${VEHICLE_API_BASE}/${id}`,
        { method: "DELETE" },
        user.token
      );
      if (!response.ok && response.status !== 204) {
        throw new Error("No se pudo eliminar el vehículo.");
      }
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al eliminar vehículo.");
    }
  };

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
    <section className="page-section" id="profile">
      <div className="container">
        <h2 className="text-uppercase mb-4">Mi perfil</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Datos del usuario */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title">Datos del usuario</h5>
                <p className="mb-1">
                  <strong>Nombre:</strong> {user.name}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="mb-0">
                  <strong>Rol:</strong> {user.role}
                </p>
              </div>
            </div>

            {/* Formulario para registrar vehículo */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Registrar nuevo vehículo</h5>
                <form onSubmit={handleCreateVehicle}>
                  <div className="mb-2">
                    <label className="form-label">Marca</label>
                    <input
                      type="text"
                      name="brand"
                      className="form-control"
                      value={vehicleForm.brand}
                      onChange={handleVehicleInputChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Modelo</label>
                    <input
                      type="text"
                      name="model"
                      className="form-control"
                      value={vehicleForm.model}
                      onChange={handleVehicleInputChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Año</label>
                    <input
                      type="number"
                      name="year"
                      className="form-control"
                      value={vehicleForm.year}
                      onChange={handleVehicleInputChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Patente</label>
                    <input
                      type="text"
                      name="plate"
                      className="form-control"
                      value={vehicleForm.plate}
                      onChange={handleVehicleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color (opcional)</label>
                    <input
                      type="text"
                      name="color"
                      className="form-control"
                      value={vehicleForm.color}
                      onChange={handleVehicleInputChange}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-warning w-100"
                    disabled={savingVehicle}
                  >
                    {savingVehicle ? "Guardando..." : "Guardar vehículo"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Listas de vehículos y reservas */}
          <div className="col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-between align-items-center">
                  <span>Mis vehículos</span>
                  {loadingData && (
                    <span className="badge bg-secondary">Cargando...</span>
                  )}
                </h5>
                {vehicles.length === 0 ? (
                  <p className="text-muted mb-0">
                    Aún no has registrado vehículos.
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {vehicles.map((v) => (
                        <li
                          key={v.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>
                              {v.brand} {v.model}
                            </strong>{" "}
                            ({v.year}) – {v.plate}
                            {v.color && <span> · {v.color}</span>}
                          </div>
                          <div className="btn-group">
                            
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => handleEditVehicle(v)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteVehicle(v.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      ))}

                  </ul>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Mis reservas</h5>
                    {reservations.length === 0 ? (
                      <p className="text-muted mb-0">
                        Aún no tienes reservas registradas.
                      </p>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {reservations.map((r) => {
                          const vehicle = vehicles.find((v) => v.id === r.vehicleId);
                          const service = services.find((s) => s.id === r.serviceId);

                          return (
                            <li key={r.id} className="list-group-item">
                              <div className="d-flex justify-content-between">
                                {/* IZQUIERDA: info textual */}
                                <div>
                                  <div>
                                    <strong>Reserva #{r.id}</strong>
                                  </div>

                                  {/* Vehículo */}
                                  <div>
                                    <small>
                                      {vehicle ? (
                                        <>
                                          Vehículo: {vehicle.brand} {vehicle.model} ({vehicle.year}) ·
                                          Patente: {vehicle.plate}
                                          {vehicle.color && <> · {vehicle.color}</>}
                                        </>
                                      ) : (
                                        <>Vehículo ID: {r.vehicleId}</>
                                      )}
                                    </small>
                                  </div>

                                  {/* Servicio */}
                                  <div>
                                    <small>
                                      {service ? (
                                        <>
                                          Servicio: {service.name}
                                          {service.price != null && (
                                            <>
                                              {" "}
                                              –{" "}
                                              {new Intl.NumberFormat("es-CL", {
                                                style: "currency",
                                                currency: "CLP",
                                              }).format(service.price)}
                                            </>
                                          )}
                                        </>
                                      ) : (
                                        <>Servicio ID: {r.serviceId}</>
                                      )}
                                    </small>
                                  </div>

                                  {/* Fecha */}
                                  <div>
                                    <small>
                                      Fecha:{" "}
                                      {r.date ? new Date(r.date).toLocaleString() : "Sin fecha"}
                                    </small>
                                  </div>

                                  {/* Estado (si tu API ya lo devuelve) */}
                                  {r.status && (
                                    <div>
                                      <small>Estado: {r.status}</small>
                                    </div>
                                  )}

                                  {/* Notas */}
                                  {r.notes && (
                                    <div>
                                      <small>Notas: {r.notes}</small>
                                    </div>
                                  )}
                                </div>

                                {/* DERECHA: foto del servicio (photoUrl) */}
                                {service && service.photoUrl && (
                                  <div style={{ marginLeft: "16px" }}>
                                    <img
                                      src={service.photoUrl}
                                      alt={service.name}
                                      style={{
                                        width: "100px",
                                        height: "80px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* FOTOS SUBIDAS EN LA RESERVA (Cloudinary) */}
                              {Array.isArray(r.photos) && r.photos.length > 0 && (
                                <div className="mt-2 d-flex flex-wrap gap-2">
                                  {r.photos.map((url, idx) => (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt={`Foto reserva ${r.id}`}
                                      style={{
                                        width: "80px",
                                        height: "60px",
                                        objectFit: "cover",
                                        borderRadius: "6px",
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}              
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
