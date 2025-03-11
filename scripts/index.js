//№1 Объявляем переменные и константы
const app = document.querySelector(".todo-list");

const form = app.querySelector("#form");
const arrow = form.querySelector("#arrow");
const taskInput = form.querySelector("#taskInput");

const filtersContainer = app.querySelector(".todo-list__filters");
const filterButtons = filtersContainer.querySelectorAll(".todo-list__filter");

const taskInputCheck = app.querySelector(".todo-list__tasks");

const controlsContainer = app.querySelector(".todo-list__controls");
const taskCounter = controlsContainer.querySelector("#taskCounter");
const clearBtn = controlsContainer.querySelector("#clearBtn");

const taskTemplate = app
  .querySelector("#todo-list__item")
  .content.querySelector(".todo-list__task");

const editInputTemplate = app
  .querySelector("#todo-list__edit-input-template")
  .content.querySelector(".todo-list__edit-input");

// Глобальные переменные
let keydownHandler;
let clickOutsideHandler;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

//№2 Объявляем функции
function handleClearBtnVisibility() {
  const hasCheckedTasks = taskInputCheck.querySelector(".checked") !== null;
  clearBtn.style.opacity = hasCheckedTasks ? "1" : "0";
  clearBtn.style.pointerEvents = hasCheckedTasks ? "auto" : "none";
}

function updateTaskVisibility() {
  const hasVisibleTask = !!taskInputCheck.querySelector(".todo-list__task");
  controlsContainer.style.display = hasVisibleTask ? "flex" : "none";
  filtersContainer.style.display = hasVisibleTask ? "flex" : "none";
  arrow.classList.toggle("visible", hasVisibleTask);
}

function refreshTaskCounter() {
  const activeTasks = taskInputCheck.querySelectorAll(
    ".todo-list__task:not(.checked)"
  ).length;
  taskCounter.textContent = `${activeTasks} item${
    activeTasks !== 1 ? "s" : ""
  } left`;
}

function replaceLabelWithInput(taskItem, taskText, editInput) {
  taskItem.replaceChild(editInput, taskText);
  editInput.focus();
}

function addTask(text, isCompleted = false) {
  const taskElement = createTaskElement(text, isCompleted);
  appendTaskToList(taskElement);
  addTaskEventListeners(taskElement);
}

function editTask(taskItem) {
  const taskText = taskItem.querySelector(".todo-list__text");
  if (!taskText) return;

  const editInput = editInputTemplate.cloneNode(true);
  editInput.value = taskText.textContent;
  replaceLabelWithInput(taskItem, taskText, editInput);
  setupEditListeners(taskItem, taskText, editInput);
}

function setupEditListeners(taskItem, taskText, editInput) {
  keydownHandler = (event) =>
    handleKeydown(event, taskItem, taskText, editInput);
  clickOutsideHandler = (event) =>
    handleClickOutside(event, taskItem, taskText, editInput);
  editInput.addEventListener("keydown", keydownHandler);
  document.addEventListener("click", clickOutsideHandler);
}

function handleKeydown(event, taskItem, taskText, editInput) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveEditedTask(editInput, taskItem, taskText);
  } else if (event.key === "Escape") {
    cancelEdit(taskItem, taskText, editInput);
  }
}

function handleClickOutside(event, taskItem, taskText, editInput) {
  if (!taskItem.contains(event.target)) {
    cancelEdit(taskItem, taskText, editInput);
  }
}

function cancelEdit(taskItem, taskText, editInput) {
  if (taskItem.contains(editInput)) {
    taskItem.replaceChild(taskText, editInput);
  }
  removeEditListeners(editInput);
}

function saveEditedTask(editInput, taskItem, taskText) {
  const newText = editInput.value.trim();
  if (!newText) {
    taskItem.remove();
  } else {
    taskText.textContent = newText;
    taskItem.replaceChild(taskText, editInput);
    taskText.addEventListener("dblclick", () => editTask(taskItem));
  }
  updateTasksState();
  removeEditListeners(editInput);
}

function removeEditListeners(editInput) {
  if (keydownHandler) {
    editInput.removeEventListener("keydown", keydownHandler);
  }
  if (clickOutsideHandler) {
    document.removeEventListener("click", clickOutsideHandler);
  }
}

function applyTaskFilter(filter) {
  const tasks = [...taskInputCheck.querySelectorAll(".todo-list__task")];
  tasks.forEach((task) => {
    const isChecked = task.classList.contains("checked");
    task.style.display =
      filter === "All" ||
      (filter === "Active" && !isChecked) ||
      (filter === "Completed" && isChecked)
        ? "flex"
        : "none";
  });
}

