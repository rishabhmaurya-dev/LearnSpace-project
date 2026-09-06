import api from "./axios";

export const sendAIMessage = async ({ message, conversation = [] }) => {
  const response = await api.post(
    "/ai/chat",
    {
      message,
      conversation,
    },
    {
      timeout: 300000,
    },
  );

  return response.data;
};

// streaming ai chat: feeds each SSE text delta to onDelta

const parseSseEvents = (text) => {
  const events = [];

  let cursor = 0;

  let idx;

  while ((idx = text.indexOf("\n\n", cursor)) !== -1) {
    const block = text.slice(cursor, idx);

    cursor = idx + 2;

    for (const line of block.split("\n")) {
      if (line.startsWith("data:")) {
        try {
          events.push(JSON.parse(line.slice(5).trim()));
        } catch {
          // skip malformed lines
        }
      }
    }
  }

  return events;
};

export const streamAIMessage = async (
  { message, conversation = [] },
  { onDelta, onError } = {},
) => {
  let consumed = 0;

  const flush = (text) => {
    const raw = String(text || "");

    // Find the last complete event boundary ("\n\n") so we never parse a
    // half-received event. Anything after it is buffered for the next flush.
    const boundary = raw.lastIndexOf("\n\n");

    const end = boundary === -1 ? 0 : boundary + 2;

    if (end <= consumed) return;

    const chunk = raw.slice(consumed, end);

    consumed = end;

    for (const event of parseSseEvents(chunk)) {
      if (typeof event.delta === "string") {
        onDelta?.(event.delta);
      }

      if (event.error) {
        onError?.(event.error);
      }
    }
  };

  try {
    const response = await api.post(
      "/ai/chat",
      {
        message,
        conversation,
        stream: true,
      },
      {
        timeout: 300000,
        responseType: "text",
        onDownloadProgress: (progress) => {
          flush(progress.currentTarget?.responseText || "");
        },
      },
    );

    flush(response.data || "");
  } catch (error) {
    if (error.response?.status === 429) {
      onError?.("Too many requests. Please wait a moment and try again.");
    } else if (error.response?.status === 403) {
      onError?.("You don't have access to this feature.");
    } else if (error.response?.status === 401) {
      onError?.("Session expired. Please log in again.");
    } else {
      throw error;
    }
  }
};