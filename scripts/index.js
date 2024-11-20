document.addEventListener("DOMContentLoaded", () => {
  const taskInputCheck = document.querySelector("#inputCheck");
  const taskInput = document.querySelector("#taskInput");
  const form = document.querySelector("#form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (taskInput.value.trim() != "") {
      const li = document.createElement("li");
      li.classList.add("todo-list__task");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("todo-list__checkbox");

      const label = document.createElement("label");
      label.textContent = taskInput.value;
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

      taskInput.value = "";
      saveData();
    }
  });

  taskInputCheck.addEventListener("click", function (event) {
    if (event.target.classList.contains("todo-list__checkbox")) {
      const li = event.target.closest("li");
      if (event.target.checked) {
        li.classList.add("checked");
      } else {
        li.classList.remove("checked");
      }
      saveData();
    } else if (event.target.tagName === "SPAN") {
      event.target.parentElement.remove();
      saveData();
    }
  });

  function saveData() {
    localStorage.setItem("data", taskInputCheck.innerHTML);
  }

  function showTasks() {
    const savedData = localStorage.getItem("data");
    if (savedData) {
      taskInputCheck.innerHTML = savedData;

      document.querySelectorAll(".todo-list__checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
          const li = event.target.closest("li");
          if (event.target.checked) {
            li.classList.add("checked");
          } else {
            li.classList.remove("checked");
          }
        });
      });
    }
  }

  showTasks();
});
