import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import careerRoutes from './routes/career.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
// Configure CORS
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ DB error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);
// Root route
app.get("/", (req, res) => {
  res.send("CareerCatalyst Backend Running 🚀");
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
