// TASK: import helper functions from utils
// TASK: import initialData
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  filterDiv: document.getElementById("filterDiv"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.querySelector(".modal-window"),
  themeSwitch: document.getElementById("switch"),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; // Added :
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName); // Added equality operator
  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status").trim().toLowerCase();

    // Reset column content while preserving the column title
    column.innerHTML = ` <div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status) // Added equality operator
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    // Changed foreach to capital E
    if (btn.textContent === boardName) {
      btn.classList.add("active"); // Added active class
    } else {
      btn.classList.remove("active");
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  } else {
    console.error("Failed to create task.");
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div");

  if (show) {
    sidebar.style.display = "block";
    elements.showSideBarBtn.style.display = "none";
    localStorage.setItem("showSideBar", "true");
  } else {
    sidebar.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
    localStorage.setItem("showSideBar", "false");
  }
}

const lightIcon = document.getElementById("icon-light");
const darkIcon = document.getElementById("icon-dark");
const checkbox = document.getElementById("switch");
const logo = document.getElementById("logo");

function toggleTheme() {
  const isLightTheme = checkbox.checked;

  if (isLightTheme) {
    // If checked, show light theme icon and hide dark theme
    logo.src = "./assets/logo-light.svg"; // Light mode logo
    lightIcon.style.display = "block";
    document.body.classList.add("light-theme");
    localStorage.setItem("light-theme", "enabled"); // Save the preference in localStorage
  } else {
    // If not checked, show dark theme icon and hide light theme
    logo.src = "./assets/logo-dark.svg"; // Dark mode logo
    darkIcon.style.display = "block";
    document.body.classList.remove("light-theme");
    localStorage.setItem("light-theme", "disabled"); // Save the preference in localStorage
  }
}
checkbox.addEventListener("change", toggleTheme);

function openEditTaskModal(task) {
  // Set task details in modal inputs
  const taskTitleInput = document.getElementById("edit-task-title-input");
  const taskDescInput = document.getElementById("edit-task-desc-input");
  const taskStatusInput = document.getElementById("edit-select-status");

  taskTitleInput.value = task.title;
  taskDescInput.value = task.description;
  taskStatusInput.value = task.status;
  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");
  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.onclick = function () {
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal);
  };
  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = function () {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);

    refreshTasksUI(); // Ensure the task list is reloaded
  };

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const taskTitleInput = document.getElementById("edit-task-title-input").value;
  const taskDescInput = document.getElementById("edit-task-desc-input").value;
  const taskStatusInput = document.getElementById("edit-select-status").value;
  // Create an object with the updated task details
  patchTask(taskId, {
    title: taskTitleInput,
    description: taskDescInput,
    status: taskStatusInput,
  });
  // Update task using a hlper functoin
  toggleModal(true, elements.editTaskModal);
  // Close the modal and refresh the UI to reflect the changes
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  initializeData();
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
