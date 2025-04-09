// №1 Объявляем переменные и константы
const body = document.querySelector(".body");
const app = body.querySelector(".todo-list");

const form = app.querySelector("#form");
const arrow = form.querySelector("#arrow");
const taskInput = form.querySelector("#taskInput");

const filtersContainer = app.querySelector(".todo-list__filters");
const filterButtons = filtersContainer.querySelectorAll(".todo-list__filter");

const tasksContainer = app.querySelector(".todo-list__tasks");

const controlsContainer = app.querySelector(".todo-list__controls");
const taskCounter = controlsContainer.querySelector("#taskCounter");
const clearBtn = controlsContainer.querySelector("#clearBtn");

const taskTemplate = body
  .querySelector("#todo-list__item")
  .content.querySelector(".todo-list__task");

// Глобальные переменные
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let activeFilter = localStorage.getItem("selectedFilter") || "All";

// №2 Объявляем функции в порядке зависимостей
function handleClearBtnVisibility() {
  const hasCheckedTasks = tasks.some((task) => task.isCompleted);
  clearBtn.style.opacity = hasCheckedTasks ? "1" : "0";
  clearBtn.style.pointerEvents = hasCheckedTasks ? "auto" : "none";
}

function updateTaskVisibility() {
  const hasVisibleTask = tasks.length > 0;
  controlsContainer.style.display = hasVisibleTask ? "flex" : "none";
  filtersContainer.style.display = hasVisibleTask ? "flex" : "none";
  arrow.classList.toggle("visible", hasVisibleTask);
}

function refreshTaskCounter() {
  const activeTasks = tasks.filter((task) => !task.isCompleted).length;
  taskCounter.textContent = `${activeTasks} item${
    activeTasks !== 1 ? "s" : ""
  } left`;
}

function saveTasksToLocalStorage() {
  const tasksData = [...tasks];
  localStorage.setItem("tasks", JSON.stringify(tasksData));
}

function updateTasksState() {
  refreshTaskCounter();
  updateTaskVisibility();
  handleClearBtnVisibility();
  saveTasksToLocalStorage();
}

function createTaskData(text, isCompleted = false) {
  const uniqueId = `task-${crypto.randomUUID()}`;
  return { id: uniqueId, text, isCompleted };
}

function appendTaskToList(taskElement) {
  tasksContainer.insertBefore(taskElement, tasksContainer.firstChild);
}

function filterTasks(filter) {
  return tasks.filter(
    (task) =>
      filter === "All" ||
      (filter === "Active" && !task.isCompleted) ||
      (filter === "Completed" && task.isCompleted)
  );
}

function updateTaskText(taskText, editInput, newText) {
  taskText.textContent = newText;
  taskText.style.display = "block";
  editInput.style.display = "none";
}

function removeTask(taskItem, taskId) {
  taskItem.remove();
  tasks = tasks.filter((task) => task.id !== taskId);
  updateTasksState();
}

function cancelEdit(taskText, editInput) {
  taskText.style.display = "block";
  editInput.style.display = "none";
}

function saveEditedTask(editInput, taskItem, taskText) {
  const newText = editInput.value.trim();
  const checkbox = taskItem.querySelector(".todo-list__checkbox");
  const taskId = checkbox.id;

  if (!newText) {
    removeTask(taskItem, taskId);
  } else {
    updateTaskText(taskText, editInput, newText);
    const task = tasks.find((t) => t.id === taskId);
    if (task) task.text = newText;
  }
  updateTasksState();
}

function handleClickOutside(event, taskItem, taskText, editInput) {
  if (!taskItem.contains(event.target)) {
    cancelEdit(taskText, editInput);
    editInput.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("click", handleClickOutside);
  }
}

function handleKeydown(event, taskItem, taskText, editInput) {
  if (event.key === "Enter") {
    saveEditedTask(editInput, taskItem, taskText);
    editInput.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("click", handleClickOutside);
  } else if (event.key === "Escape") {
    cancelEdit(taskText, editInput);
    editInput.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("click", handleClickOutside);
  }
}

function startEditing(taskText, editInput) {
  editInput.style.display = "block";
  taskText.style.display = "none";
  editInput.value = taskText.textContent;
  editInput.focus();
}

