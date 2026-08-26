import axios from "axios";
import http from "http";
import https from "https";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";

// Connection pooling to speed up requests
const axiosClient = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  timeout: 60000,
});

/*
=========================================================
OPTIMIZED HIGH-SPEED SYSTEM PROMPT
=========================================================
*/
const SYSTEM_PROMPT = `You are LearnSpace AI, an expert coding tutor inside LearnSpace.

Teaching Guidelines:
- Explain concepts directly and clearly: What it is -> Why it's needed -> How it works -> Runnable Code Example.
- For roadmaps, complete guides, or step-by-step requests: provide the full, comprehensive content without cutting off.
- Keep code clean, modern, fully runnable with necessary imports.

Language Detection:
- Detect user's language: English, Hindi, or natural Hinglish.
- For Hinglish: Explain logic in conversational Hindi, but keep all programming keywords, variables, and technical terms in English.

CRITICAL DIRECTIVE:
- Output ONLY the final user-facing response in clean GitHub Markdown.
- NEVER output internal thinking, planning steps, or meta-phrases (e.g., "Let me think", "Analyze intent", "Here is my reasoning"). Start directly with the answer.`;

/*
=========================================================
CHAT WITH AI
POST /api/ai/chat
=========================================================
*/
export const chatWithAI = async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    /* Validation */
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid message string is required",
      });
    }

    const userMessage = message.trim();
    if (userMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters",
      });
    }

    /* History window */
    const previousMessages = Array.isArray(conversation)
      ? conversation
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string" &&
              item.content.trim(),
          )
          .slice(-6)
          .map((item) => ({
            role: item.role,
            content: item.content.slice(0, 1500),
          }))
      : [];

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...previousMessages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    /* NVIDIA API Call with 4096 tokens to prevent cutting off */
    const response = await axiosClient.post(
      NVIDIA_API_URL,
      {
        model: NVIDIA_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 7000, // FIX: 1200 se badha kar 4096 kiya gaya hai
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const reply = response.data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: "AI returned an empty response",
      });
    }

    return res.status(200).json({
      success: true,
      reply,
      model: NVIDIA_MODEL,
    });
  } catch (error) {
    console.error("NVIDIA AI ERROR:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI service is busy. Please try again in a moment.",
      });
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(500).json({
        success: false,
        message: "NVIDIA API configuration or key error",
      });
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        success: false,
        message: "AI response timed out. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
    });
  }
};
