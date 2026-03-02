import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import Database from "better-sqlite3";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.NODE_ENV === "production" ? "/data/schedule.db" : "schedule.db";
const db = new Database(dbPath);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    day TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    location TEXT,
    color TEXT
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // API Routes
  app.get("/api/items", (req, res) => {
    const items = db.prepare("SELECT * FROM items").all();
    res.json(items);
  });

  app.get("/api/notes", (req, res) => {
    const notes = db.prepare("SELECT * FROM notes ORDER BY createdAt DESC").all();
    res.json(notes);
  });

  // WebSocket logic
  const broadcast = (data: any, sender?: WebSocket) => {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== sender) {
        client.send(message);
      }
    });
  };

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { type, payload } = data;

        switch (type) {
          case "ITEM_CREATE":
            db.prepare("INSERT INTO items (id, title, day, startTime, endTime, location, color) VALUES (?, ?, ?, ?, ?, ?, ?)")
              .run(payload.id, payload.title, payload.day, payload.startTime, payload.endTime, payload.location, payload.color);
            broadcast({ type, payload }, ws);
            break;
          case "ITEM_UPDATE":
            db.prepare("UPDATE items SET title = ?, day = ?, startTime = ?, endTime = ?, location = ?, color = ? WHERE id = ?")
              .run(payload.title, payload.day, payload.startTime, payload.endTime, payload.location, payload.color, payload.id);
            broadcast({ type, payload }, ws);
            break;
          case "ITEM_DELETE":
            db.prepare("DELETE FROM items WHERE id = ?").run(payload.id);
            broadcast({ type, payload }, ws);
            break;
          case "NOTE_CREATE":
            db.prepare("INSERT INTO notes (id, content, createdAt) VALUES (?, ?, ?)")
              .run(payload.id, payload.content, payload.createdAt);
            broadcast({ type, payload }, ws);
            break;
          case "NOTE_DELETE":
            db.prepare("DELETE FROM notes WHERE id = ?").run(payload.id);
            broadcast({ type, payload }, ws);
            break;
        }
      } catch (err) {
        console.error("WS Error:", err);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
