// src/api/client.js

// URLs base de cada microservicio
export const AUTH_API_BASE = "http://localhost:8080/api/auth";
export const VEHICLE_API_BASE = "http://localhost:8082/api/vehicles";
export const RESERVATION_API_BASE = "http://localhost:8083/api/reservations";
export const SERVICE_API_BASE = "http://localhost:8084/api/services";

// Helper para agregar el header Authorization con el token JWT
export function authFetch(url, options = {}, token) {
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
