import axios from "axios";
import https from "https";

const NVIDIA_EMBEDDING_URL = "https://integrate.api.nvidia.com/v1/embeddings";

const EMBEDDING_MODEL = "nvidia/nemotron-3-embed-1b";

export async function generateEmbedding(text, inputType = "query") {
  const response = await axios.post(
    NVIDIA_EMBEDDING_URL,
    {
      input: text,
      model: EMBEDDING_MODEL,
      input_type: inputType,
      encoding_format: "float",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      httpsAgent: new https.Agent({ keepAlive: true }),
      timeout: 120000,
    },
  );

  return response.data.data[0].embedding;
}
