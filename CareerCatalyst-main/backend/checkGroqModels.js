// checkGroqModels.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function getGroqModels() {
  try {
    const response = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });

    console.log("\n✅ Available Groq Models:\n");
    response.data.data.forEach((model, index) => {
      console.log(`${index + 1}. ${model.id}`);
    });

    console.log("\nTotal models found:", response.data.data.length, "\n");
  } catch (error) {
    console.error("\n❌ Error fetching Groq models:");
    console.error(error.response?.data || error.message);
  }
}

getGroqModels();
