import { createSignal, createEffect } from "solid-js";
import { Switch, Match, For } from "solid-js/web";

type Todo = {
  id: string;
  task: string;
};

function useTodos() {
  const [todos, setTodos] = createSignal<Todo[]>([]);
  const [loading, setLoading] = createSignal<boolean>(true);
  const [error, setError] = createSignal<string | null>(null);

  async function fetchTodos() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/todos");
      const json = await res.json();
      setTodos(json);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setLoading(false);
    }
  }

  createEffect(() => {
    fetchTodos();
  });

  async function addTodo(task: string) {
    try {
      const res = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });
      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateTodo(id: string, newTask: string) {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: newTask }),
      });
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, task: newTask } : todo))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteTodo(id: string) {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE",
      });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    refetchTodos: fetchTodos,
  };
}

export default function App() {
  const { todos, loading, error, addTodo, updateTodo, deleteTodo } = useTodos();
  const [text, setText] = createSignal("");

  return (
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white bg-opacity-80 shadow-lg rounded-md p-8 backdrop-blur-lg backdrop-filter border border-gray-300">
        <h1 class="text-2xl font-bold mb-4 text-center text-gray-800">
          TODO List
        </h1>
        <div class="mb-4 flex flex-row gap-2">
          <input
            class="shadow appearance-none h-10 border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Add new todo"
            value={text()}
            onInput={(e) => setText(e.target.value)}
          />
          <button
            class="mb-4 px-4 h-10 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none whitespace-nowrap"
            onClick={() => {
              addTodo(text());
              setText("");
            }}
          >
            Add Todo
          </button>
        </div>
        <Switch fallback={<p>Loading...</p>}>
          <Match when={error()}>
            <p class="text-red-500">Error: {error()}</p>
          </Match>
          <Match when={!loading()}>
            <For each={todos()} fallback={<p>No todos</p>}>
              {(todo) => (
                <div class="mb-2 flex flex-row gap-2 items-center">
                  <input
                    type="text"
                    value={todo.task}
                    class="border rounded px-2 py-1 focus:outline-none focus:ring focus:border-blue-500 flex-grow bg-gray-50 text-gray-800"
                    onBlur={(e) => {
                      updateTodo(todo.id, e.target.value);
                    }}
                  />
                  <button
                    class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </For>
          </Match>
        </Switch>
      </div>
    </div>
  );
}
