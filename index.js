// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js'; //imported all helper functions from TaskFunctions.js
// TASK: import initialData
import { initialData } from  './initialData.js'; //imported initialData from initialData.js

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

//Ensure that the local storage is initialised when the application starts
initializeData();

// TASK: Get elements from the DOM
//fetching the elements and initialising them inside an object so they are easier to access
const elements = {
  // Sidebar elements
  headerBoardName: document.getElementById('header-board-name'),
  sideBar: document.querySelector('.side-bar'),
  sideBarDiv: document.getElementById('side-bar-div'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  sideLogoDiv: document.getElementById('logo'),
  themeSwitch: document.getElementById('switch'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),

  // Primary layout (header, add task button)
  header: document.getElementById('header'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  deleteBoardBtn: document.getElementById('delete-board-btn'),
  dropdownBtn: document.getElementById('dropdownBtn'),
  editBoardBtn: document.getElementById('edit-board-btn'),

  // Primary layout (main area for task columns)
  columnDivs: document.querySelectorAll('.column-div'), // document.getElementsByClassName('column-div'),
  tasksContainer: document.querySelector('.tasks-container'),

  // New Task Modal elements
  modalWindow: document.getElementById('new-task-modal-window'),
  descInput: document.getElementById('desc-input'),
  titleInput: document.getElementById('title-input'),
  selectStatus: document.getElementById('select-status'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),

  // Edit Task Modal elements
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),

  // Filter element
  filterDiv: document.getElementById('filterDiv'),
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  console.log(tasks);
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0];
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });
}

const columnTitles = {
  todo: 'TODO',
  doing: 'DOING',
  done: 'DONE',
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    const columnTitle = columnTitles[status];
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click' ,() => {
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
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Adds task to UI
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild(taskElement); // Add task to the column of the task container
}

// Setup event listeners for various UI actions
function setupEventListeners() {
  // Cancel editing task event listener
  elements.cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; // fixed ternary operator
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task_id = JSON.parse(localStorage.getItem('id')); // Retrieves value from browser's local storage
  const titleInput = elements.titleInput.value; // Captures value entered in an input field, such as a task title.
  const descInput = elements.descInput.value; // Captures value entered in a textarea field, such as a task description.
  const selectStatus = elements.selectStatus.value; // Captures selected value from a dropdown list, indicating the status or category of the task

  //Task object that stores  user input
    const task = {
      //element object has already fetched all the DOM elements
      title: titleInput,  
      desc: descInput,
      status: selectStatus,
      board: activeBoard,
    };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

// function controls the visibility of the sidebar and the button, they work opposite to each other
function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
}
/*
// Get current theme from local storage or set to default (light)
const currentMode = localStorage.getItem('mode') || 'light';
let isLightMode = currentMode === 'light';

let sideLogoDivSrc = isLightMode ? './assets/logo-dark.svg' : './assets/logo-light.svg';
elements.sideLogoDiv.src = sideLogoDivSrc; */

function toggleTheme() {
  // check local storage theme
  if (localStorage.getItem('light-theme') == 'enable') { // if value is enable, the light theme is currently active
    document.body.classList.toggle('light-theme', false);
    localStorage.setItem('light-theme', 'disable'); // disables the light theme from the local storage
    let img = document.getElementById('logo'); // fetches the dark them logo from the DOM
    elements.sideLogoDiv.src = './assets/logo-dark.svg'; // retrieves dark theme logo
  } else {
    document.body.classList.toggle('light-theme', true);
    localStorage.setItem('light-theme', 'enable');
    let img = document.getElementById('logo');
    elements.sideLogoDiv.src = './assets/logo-light.svg';
  }
}

// Opens task editing modal and pre-populates it with existing task data
function openEditTaskModal(task) {
  toggleModal(true, elements.editTaskModal);
  elements.editTaskTitleInput.value = task.title; // Populates task's title in an input field for editing
  elements.editTaskDescInput.value = task.description; // Populates task's description in an input field for editing
  elements.editSelectStatus.value = task.status; // Sets selected status

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn'); // Retrieves element from HTML that represents a button that saves changes made to task
  const deleteTaskBtn = document.getElementById('delete-task-btn'); // Retrieves element from HTML that represents a button that deletes task
  const cancelEditTaskBtn = document.getElementById('cancel-edit-btn');

  // Call saveTaskChanges upon click of Save Changes button
  elements.editTaskForm.addEventListener('click', (event) => {
    event.preventDefault(); // added event handling that prevents the default action of the form submission when we click the save button
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal);
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => { // Included an event listener that triggers deletion of specified task 'deleteTask(task.id)', while also hiding the task modal, and then refreshing the tasks UI 
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
});

  // Close the edit task modal when the cancel button is clicked
  elements.cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
  });

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
  refreshTasksUI();
}

// Save changes made to an existing task and update the UI
function saveTaskChanges(taskId) {
  // Get new user inputs
  const task_id = JSON.parse(localStorage.getItem('id')); // Fetches task ID from local storage
  const titleInput = elements.editTaskTitleInput.value; // Fetches current value entered that aloows users to input/edit title of a task 
  const descriptionInput = elements.editTaskDescInput.value; // Allows users to input/edit description or details of a task 
  const selectStatus = elements.editSelectStatus.value; // Chooses the status of the task

  // Create an object with the updated task details
  const updatedTask = {
    id: task_id,
    title: titleInput,
    description: descriptionInput,
    status: selectStatus,
    board: activeBoard,
  };

  // Update task using a hlper functoin
  patchTask(taskId, updatedTask); // Takes two arguments to update task identified by 'taskId' with new data provided in 'updatedTask'


  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}