function handleCheckTask(event) {
  if (event.target.classList.contains("todo-list__checkbox")) {
    const idValue = event.target.getAttribute("id");
    const task = tasks.find((t) => t.id === idValue);

    if (task) task.isCompleted = !task.isCompleted;
    updateTasksState();
    applyTaskFilter(activeFilter);
  }
}

function deleteTask(taskId, taskElement) {
  tasks = tasks.filter((task) => task.id !== taskId);
  taskElement.remove();
  updateTasksState();
  applyTaskFilter(activeFilter);
}

function createTaskElement(text, isCompleted, id) {
  const taskItem = taskTemplate.cloneNode(true);
  const checkbox = taskItem.querySelector(".todo-list__checkbox");
  const taskText = taskItem.querySelector(".todo-list__text");
  const deleteBtn = taskItem.querySelector(".todo-list__delete-btn");
  const editInput = taskItem.querySelector(".todo-list__edit-input");

  checkbox.id = id;
  taskText.textContent = text;

  if (isCompleted) {
    taskItem.classList.add("checked");
    checkbox.checked = true;
  }

  const onKeydown = (event) =>
    handleKeydown(event, taskItem, taskText, editInput);
  const onClickOutside = (event) =>
    handleClickOutside(event, taskItem, taskText, editInput);

  checkbox.addEventListener("change", handleCheckTask);
  deleteBtn.addEventListener("click", () => deleteTask(id, taskItem));

  taskItem.addEventListener("dblclick", () => {
    startEditing(taskText, editInput);
    editInput.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onClickOutside);
  });

  return taskItem;
}

function renderTasks(filteredTasks) {
  tasksContainer.innerHTML = "";
  filteredTasks.forEach((task) => {
    const taskElement = createTaskElement(task.text, task.isCompleted, task.id);
    appendTaskToList(taskElement);
  });
}

function applyTaskFilter(filter) {
  const filteredTasks = filterTasks(filter);
  renderTasks(filteredTasks);
}

function addTask(text, isCompleted = false) {
  const taskData = createTaskData(text, isCompleted);
  tasks.push(taskData);
  const taskElement = createTaskElement(
    taskData.text,
    taskData.isCompleted,
    taskData.id
  );
  appendTaskToList(taskElement);
}

function loadStoredTasks() {
  tasks.forEach((task) => {
    const taskElement = createTaskElement(task.text, task.isCompleted, task.id);
    appendTaskToList(taskElement);
  });
  updateTaskVisibility();
  handleClearBtnVisibility();
}

function restoreSelectedFilter() {
  filterButtons.forEach((button) => {
    if (button.textContent.trim() === activeFilter) {
      button.classList.add("todo-list__filter_active");
    } else {
      button.classList.remove("todo-list__filter_active");
    }
  });
  applyTaskFilter(activeFilter);
}

// №3 Добавляем слушатели событий
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (taskInput.value.trim()) {
    addTask(taskInput.value, false);
    taskInput.value = "";
    updateTasksState();
  }
});

document.addEventListener("click", (event) => {
  const excludedContainers = [
    form,
    tasksContainer,
    filtersContainer,
    controlsContainer,
  ];
  const isClickInsideExcluded = excludedContainers.some((container) =>
    container.contains(event.target)
  );

  if (isClickInsideExcluded) return;

  if (taskInput.value.trim()) {
    addTask(taskInput.value, false);
    taskInput.value = "";
    updateTasksState();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) =>
      btn.classList.remove("todo-list__filter_active")
    );
    this.classList.add("todo-list__filter_active");
    activeFilter = this.textContent.trim();
    applyTaskFilter(activeFilter);
    localStorage.setItem("selectedFilter", activeFilter);
  });
});

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.isCompleted);
  updateTasksState();
  updateTaskVisibility();
  applyTaskFilter(activeFilter);
});

arrow.addEventListener("click", () => {
  const allChecked = tasks.every((task) => task.isCompleted);
  tasks.forEach((task) => {
    task.isCompleted = !allChecked;
  });

  updateTasksState();
  applyTaskFilter(activeFilter);
  arrow.classList.toggle("completed", !allChecked);
});

loadStoredTasks();
updateTaskVisibility();
refreshTaskCounter();
restoreSelectedFilter();
