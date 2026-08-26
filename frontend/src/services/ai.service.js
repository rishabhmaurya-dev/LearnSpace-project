import api from "./axios";

/*
=========================================================
SEND MESSAGE
=========================================================
*/

export const sendAIMessage = async ({ message, conversation = [] }) => {
  const response = await api.post("/ai/chat", {
    message,
    conversation,
  });

  return response.data;
};
