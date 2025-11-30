import { authFetch, RESERVATION_API_BASE } from "../api/client.js";

async function handleChangeStatus(reservationId, newStatus, token, reload) {
  const res = await authFetch(
    `${RESERVATION_API_BASE}/admin/${reservationId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    },
    token
  );

  if (!res.ok) {
    // manejar error
    return;
  }

  // recarga lista o actualiza estado local
  reload();
}
