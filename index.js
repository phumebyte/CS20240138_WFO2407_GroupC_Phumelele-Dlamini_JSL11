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

// TASK: Get elements from the DOM
//fetching the elements and initialising them inside an object so they are easier to access
const elements = {
  // Sidebar elements
  sideBarDiv: document.getElementById('side-bar-div'),
  logo: document.getElementById('logo'),
  iconDark: document.getElementById('icon-dark'),
  iconLight: document.getElementById('icon-light'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  logoDiv: document.getElementById('side-logo-div'),


  // Primary layout (header, add task button)
  layout: document.getElementById('layout'),
  header: document.getElementById('header'),
  headerBoardName: document.getElementById('header-board-name'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  editBoardDiv: document.getElementById('editBoardDiv'),

  // Select the task columns elements
  todoHeadDiv: document.getElementById('todo-head-div'),
  todoDot: document.getElementById('todo-dot'),
  toDoText: document.getElementById('toDoText'),
  tasksContainerTodo: document.querySelector('.column-div[data-status="todo"] .tasks-container'),
  doingHeadDiv: document.getElementById('doing-head-div'),
  doingDot: document.getElementById('doing-dot'),
  doingText: document.getElementById('doingText'),
  doneHeadDiv: document.getElementById('done-head-div'),
  doneDot: document.getElementById('done-dot'),
  doneText: document.getElementById('doneText'),
  columnDivs: document.querySelectorAll('.column-div'),

  // New Task Modal elements
  modalWindow: document.getElementById('new-task-modal-window'),
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),
  createTaskBtn: document.getElementById('create-task-btn'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),


  // Edit Task Modal elements
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),

  // Filter element
  filterDiv: document.getElementById('filterDiv'),
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  //console.log(boards.length);
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
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

  // FOLLOWING LOGIC ENSURES THAT EVEN WHEN BOARDS ARE EMPTY IN THE LOCAL STORAGE , THEY ARE STILL DISPLAYED
  //Ensures that Launch Career board is displayed
  if (!boards.includes("Launch Career")){
    boards.push("Launch Career");
  }

  //Ensures that Roadmap Board is displayed
  if (!boards.includes("Roadmap")){
    boards.push("Roadmap");
  }

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

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
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
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    }
    else {
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
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModalWindow));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
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
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
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

  // Assign user input to the task object
    const task = {
      title: elements.titleInput.value,
      description: elements.descInput.value,
      status: elements.selectStatus.value,
      board: activeBoard,
    };

    if(!validateTaskInput(elements.titleInput.value, elements.descInput.value,elements.selectStatus.value)){
      return;
    }

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}

//IMPLEMENT FORM VALIDATION : EXTRA FEATURE
// Function to validate the task inputs
function validateTaskInput(title, description, status) {
  if (!title || title.trim() === '') {
    alert('Task title is required.');
    return false;
  }
  if (!description || description.trim() === '') {
    alert('Task description is required.');
    return false;
  }
  if (!status || status === '') { 
    alert('Task status is required.');
    return false;
  }
  return true; // Return true if all fields are valid
}

function toggleSidebar(show) {
  const navTab = elements.sideBarDiv;

  if (show) {
    navTab.style.display = 'flex';
    elements.showSideBarBtn.style.display = 'none'; 
  } else {
    navTab.style.display = 'none';
    elements.showSideBarBtn.style.display = 'block';
  }
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLightTheme = document.body.classList.contains('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled')
  
  const logoImg = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
  elements.logo.src = logoImg;
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title; // Populates task's title in an input field for editing
  elements.editTaskDescInput.value = task.description; // Populates task's description in an input field for editing
  elements.editSelectStatus.value = task.status; // Sets selected status

  // Get button elements from the task modal
  const saveBtnChanges = elements.saveTaskChangesBtn;
  const deleteButton = elements.deleteTaskBtn;
  // Call saveTaskChanges upon click of Save Changes button
  saveBtnChanges.addEventListener('click', () => {
    saveTaskChanges(task.id);
    
  });

  // Delete task using a helper function and close the task modal
  deleteButton.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModalWindow);
    refreshTasksUI();
  });

  toggleModal(true, elements.editTaskModalWindow); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const editTitle = elements.editTaskTitleInput.value;
  const editDescription = elements.editTaskDescInput.value;
  const editStatus = elements.editSelectStatus.value;

  
  // Create an object with the updated task details
  const editedTask = {
    id: taskId,
    title: editTitle,
    description: editDescription,
    status: editStatus
  }

  // Update task using patchTask helper function
  patchTask(taskId, editedTask);

  
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI();
  location.reload();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  initializeData();
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