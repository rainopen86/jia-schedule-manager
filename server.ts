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

// Seed Database if empty
const itemCount = db.prepare("SELECT COUNT(*) as count FROM items").get() as { count: number };
if (itemCount.count === 0) {
  const days = ['월', '화', '수', '목', '금'];
  const times = [
    { name: '아침활동', start: '08:30', end: '09:00', color: '#FEF9C3' },
    { name: '1교시', start: '09:00', end: '09:40' },
    { name: '2교시', start: '09:50', end: '10:30' },
    { name: '3교시', start: '10:40', end: '11:20' },
    { name: '4교시', start: '11:30', end: '12:10' },
    { name: '5교시', start: '12:20', end: '13:00' },
    { name: '점심시간', start: '13:00', end: '13:50', color: '#DCFCE7' },
    { name: '6교시', start: '13:50', end: '14:30' },
  ];

  const subjects: Record<string, string[]> = {
    '월': ['영어', '체육', '국어', '사회', '도덕'],
    '화': ['국어', '수학', '사회', '과학', '체육', '음악'],
    '수': ['영어', '수학', '사회', '과학', '음악'],
    '목': ['국어', '수학', '과학', '미술', '미술'],
    '금': ['국어', '국어', '체육', '수학', '창체'],
  };

  const colorMap: Record<string, string> = {
    '국어': '#FEE2E2', '수학': '#E0F2FE', '영어': '#F3E8FF', '사회': '#FFEDD5',
    '과학': '#DCFCE7', '체육': '#FEF9C3', '미술': '#FCE7F3', '음악': '#E0F2FE',
    '도덕': '#DCFCE7', '창체': '#DCFCE7',
  };

  const insertItem = db.prepare("INSERT INTO items (id, title, day, startTime, endTime, location, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  
  days.forEach(day => {
    times.forEach((time) => {
      let title = time.name;
      let color = time.color || '#F3F4F6';
      if (time.name.includes('교시')) {
        const subjectIdx = parseInt(time.name) - 1;
        const subject = subjects[day][subjectIdx];
        if (subject) {
          title = subject;
          color = colorMap[subject] || color;
        } else return;
      }
      insertItem.run(Math.random().toString(36).substr(2, 9), title, day, time.start, time.end, null, color);
    });
  });
}

const noteCount = db.prepare("SELECT COUNT(*) as count FROM notes").get() as { count: number };
if (noteCount.count === 0) {
  db.prepare("INSERT INTO notes (id, content, createdAt) VALUES (?, ?, ?)")
    .run('default-note', '사제동행 아침 독서 활동', new Date().toISOString());
}

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
