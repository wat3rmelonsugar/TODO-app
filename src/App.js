import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent } from "./components/ui/Card";
import { Select } from "./components/ui/Select";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import { Trash, Check, Plus, Edit, Calendar, List, ArrowUp } from "lucide-react";
import Modal from "./components/ui/Modal";

export default function TodoApp() {
  const [notebooks, setNotebooks] = useState([]);
  const [newNotebook, setNewNotebook] = useState("");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("low");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotebookId, setEditingNotebookId] = useState(null);
  const [editingTodo, setEditingTodo] = useState({ notebookId: null, todoId: null, text: "", priority: "low" });
  const [notebookPriority, setNotebookPriority] = useState("low");

  // Восстановление данных из localStorage
  useEffect(() => {
    try {
      const savedData = JSON.parse(localStorage.getItem("notebooks"));
      if (savedData) setNotebooks(savedData);

      const savedSearch = localStorage.getItem("search");
      if (savedSearch) setSearch(savedSearch);

      const savedPriority = localStorage.getItem("priority");
      if (savedPriority) setPriority(savedPriority);
    } catch (error) {
      console.error("Ошибка при загрузке данных из localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (notebooks.length > 0) {
      localStorage.setItem("notebooks", JSON.stringify(notebooks));
    }
  }, [notebooks]);

  const addNotebook = () => {
    if (!newNotebook.trim()) return;
    setNotebooks([
      ...notebooks,
      {
        id: uuidv4(),
        title: newNotebook,
        priority: notebookPriority,
        todos: [],
        createdAt: new Date(),
        sortType: "none", // Добавляем поле sortType
      },
    ]);
    setNewNotebook("");
    setIsModalOpen(false);
    setNotebookPriority("low");
  };

  const editNotebook = () => {
    if (!newNotebook.trim()) return;
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === editingNotebookId
          ? { ...nb, title: newNotebook, priority: notebookPriority }
          : nb
      )
    );
    setNewNotebook("");
    setIsModalOpen(false);
    setEditingNotebookId(null);
    setNotebookPriority("low");
  };

  const deleteNotebook = (notebookId) => {
    setNotebooks(notebooks.filter((nb) => nb.id !== notebookId));
  };

  const addTodo = (notebookId, text) => {
    if (!text.trim()) return;
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              todos: [
                ...nb.todos,
                { id: uuidv4(), text, priority, done: false, createdAt: new Date() },
              ],
            }
          : nb
      )
    );
  };

  const editTodo = () => {
    const { notebookId, todoId, text, priority } = editingTodo;
    if (!text.trim()) return;
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              todos: nb.todos.map((todo) =>
                todo.id === todoId ? { ...todo, text, priority } : todo
              ),
            }
          : nb
      )
    );
    setEditingTodo({ notebookId: null, todoId: null, text: "", priority: "low" });
  };

  const toggleTodo = (notebookId, todoId) => {
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              todos: nb.todos.map((todo) =>
                todo.id === todoId ? { ...todo, done: !todo.done } : todo
              ),
            }
          : nb
      )
    );
  };

  const deleteTodo = (notebookId, todoId) => {
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId
          ? { ...nb, todos: nb.todos.filter((todo) => todo.id !== todoId) }
          : nb
      )
    );
  };

  const sortTodos = (todos, sortType) => {
    const sortedTodos = [...todos].sort((a, b) => {
      if (a.done && !b.done) return 1; // Завершённые задачи в конце
      if (!a.done && b.done) return -1;

      switch (sortType) {
        case "date":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "alphabet":
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });
    return sortedTodos;
  };

  const getNotebookColor = (priority) => {
    switch (priority) {
      case "high":
        return "#FFCDD2"; // Светло-розовый для high
      case "medium":
        return "#FFF9C4"; // Светло-желтый для medium
      case "low":
        return "#C8E6C9"; // Светло-зеленый для low
      default:
        return "#FFFFFF"; // Белый как дефолт
    }
  };

  const sortNotebooks = (notebooks) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...notebooks].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  };

  const filterNotebooksByTodoSearch = (notebooks, searchQuery) => {
    if (!searchQuery) return notebooks;

    return notebooks
      .map((nb) => ({
        ...nb,
        todos: nb.todos.filter((todo) =>
          todo.text.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((nb) => nb.todos.length > 0); // Оставляем только блокноты с подходящими заметками
  };

  const setNotebookSortType = (notebookId, sortType) => {
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId ? { ...nb, sortType } : nb
      )
    );
  };

  return (
    <div className="container">
      <h1>TODO - Список дел</h1>

      {/* Верхняя панель */}
      <div className="top-panel">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus />
        </Button>

        <div>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск заметок..."
        />
        </div>
      </div>

      {/* Модальное окно для добавления/редактирования блокнота */}
<Modal isOpen={isModalOpen}>
  <h2>{editingNotebookId ? "Редактировать блокнот" : "Новый блокнот"}</h2>
  <Input
    value={newNotebook}
    onChange={(e) => setNewNotebook(e.target.value)}
    placeholder="Название блокнота"
  />
  <Select
    value={notebookPriority}
    onChange={(e) => setNotebookPriority(e.target.value)}
    options={[
      { value: "high", label: "🔥 Высокий" },
      { value: "medium", label: "⚡ Средний" },
      { value: "low", label: "✅ Низкий" },
    ]}
  />
  <div>
    <Button onClick={editingNotebookId ? editNotebook : addNotebook}>
      {editingNotebookId ? "Сохранить" : "Создать"}
    </Button>
    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Закрыть</Button>

  </div>
</Modal>

{/* Модальное окно для редактирования заметки */}
<Modal isOpen={!!editingTodo.notebookId}>
  <h2>Редактировать задачу</h2>
  <Input
    value={editingTodo.text}
    onChange={(e) =>
      setEditingTodo({ ...editingTodo, text: e.target.value })
    }
    placeholder="Текст задачи"
  />
  <Select
    value={editingTodo.priority}
    onChange={(e) =>
      setEditingTodo({ ...editingTodo, priority: e.target.value })
    }
    options={[
      { value: "high", label: "🔥 Высокий" },
      { value: "medium", label: "⚡ Средний" },
      { value: "low", label: "✅ Низкий" },
    ]}
  />
  <div >
    
    <Button onClick={editTodo}>Сохранить</Button>
    <Button variant="outline" onClick={() => setEditingTodo({ notebookId: null, todoId: null, text: "", priority: "low" })}>
      Закрыть
    </Button>
  </div>
</Modal>


      {/* Список блокнотов */}
      <div className="notebook-list">
        {sortNotebooks(filterNotebooksByTodoSearch(notebooks, search)).map((nb) => (
          <div
            key={nb.id}
            className="notebook-container"
            style={{ backgroundColor: getNotebookColor(nb.priority) }}
          >
            <Card>
              <CardContent>
              <div className="notebook-header">
  <div>
    <h2>{nb.title}</h2>
    <div className="created-at text-sm text-gray-500">
      Создан: {new Date(nb.createdAt).toLocaleString()}
    </div>
  </div>
  <div className="notebook-actions">
    <Button
      size="icon"
      variant="outline"
      onClick={() => {
        setEditingNotebookId(nb.id);
        setNewNotebook(nb.title);
        setNotebookPriority(nb.priority);
        setIsModalOpen(true);
      }}
    >
      <Edit />
    </Button>
    <Button
      size="icon"
      variant="destructive"
      onClick={() => deleteNotebook(nb.id)}
    >
      <Trash />
    </Button>
  </div>
</div>

                <div className="todo-input">
                  <Input
                    placeholder="Добавить задачу"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addTodo(nb.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    options={[
                      { value: "high", label: "🔥 Высокий" },
                      { value: "medium", label: "⚡ Средний" },
                      { value: "low", label: "✅ Низкий" },
                    ]}
                  />
                </div>

                <div className="sort-buttons">
                  <Button
                    size="icon"
                    variant={nb.sortType === "date" ? "primary" : "outline"}
                    onClick={() => setNotebookSortType(nb.id, "date")}
                  >
                    <Calendar />
                  </Button>
                  <Button
                    size="icon"
                    variant={nb.sortType === "priority" ? "primary" : "outline"}
                    onClick={() => setNotebookSortType(nb.id, "priority")}
                  >
                    <List />
                  </Button>
                  <Button
                    size="icon"
                    variant={nb.sortType === "alphabet" ? "primary" : "outline"}
                    onClick={() => setNotebookSortType(nb.id, "alphabet")}
                  >
                    <ArrowUp />
                  </Button>
                </div>

                <ul className="todo-list">
                  {sortTodos(nb.todos, nb.sortType).map((todo) => (
                    <motion.li
                      key={todo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={todo.done ? "done" : ""}
                    >
                      <span>{todo.text} <span className={`priority-${todo.priority}`}>({todo.priority})</span></span>
                      <div className="todo-buttons">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => toggleTodo(nb.id, todo.id)}
                        >
                          <Check />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            setEditingTodo({
                              notebookId: nb.id,
                              todoId: todo.id,
                              text: todo.text,
                              priority: todo.priority,
                            })
                          }
                        >
                          <Edit />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteTodo(nb.id, todo.id)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}