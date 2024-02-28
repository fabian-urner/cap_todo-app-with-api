"use strict";

//CONFIG
const TODO_ROUTE = "http://localhost:4730/todos";

//Elements
const formNewToDo = document.getElementById("add-todo");
const inputNewToDo = document.getElementById("todo-text");

const fieldsetFilterList = document.getElementById("filter");

const btnRemoveDoneTodos = document.getElementById("btn-remove-done");

const ulToDoList = document.getElementById("todoList");
//State
const state = {
  todos: [],
  filter: "all",
};

//Render
function render() {
  ulToDoList.innerHTML = "";
  state.todos.forEach((todo) => {
    switch (state.filter) {
      case "open":
        if (todo.done) return;
        break;
      case "done":
        if (!todo.done) return;
        break;
    }

    const liTodo = document.createElement("li");

    const checkboxTodo = document.createElement("input");
    checkboxTodo.type = "checkbox";
    checkboxTodo.id = todo.id;
    checkboxTodo.checked = todo.done;
    liTodo.appendChild(checkboxTodo);

    const labelTodo = document.createElement("label");
    labelTodo.setAttribute("for", todo.id);
    labelTodo.textContent = todo.description;
    liTodo.appendChild(labelTodo);

    ulToDoList.appendChild(liTodo);
  });
}
//Refresh
function refresh() {
  fetch(TODO_ROUTE)
    .then((res) => res.json())
    .then((todos) => {
      state.todos = todos;
      render();
    });
}

//Eventlistener
window.addEventListener("load", refresh());

formNewToDo.addEventListener("submit", (e) => {
  e.preventDefault();
  addNewTodo();
});

fieldsetFilterList.addEventListener("click", (e) => {
  const filter = e.target.value;
  if (filter) state.filter = filter;
  render();
});

ulToDoList.addEventListener("click", (e) => {
  changeTodoStatus(e.target);
});

btnRemoveDoneTodos.addEventListener("click", (e) => {
  removeDoneTodos();
});

// Functions
function addNewTodo() {
  fetch(TODO_ROUTE, {
    method: "POST",
    body: JSON.stringify({
      description: inputNewToDo.value,
      done: false,
    }),
    headers: { "Content-Type": "application/json" },
  }).then((res) => {
    if (res.ok) {
      inputNewToDo.value = "";
      refresh();
    }
  });
}

function patchTodo(todo) {
  fetch(TODO_ROUTE + "/" + todo.id, {
    method: "PATCH",
    body: JSON.stringify(todo),
    headers: { "Content-Type": "application/json" },
  }).then((res) => {
    if (res.ok) refresh();
  });
}

function changeTodoStatus(element) {
  const tempTodo = {
    id: 0,
    done: false,
  };

  if (!(element.nodeName === "INPUT")) {
    switch (element.nodeName) {
      case "LI":
        element = element.childNodes[0];
        break;
      case "LABEL":
        return;
    }
    element.checked = !element.checked;
  }

  tempTodo.id = element.id;
  tempTodo.done = element.checked;

  patchTodo(tempTodo);
}

function removeDoneTodos() {
  state.todos.forEach((todo) => {
    if (todo.done) fetch(TODO_ROUTE + "/" + todo.id, { method: "DELETE" });
  });

  refresh();
}
