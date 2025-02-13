// №1 Объявляем переменные и константы
const app = document.querySelector(".todo-list");
const taskInputCheck = app.querySelector(".todo-list__tasks");
const taskInput = document.querySelector("#taskInput");
const form = app.querySelector("#form");
const filtersContainer = app.querySelector(".todo-list__filters");
const controlsContainer = app.querySelector(".todo-list__controls");
const taskCounter = app.querySelector("#taskCounter");
const arrow = app.querySelector("#arrow");
const clearBtn = app.querySelector("#clearBtn");
const filterButtons = app.querySelectorAll(".todo-list__filter");

// №2 Объявляем функции
function clearTasks() {
  const hasCheckedTasks = taskInputCheck.querySelector(".checked") !== null;
  clearBtn.style.opacity = hasCheckedTasks ? "1" : "0";
  clearBtn.style.pointerEvents = hasCheckedTasks ? "auto" : "none";
}

function toggleLinksVisibility() {
  const hasTask = taskInputCheck.querySelector(".todo-list__task") !== null;
  controlsContainer.style.display = hasTask ? "flex" : "none";
  filtersContainer.style.display = hasTask ? "flex" : "none";
  arrow.classList.toggle("visible", hasTask);
}

function updateTaskCounter() {
  const activeTasks = taskInputCheck.querySelectorAll(
    ".todo-list__task:not(.checked)"
  ).length;
  taskCounter.textContent = `${activeTasks} item${
    activeTasks !== 1 ? "s" : ""
  } left`;
}

function preventDefaultAction(event) {
  event.preventDefault();
}

function editTask(li) {
  const label = li.querySelector("label");
  if (!label) return;

  const currentText = label.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.classList.add("edit-input");

  li.replaceChild(input, label);
  input.focus();

  input.addEventListener("blur", () => saveEditedTask(input, li));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveEditedTask(input, li);
    if (event.key === "Escape") {
      input.value = currentText;
      li.replaceChild(label, input);
    }
  });
}

function saveEditedTask(input, li) {
  const newText = input.value.trim();
  if (!newText) {
    li.remove();
  } else {
    const label = document.createElement("label");
    label.textContent = newText;
    label.classList.add("task");
    const checkbox = li.querySelector(".todo-list__checkbox");
    label.setAttribute("for", checkbox.id);

    li.replaceChild(label, input);
    label.addEventListener("click", preventDefaultAction);
    label.addEventListener("dblclick", () => editTask(li));
  }
  updateTaskCounter();
  toggleLinksVisibility();
  clearTasks();
  saveTasksToLocalStorage();
}

function filterTasks(filter) {
  document.querySelectorAll(".todo-list__task").forEach((task) => {
    switch (filter) {
      case "All":
        task.style.display = "flex";
        break;
      case "Active":
        task.style.display = task.classList.contains("checked")
          ? "none"
          : "flex";
        break;
      case "Completed":
        task.style.display = task.classList.contains("checked")
          ? "flex"
          : "none";
        break;
    }
  });
}

function saveTasksToLocalStorage() {
  const tasks = [...taskInputCheck.children].map((task) => ({
    text: task.querySelector("label").textContent,
    isCompleted: task.classList.contains("checked"),
  }));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach((task) => addTask(task.text, task.isCompleted));
  clearTasks();
}

// Функция добавления задачи
function addTask(text, isCompleted) {
  const li = document.createElement("li");
  li.classList.add("todo-list__task");
  if (isCompleted) li.classList.add("checked");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("todo-list__checkbox");
  checkbox.checked = isCompleted;

  const label = document.createElement("label");
  label.textContent = text;
  label.classList.add("task");

  const uniqueId = `task-${Date.now()}`;
  checkbox.id = uniqueId;
  label.setAttribute("for", uniqueId);

  const span = document.createElement("span");
  span.innerHTML = "\u00d7";

  li.append(checkbox, label, span);
  taskInputCheck.insertBefore(li, taskInputCheck.firstChild);

  label.addEventListener("click", preventDefaultAction);
  li.addEventListener("dblclick", () => editTask(li));
  span.addEventListener("click", () => {
    li.remove();
    toggleLinksVisibility();
    updateTaskCounter();
    clearTasks();
    saveTasksToLocalStorage();
  });

  checkbox.addEventListener("change", () => {
    li.classList.toggle("checked", checkbox.checked);
    updateTaskCounter();
    clearTasks();
    saveTasksToLocalStorage();
  });
}

// №3 Добавляем слушатели событий
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (taskInput.value.trim()) {
    addTask(taskInput.value, false);
    taskInput.value = "";
    toggleLinksVisibility();
    updateTaskCounter();
    clearTasks();
    saveTasksToLocalStorage();
  }
});

// Фильтрация задач
filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) =>
      btn.classList.remove("todo-list__filter_active")
    );
    this.classList.add("todo-list__filter_active");
    filterTasks(this.textContent.trim());
  });
});

// Очистка выполненных задач
clearBtn.addEventListener("click", () => {
  document
    .querySelectorAll(".todo-list__task.checked")
    .forEach((task) => task.remove());
  toggleLinksVisibility();
  updateTaskCounter();
  clearTasks();
  saveTasksToLocalStorage();
});

// Кнопка выбора всех задач
arrow.addEventListener("click", () => {
  const allTasks = document.querySelectorAll(".todo-list__task");
  const allChecked = [...allTasks].every((task) =>
    task.classList.contains("checked")
  );

  allTasks.forEach((task) => {
    const checkbox = task.querySelector(".todo-list__checkbox");
    task.classList.toggle("checked", !allChecked);
    checkbox.checked = !allChecked;
  });

  arrow.classList.toggle("completed", !allChecked);
  updateTaskCounter();
  clearTasks();
  saveTasksToLocalStorage();

  const activeFilterElement = document.querySelector(
    ".todo-list__filter_active"
  );
  const activeFilter = activeFilterElement
    ? activeFilterElement.textContent.trim()
    : "All";
  filterTasks(activeFilter);
});

// Загружаем сохраненные задачи при старте
loadTasksFromLocalStorage();
toggleLinksVisibility();
updateTaskCounter();
filterTasks("All");
