import express from "express";
import bodyParser from "body-parser";
import { webcrypto } from "crypto";

const app = express();
const port = process.env.PORT || 5000;

interface Todo {
  id: string;
  task: string;
}

let todosMap: Map<string, Todo> = new Map();

app.use(bodyParser.json());

// Enable CORS
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Get all todos
app.get("/todos", (_req, res) => {
  const todos: Todo[] = Array.from(todosMap.values());
  res.json(todos);
});

// Add a new todo
app.post("/todos", (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }
  const newTodo: Todo = {
    id: webcrypto.randomUUID(),
    task,
  };
  todosMap.set(newTodo.id, newTodo);
  res.status(201).json(newTodo);
});

// Update a todo
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  const todoToUpdate = todosMap.get(id);
  if (!todoToUpdate) {
    return res.status(404).json({ error: "Todo not found" });
  }
  if (task) {
    todoToUpdate.task = task;
  }
  res.json(todoToUpdate);
});

// Delete a todo
app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  if (!todosMap.has(id)) {
    return res.status(404).json({ error: "Todo not found" });
  }
  todosMap.delete(id);
  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
