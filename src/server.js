// src/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// ✅ Prometheus metrics
const client = require("prom-client");

// dotenv.config();
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

// ====== ✅ Prometheus setup ======
client.collectDefaultMetrics({ prefix: "devops_api_" });

const httpRequestsTotal = new client.Counter({
  name: "devops_api_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "devops_api_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Middleware métriques (avant tes routes)
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();

  res.on("finish", () => {
    // "route" propre quand Express a matché une route, sinon fallback
    const route = req.route?.path || req.path || "unknown";
    const labels = { method: req.method, route, status: String(res.statusCode) };

    httpRequestsTotal.inc(labels);
    end(labels);
  });

  next();
});

// ✅ Endpoint Prometheus
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).send(err?.message || "metrics error");
  }
});

// ====== Config ======
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/devopsdb";

// ====== Modèle simple (Task) ======
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

// ====== Routes ======
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API up & running" });
});

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const task = await Task.create({ title });
  res.status(201).json(task);
});

// ====== Connexion à Mongo + démarrage serveur ======
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB:", MONGO_URL);
    app.listen(PORT, () => {
      console.log(`🚀 API listening on port ${PORT}`);
      console.log(`📈 Metrics available on /metrics`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
