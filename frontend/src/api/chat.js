import api from "./client";

export async function sendChatMessage(message) {
  const response = await api.post("/chat", {
    message,
  });

  return response.data;
}