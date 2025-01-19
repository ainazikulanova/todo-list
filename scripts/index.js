document.addEventListener("DOMContentLoaded", () => {
  const taskInputCheck = document.querySelector("#inputCheck");
  const taskInput = document.querySelector("#taskInput");
  const form = document.querySelector("#form");
  const linksContainer = document.querySelector(".links");
  const controls = document.querySelector(".todo-list__controls");
  const links = document.querySelectorAll(".todo-list__link");
  const taskCounter = document.querySelector("#taskCounter");
  const arrow = document.querySelector("#arrow");
  const clearBtn = document.querySelector("#clearBtn");

  function clearTasks() {
    const checkTasks =
      taskInputCheck.querySelectorAll(".todo-list__task.checked").length > 0;
    clearBtn.style.opacity = checkTasks ? "1" : "0";
    clearBtn.style.pointerEvents = checkTasks ? "auto" : "none";
  }

  function toggleLinksVisibility() {
    const hasTasks =
      taskInputCheck.querySelectorAll(".todo-list__task").length > 0;
    controls.style.display = hasTasks ? "flex" : "none";
    arrow.classList.toggle("visible", hasTasks);
  }

  function updateTaskCounter() {
    const activeTasks = taskInputCheck.querySelectorAll(
      ".todo-list__task:not(.checked)"
    ).length;
    taskCounter.textContent = `${activeTasks} item${
      activeTasks !== 1 ? "s" : ""
    } task`;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (taskInput.value.trim() !== "") {
      addTask(taskInput.value, false);
      taskInput.value = "";
      toggleLinksVisibility();
      updateTaskCounter();
      clearTasks();
      saveTasksToLocalStorage();
    }
  });

  function addTask(text, isCompleted) {
    const li = document.createElement("li");
    li.classList.add("todo-list__task");

    if (isCompleted) {
      li.classList.add("checked");
    }

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

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(span);

    const firstTask = taskInputCheck.firstChild;
    if (firstTask) {
      taskInputCheck.insertBefore(li, firstTask);
    } else {
      taskInputCheck.appendChild(li);
    }

    label.addEventListener("click", preventDefaultAction);

    label.addEventListener("dblclick", function (event) {
      event.stopPropagation();
      editTask(li);
    });

    span.addEventListener("click", function () {
      li.remove();
      toggleLinksVisibility();
      updateTaskCounter();
      clearTasks();
      saveTasksToLocalStorage();
    });

    checkbox.addEventListener("click", function () {
      li.classList.toggle("checked", checkbox.checked);
      updateTaskCounter();
      clearTasks();
      saveTasksToLocalStorage();
    });
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

    input.addEventListener("blur", function () {
      saveEditedTask(input, li);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        saveEditedTask(input, li);
      } else if (event.key === "Escape") {
        li.replaceChild(label, input);
      }
    });
  }

  function saveEditedTask(input, li) {
    const newText = input.value.trim();

    if (newText === "") {
      li.remove();
    } else {
      const label = document.createElement("label");
      label.textContent = newText;
      label.classList.add("task");

      const checkbox = li.querySelector(".todo-list__checkbox");
      const uniqueId = checkbox.id;
      label.setAttribute("for", uniqueId);

      li.replaceChild(label, input);

      label.addEventListener("click", preventDefaultAction);

      label.addEventListener("dblclick", function () {
        editTask(li);
      });
    }

    updateTaskCounter();
    toggleLinksVisibility();
    clearTasks();
    saveTasksToLocalStorage();
  }

  function filterTasks(filter) {
    const tasks = taskInputCheck.querySelectorAll(".todo-list__task");
    tasks.forEach((task) => {
      switch (filter) {
        case "all":
          task.style.display = "flex";
          break;
        case "active":
          task.style.display = task.classList.contains("checked")
            ? "none"
            : "flex";
          break;
        case "completed":
          task.style.display = task.classList.contains("checked")
            ? "flex"
            : "none";
          break;
      }
    });
  }

  clearBtn.addEventListener("click", function () {
    const tasks = taskInputCheck.querySelectorAll(".todo-list__task.checked");
    tasks.forEach((task) => task.remove());

    toggleLinksVisibility();
    updateTaskCounter();
    clearTasks();
    saveTasksToLocalStorage();
  });

  function saveTasksToLocalStorage() {
    const tasks = Array.from(
      taskInputCheck.querySelectorAll(".todo-list__task")
    );
    const tasksData = tasks.map((task) => {
      const text = task.querySelector("label").textContent;
      const isCompleted = task.classList.contains("checked");
      return { text, isCompleted };
    });
    localStorage.setItem("tasks", JSON.stringify(tasksData));
  }

  function loadTasksFromLocalStorage() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTasks.forEach((task) => addTask(task.text, task.isCompleted));
    clearTasks();
  }

  links.forEach((link) => {
    link.addEventListener("click", function () {
      links.forEach((a) => a.classList.remove("todo-list__link_active"));
      this.classList.add("todo-list__link_active");

      const filter = this.textContent.toLowerCase();
      filterTasks(filter);
    });
  });

  function setDefaultFilter() {
    const defaultLink = document.querySelector(".link:first-child");
    defaultLink.classList.add("todo-list__link_active");
    filterTasks("all");
  }

  arrow.addEventListener("click", function () {
    const allTasks = taskInputCheck.querySelectorAll(".todo-list__task");
    const allChecked = Array.from(allTasks).every((li) =>
      li.classList.contains("checked")
    );

    allTasks.forEach((li) => {
      const checkbox = li.querySelector(".todo-list__checkbox");
      li.classList.toggle("checked", !allChecked);
      checkbox.checked = !allChecked;
    });

    arrow.classList.toggle("completed", !allChecked);
    updateTaskCounter();
    clearTasks();
    saveTasksToLocalStorage();
  });

  loadTasksFromLocalStorage();
  toggleLinksVisibility();
  updateTaskCounter();
  setDefaultFilter();
});
