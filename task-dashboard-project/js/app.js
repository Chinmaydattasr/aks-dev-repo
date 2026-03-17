const STORAGE_KEY = "taskflow_dashboard_tasks";

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const taskTemplate = document.getElementById("taskTemplate");
const emptyState = document.getElementById("emptyState");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const taskCountLabel = document.getElementById("taskCountLabel");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let activeFilter = "all";

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(title, priority, dueDate) {
  return {
    id: crypto.randomUUID(),
    title,
    priority,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString()
  };
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function getFilteredTasks() {
  const search = searchInput.value.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search);

    if (activeFilter === "completed") {
      return matchesSearch && task.completed;
    }

    if (activeFilter === "pending") {
      return matchesSearch && !task.completed;
    }

    return matchesSearch;
  });
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;

  totalTasks.textContent = total;
  completedTasks.textContent = completed;
  pendingTasks.textContent = pending;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  emptyState.style.display = filteredTasks.length ? "none" : "block";
  taskCountLabel.textContent = `${filteredTasks.length} task${filteredTasks.length === 1 ? "" : "s"} available`;

  filteredTasks.forEach((task) => {
    const node = taskTemplate.content.cloneNode(true);
    const card = node.querySelector(".task-card");
    const badge = node.querySelector(".priority-badge");
    const date = node.querySelector(".task-date");
    const title = node.querySelector(".task-title");
    const completeBtn = node.querySelector(".complete-btn");
    const deleteBtn = node.querySelector(".delete-btn");

    badge.textContent = task.priority;
    badge.classList.add(`priority-${task.priority.toLowerCase()}`);
    date.textContent = formatDate(task.dueDate);
    title.textContent = task.title;

    if (task.completed) {
      card.classList.add("completed");
      completeBtn.textContent = "Undo";
    }

    completeBtn.addEventListener("click", () => {
      tasks = tasks.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item
      );
      saveTasks();
      updateStats();
      renderTasks();
    });

    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      updateStats();
      renderTasks();
    });

    taskList.appendChild(node);
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) return;

  const task = createTask(title, taskPriority.value, taskDate.value);
  tasks.unshift(task);

  saveTasks();
  updateStats();
  renderTasks();

  taskForm.reset();
  taskPriority.value = "Medium";
});

searchInput.addEventListener("input", renderTasks);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  updateStats();
  renderTasks();
});

updateStats();
renderTasks();
