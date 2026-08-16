import api from "./client";

export const getTickets = async () => {
  const response = await api.get("/tickets");
  return response.data;
};

export const getTicket = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data;
};

export const getTicketHistory = async (ticketId) => {
  const response = await api.get(
    `/tickets/${ticketId}/history`
  );
  return response.data;
};

export const submitTicket = async (ticketId) => {
  const response = await api.post(
    `/tickets/${ticketId}/submit`
  );
  return response.data;
};

export const checkTicket = async (
  ticketId,
  action,
  remarks
) => {
  const response = await api.post(
    `/tickets/${ticketId}/check`,
    {
      action: action,
      remarks: remarks || null,
    }
  );

  return response.data;
};

export const approveTicket = async (
  ticketId,
  action,
  remarks
) => {
  const response = await api.post(
    `/tickets/${ticketId}/approve`,
    {
      action,
      remarks,
    }
  );

  return response.data;
};

export const closeTicket = async (
  ticketId,
  remarks
) => {
  const response = await api.post(
    `/tickets/${ticketId}/close`,
    {
      action: "closed",
      remarks,
    }
  );

  return response.data;
};