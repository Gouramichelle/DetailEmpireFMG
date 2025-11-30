// src/pages/AdminServicesPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";


import {
  SERVICE_API_BASE,
  RESERVATION_API_BASE,
  authFetch,
} from "../api/client.js";

const ALL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminServicesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ----- ESTADO: SERVICIOS -----
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "",
    description: "",
    photoUrl: "",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  // ----- ESTADO: RESERVAS -----
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState(null);

  // ----- MENSAJES -----
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Solo ADMIN puede entrar acá
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (user.role !== "ADMIN") {
        navigate("/"); // o una página de "acceso denegado"
      }
    }
  }, [loading, user, navigate]);

  // Cargar servicios
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;

    const loadServices = async () => {
      setLoadingData(true);
      setError("");
      try {
        const res = await authFetch(
          `${SERVICE_API_BASE}/admin/all`,
          {},
          user.token
        );
        if (!res.ok) {
          throw new Error("No se pudieron cargar los servicios.");
        }
        const data = await res.json();
        setServices(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar servicios.");
      } finally {
        setLoadingData(false);
      }
    };

    loadServices();
  }, [user]);

  // Cargar reservas (panel admin)
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;

    const loadReservations = async () => {
      setLoadingReservations(true);
      try {
        const res = await authFetch(
          `${RESERVATION_API_BASE}/admin/all`,
          {},
          user.token
        );
        if (!res.ok) {
          throw new Error("No se pudieron cargar las reservas.");
        }
        const data = await res.json();
        setReservations(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar reservas.");
      } finally {
        setLoadingReservations(false);
      }
    };

    loadReservations();
  }, [user]);

  const handleExportReservationsToExcel = () => {
  if (!reservations.length) return;

 
  const data = reservations.map((r) => {
    const service = services.find((s) => s.id === r.serviceId);

    return {
      ID: r.id,
      ClienteId: r.userId,
      Servicio: service ? service.name : `Servicio ID ${r.serviceId}`,
      Fecha: r.date
        ? new Date(r.date).toLocaleString("es-CL")
        : "",
      Estado: r.status || "",
      Notas: r.notes || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");

  // Descargar archivo
  XLSX.writeFile(workbook, "reservas.xlsx");
};


  // ----- HANDLERS SERVICIOS -----
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setServiceForm({
      name: "",
      price: "",
      description: "",
      photoUrl: "",
      active: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");

    if (!serviceForm.name || !serviceForm.price) {
      setError("Nombre y precio son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: serviceForm.name,
        price: Number(serviceForm.price),
        description: serviceForm.description || null,
        photoUrl: serviceForm.photoUrl || null,
        active: serviceForm.active,
      };

      const isEditing = editingId !== null;
      const url = isEditing
        ? `${SERVICE_API_BASE}/${editingId}`
        : `${SERVICE_API_BASE}`;
      const method = isEditing ? "PUT" : "POST";

      const res = await authFetch(
        url,
        {
          method,
          body: JSON.stringify(payload),
        },
        user.token
      );

      if (!res.ok) {
        let msg = isEditing
          ? "No se pudo actualizar el servicio."
          : "No se pudo crear el servicio.";
        try {
          const txt = await res.text();
          if (txt) msg = txt;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const saved = await res.json();

      if (isEditing) {
        setServices((prev) =>
          prev.map((s) => (s.id === saved.id ? saved : s))
        );
        setSuccess("Servicio actualizado correctamente.");
      } else {
        setServices((prev) => [...prev, saved]);
        setSuccess("Servicio creado correctamente.");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar servicio.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setServiceForm({
      name: service.name || "",
      price: service.price != null ? service.price : "",
      description: service.description || "",
      photoUrl: service.photoUrl || "",
      active: service.active !== false, // si viene null, lo tratamos como true
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;
    if (!user) return;
    setError("");
    setSuccess("");

    try {
      const res = await authFetch(
        `${SERVICE_API_BASE}/${id}`,
        { method: "DELETE" },
        user.token
      );
      if (!res.ok && res.status !== 204) {
        let msg = "No se pudo eliminar el servicio.";
        try {
          const txt = await res.text();
          if (txt) msg = txt;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) {
        resetForm();
      }
      setSuccess("Servicio eliminado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al eliminar servicio.");
    }
  };

  // ----- HANDLERS RESERVAS -----
  const handleChangeStatus = async (reservationId, newStatus) => {
    if (!user) return;
    setError("");
    setSuccess("");
    setStatusSavingId(reservationId);

    try {
      const res = await authFetch(
        `${RESERVATION_API_BASE}/admin/${reservationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        },
        user.token
      );

      if (!res.ok) {
        throw new Error("No se pudo actualizar el estado de la reserva.");
      }

      const updated = await res.json();
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSuccess("Estado de la reserva actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al actualizar estado de la reserva.");
    } finally {
      setStatusSavingId(null);
    }
  };

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <section className="page-section">
        <div className="container">
          <p>Cargando...</p>
        </div>
      </section>
    );
  }
  // Datos para el gráfico: cantidad de reservas por servicio
const serviceUsageData = React.useMemo(() => {
  if (!reservations.length) return [];

  const counts = {};

  reservations.forEach((r) => {
    const id = r.serviceId;
    counts[id] = (counts[id] || 0) + 1;
  });

  return Object.entries(counts).map(([serviceId, count]) => {
    const service = services.find((s) => s.id === Number(serviceId));
    return {
      serviceName: service ? service.name : `Servicio ${serviceId}`,
      count,
    };
  });
}, [reservations, services]);


  return (
    <section className="page-section" id="admin-services">
      <div className="container">
        {/* ================== PANEL DE SERVICIOS ================== */}
        <h2 className="text-uppercase mb-4">Panel de servicios</h2>
        <p className="text-muted">
          Aquí puedes crear, editar, activar/desactivar y eliminar los servicios
          que los clientes podrán reservar.
        </p>

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

        <div className="row">
          {/* Formulario */}
          <div className="col-md-5">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">
                  {editingId ? "Editar servicio" : "Crear nuevo servicio"}
                </h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={serviceForm.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Precio (CLP)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      value={serviceForm.price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descripción (opcional)</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      value={serviceForm.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">
                      URL de foto (opcional)
                    </label>
                    <input
                      type="text"
                      name="photoUrl"
                      className="form-control"
                      value={serviceForm.photoUrl}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="serviceActive"
                      name="active"
                      checked={serviceForm.active}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="serviceActive"
                    >
                      Servicio activo (visible para los clientes)
                    </label>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-warning flex-grow-1"
                      disabled={saving}
                    >
                      {saving
                        ? "Guardando..."
                        : editingId
                        ? "Actualizar servicio"
                        : "Crear servicio"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetForm}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
          {serviceUsageData.length > 0 && (
                <div className="card shadow-sm mt-4">
                  <div className="card-body">
                    <h5 className="card-title">Uso de servicios</h5>
                    <p className="text-muted">
                      Cantidad de reservas por tipo de servicio.
                    </p>

                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={serviceUsageData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="serviceName" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Reservas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}


          {/* Tabla de servicios */}
          <div className="col-md-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-between">
                  <span>Servicios disponibles</span>
                  {loadingData && (
                    <span className="badge bg-secondary">Cargando...</span>
                  )}
                </h5>

                {services.length === 0 ? (
                  <p className="text-muted mb-0">
                    Aún no has registrado servicios.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Precio</th>
                          <th>Estado</th>
                          <th>Foto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((s) => (
                          <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>
                              {s.price != null
                                ? new Intl.NumberFormat("es-CL", {
                                    style: "currency",
                                    currency: "CLP",
                                  }).format(s.price)
                                : "-"}
                            </td>
                            <td>
                              {s.active ? (
                                <span className="badge bg-success">Activo</span>
                              ) : (
                                <span className="badge bg-secondary">
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td>
                              {s.photoUrl ? (
                                <a
                                  href={s.photoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Ver
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary me-2"
                                onClick={() => handleEdit(s)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(s.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================== PANEL DE RESERVAS ================== */}
        <hr className="my-5" />

        <h2 className="text-uppercase mb-4">Panel de reservas</h2>
        <p className="text-muted">
          Revisa todas las reservas y actualiza su estado según el avance del
          servicio.
        </p>

        <div className="card shadow-sm">
          <div className="card-body">
           <h5 className="card-title d-flex justify-content-between align-items-center">
              <span>Reservas registradas</span>
              <div>
                {loadingReservations && (
                  <span className="badge bg-secondary me-2">Cargando...</span>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={handleExportReservationsToExcel}
                  disabled={!reservations.length}
                >
                  Exportar a Excel
                </button>
              </div>
            </h5>


            {reservations.length === 0 ? (
              <p className="text-muted mb-0">
                No hay reservas registradas por el momento.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente (userId)</th>
                      <th>Servicio</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Notas</th>
                      <th>Fotos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => {
                      const service = services.find(
                        (s) => s.id === r.serviceId
                      );

                      return (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.userId}</td>
                          <td>
                            {service
                              ? service.name
                              : `Servicio ID: ${r.serviceId}`}
                          </td>
                          <td>
                            {r.date
                              ? new Date(r.date).toLocaleString()
                              : "-"}
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={r.status || "PENDING"}
                              onChange={(e) =>
                                handleChangeStatus(r.id, e.target.value)
                              }
                              disabled={statusSavingId === r.id}
                            >
                              {ALL_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ maxWidth: "200px" }}>
                            <small>{r.notes || "-"}</small>
                          </td>
                          <td>
                            {Array.isArray(r.photos) && r.photos.length > 0 ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  window.open(r.photos[0], "_blank")
                                }
                              >
                                Ver foto
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