function saveTasksToLocalStorage() {
  const tasks = Array.from(taskInputCheck.querySelectorAll(".todo-list__task"));
  const tasksData = tasks.reverse().map((task) => {
    const text = task.querySelector(".todo-list__text").textContent;
    const isCompleted = task.classList.contains("checked");
    return { text, isCompleted };
  });
  localStorage.setItem("tasks", JSON.stringify(tasksData));
}

function loadStoredTasks() {
  const tasksSave = JSON.parse(localStorage.getItem("tasks")) || [];
  tasksSave.forEach((task) => addTask(task.text, task.isCompleted));
  updateTaskVisibility();
  handleClearBtnVisibility();
}

function createTaskElement(text, isCompleted) {
  const taskItem = taskTemplate.cloneNode(true);
  const checkbox = taskItem.querySelector(".todo-list__checkbox");
  const taskText = taskItem.querySelector(".todo-list__text");

  const uniqueId = `task-${crypto.randomUUID()}`;
  checkbox.id = uniqueId;
  taskText.textContent = text;

  if (isCompleted) {
    taskItem.classList.add("checked");
    checkbox.checked = true;
  }
  return taskItem;
}

function appendTaskToList(taskElement) {
  taskInputCheck.insertBefore(taskElement, taskInputCheck.firstChild);
}

function addTaskEventListeners(taskElement) {
  const checkbox = taskElement.querySelector(".todo-list__checkbox");
  const taskText = taskElement.querySelector(".todo-list__text");
  const deleteBtn = taskElement.querySelector(".todo-list__delete-btn");

  checkbox.addEventListener("change", handleCheckTask);

  taskElement.addEventListener("dblclick", () => {
    editTask(taskElement);
  });

  deleteBtn.addEventListener("click", () => {
    const idValue = checkbox.getAttribute("id");
    tasks = tasks.filter((task) => task.id !== idValue);
    taskElement.remove();
    updateTasksState();
  });
}

function handleCheckTask(event) {
  if (event.target.classList.contains("todo-list__checkbox")) {
    const idValue = event.target.getAttribute("id");
    const taskElement = event.target.closest(".todo-list__task");

    tasks.forEach((task) => {
      if (task.id === idValue) {
        task.complete = !task.complete;
      }
    });

    taskElement.classList.toggle("checked", event.target.checked);

    updateTasksState();

    const activeFilterElement = filtersContainer.querySelector(
      ".todo-list__filter_active"
    );
    const activeFilter = activeFilterElement
      ? activeFilterElement.textContent.trim()
      : "All";

    applyTaskFilter(activeFilter);
  }
}

//№3 Добавляем слушатели событий
form.addEventListener("submit", () => {
  if (taskInput.value.trim()) {
    addTask(taskInput.value, false);
    taskInput.value = "";
    updateTasksState();
  }
});

document.addEventListener("click", (event) => {
  const excludedContainers = [
    form,
    taskInputCheck,
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
    const selectedFilter = this.textContent.trim();
    applyTaskFilter(selectedFilter);
    localStorage.setItem("selectedFilter", selectedFilter);
  });
});

clearBtn.addEventListener("click", () => {
  [...taskInputCheck.children]
    .filter((task) => task.classList.contains("checked"))
    .forEach((task) => task.remove());
  updateTasksState();
  updateTaskVisibility();
});

arrow.addEventListener("click", () => {
  const allTasks = taskInputCheck.querySelectorAll(".todo-list__task");
  const allChecked = [...allTasks].every((task) =>
    task.classList.contains("checked")
  );

  allTasks.forEach((task) => {
    const checkbox = task.querySelector(".todo-list__checkbox");
    task.classList.toggle("checked", !allChecked);
    checkbox.checked = !allChecked;
  });

  arrow.classList.toggle("completed", !allChecked);
  updateTasksState();

  const activeFilterElement = filtersContainer.querySelector(
    ".todo-list__filter_active"
  );
  const activeFilter = activeFilterElement
    ? activeFilterElement.textContent.trim()
    : "All";
  applyTaskFilter(activeFilter);
});

function restoreSelectedFilter() {
  const savedFilter = localStorage.getItem("selectedFilter") || "All";
  filterButtons.forEach((button) => {
    if (button.textContent.trim() === savedFilter) {
      button.classList.add("todo-list__filter_active");
    } else {
      button.classList.remove("todo-list__filter_active");
    }
  });
  applyTaskFilter(savedFilter);
}

function updateTasksState() {
  refreshTaskCounter();
  updateTaskVisibility();
  handleClearBtnVisibility();
  saveTasksToLocalStorage();
}

loadStoredTasks();
updateTaskVisibility();
refreshTaskCounter();
restoreSelectedFilter();
