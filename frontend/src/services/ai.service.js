import api from "./axios";

export const sendAIMessage = async ({ message, conversation = [] }) => {
  const response = await api.post(
    "/ai/chat",
    {
      message,
      conversation,
    },
    {
      timeout: 100000,
    },
  );

  return response.data;
};
