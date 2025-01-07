document.addEventListener("DOMContentLoaded", () => {
  const taskInputCheck = document.querySelector("#inputCheck");
  const taskInput = document.querySelector("#taskInput");
  const form = document.querySelector("#form");
  const linksContainer = document.querySelector(".links");
  const controls = document.querySelector(".todo-list__controls");
  const links = document.querySelectorAll(".link");
  const taskCounter = document.querySelector("#taskCounter");
  const arrow = document.querySelector("#arrow");
  const clearBtn = document.querySelector("#clearBtn");

  function clearTasks() {
    const checkTasks =
      taskInputCheck.querySelectorAll("todo-list__task.checked").length > 0;
    clearBtn.style.opacity = checkTasks ? "1" : "0";
    clearBtn.style.pointerEvents = checkTasks ? "auto" : "none";
  }

  function toggleLinksVisibility() {
    const hasTasks =
      taskInputCheck.querySelectorAll("todo-list__task").length > 0;
    controls.style.display = hasTasks ? "flex" : "none";
    arrow.classList.toggle("visible", hasTasks);
  }

  function updateTaskCounter() {
    const activeTasks = taskInputCheck.querySelectorAll(
      "todo-list__task:not(.checked)"
    ).length;
    taskCounter.textContent = `${activeTasks} item${
      activeTasks !== 1 ? "s" : ""
    } left`;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (taskInput.value.trim() !== "") {
      addTask(taskInput.value, false);
      taskInput.value = "";
      toggleLinksVisibility();
      updateTaskCounter();
      clearTasks();
    }
  });

  function addTask(text, isCompleted) {
    const li = document.createElement("todo-list__task");
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
    label.classList.add("left");

    const uniqueId = `task-${Date.now()}`;
    checkbox.id = uniqueId;
    label.setAttribute("for", uniqueId);

    const span = document.createElement("span");
    span.innerHTML = "\u00d7";

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(span);

    taskInputCheck.appendChild(li);

    label.addEventListener("dblclick", function () {
      editTask(label, li);
    });
  }

  function editTask(label, li) {
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
      label.classList.add("left");

      const uniqueId = `task-${Date.now()}`;
      label.setAttribute("for", uniqueId);

      const checkbox = li.querySelector(".todo-list__checkbox");
      checkbox.id = uniqueId;

      li.replaceChild(label, input);

      label.addEventListener("dblclick", function () {
        editTask(label, li);
      });
    }

    updateTaskCounter();
    toggleLinksVisibility();
    clearTasks();
  }

  clearBtn.addEventListener("click", function () {
    const tasks = taskInputCheck.querySelectorAll("todo-list__task.checked");
    tasks.forEach((task) => task.remove());

    toggleLinksVisibility();
    updateTaskCounter();
    clearTasks();
  });

  taskInputCheck.addEventListener("click", function (event) {
    if (event.target.classList.contains("todo-list__checkbox")) {
      const li = event.target.closest("todo-list__task");
      li.classList.toggle("checked", event.target.checked);
      updateTaskCounter();
      clearTasks();
    }

    if (event.target.tagName === "SPAN") {
      event.target.parentElement.remove();
      toggleLinksVisibility();
      updateTaskCounter();
      clearTasks();
    }
  });

  function showTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTasks.forEach((task) => addTask(task.text, task.isCompleted));
    clearTasks();
  }

  function filterTasks(filter) {
    const tasks = taskInputCheck.querySelectorAll("todo-list__task");
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
    const allTasks = taskInputCheck.querySelectorAll("todo-list__task");
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
  });

  showTasks();
  toggleLinksVisibility();
  updateTaskCounter();
  setDefaultFilter();
});
