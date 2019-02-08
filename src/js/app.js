// import { TaskTypes } from "./data.js";
// import { $ } from "./utils.js";

class Task {
  constructor({ id, description = "", date, assignee, state, isEditing = false } = {}) {
    this.id = id;
    this.description = description;
    this.date = date;
    this.assignee = assignee;
    this.state = state;
    this.isEditing = isEditing;
  }
  updateTask({ description, date, assignee, state }) {
    this.description = description;
    this.date = date;
    this.assignee = assignee;
    this.state = state;
    this.isEditing = false;
  }
  render() {
    //add form
    if (this.isEditing) {
      return this.renderForm();
    }
    return this.renderDetails();
  }
  renderDetails() {
    return `<div>
    <p>${this.description}</p>
    <p>${this.date}</p>
    <p>${this.assignee}</p>
    <p>${this.state}</p>
    </div>`
  }
  renderForm() {
    return `
      <div class="story-edit-container" data-id="${this.id}" >
        <textarea>${this.description}</textarea>
        <input type="date" />

        <select value="${this.assignee}">
          ${this.assigneeList()}
        </select>
        <select value=${this.state}>
          ${this.getStateOptions()}
        </select>
        <button class="save-task">done</button>
        <button class="cancel-task">cancel</button>
    </div >
      `
  }
  assigneeList() {
    return Object.entries(Users).map(([userId, { name }]) =>
      `<option value = ${userId}> ${name}</option > `
    ).join("")
  }

  getStateOptions() {
    console.log("Object.values(TaskTypes)", Object.values(TaskTypes));
    return Object.values(TaskTypes)
      .map((state) => `<option value = ${state}> ${state}</option > `)
      .join("");
  }
}

class TaskList {
  constructor() {
    this.tasks = [];
  }
  addTask(task) {
    this.tasks = [...this.tasks, task]
  }
}


class TaskType {
  constructor(name, isEditable = true) {
    this.name = name;
    this.taskIds = [];
    this.isEditable = isEditable;
    // this.editingTask = [];
  }

  addTask(taskId) {
    this.taskIds = [...this.taskIds, taskId];
  }

  removeTask(taskId) {
    this.taskIds = this.taskIds.filter(id => id !== taskId);
  }
  addEditingTask(id) {
    this.editingTask = [...this.editingTask, id]
  }
  removeEditingTask(id) {
    this.editingTask = this.editingTask.filter(eId => eId !== id);
  }

  render(tasks) {
    return `<div class= "task-type-container" >
      <h3 class="task-type-title">${this.name}</h3>
      <div class="task-list">
        ${this.renderIndividualTask(tasks)}
        ${this.getAddAnotherTaskHTML()}
      </div>
    </div > `
  }
  renderIndividualTask(tasks) {
    return this.taskIds.map(taskId => {
      let t = tasks.tasks.filter(taskDetails => taskDetails.id === taskId);
      return t[0].render();
    })
      .join("");
  }
  // getAnotherTaskHTML() {
  //   if (!this.isAddingAnotherTask) {
  //     return this.getAddAnotherTaskHTML();
  //   }
  //   return `
  //     <div class="another-task-container">
  //     ${Task.getHTML()}
  //     </div>
  //   `;
  // }
  getAddAnotherTaskHTML() {
    return `<div class="add-another-task" data-type="${this.name}">
      Add another task <i class="fas fa-plus-circle"></i>
    </div>`
  }

  setAddingAnotherTask(status) {
    // this.editingTask = ;
  }

  // addNewTask() {

  // }

}

class TaskManager {
  constructor() {
    this.taskLists = new TaskList();
    this.plannedTasks = new TaskType(TaskTypes.PLANNED, true);
    this.startedTasks = new TaskType(TaskTypes.STARTED, true);
    this.doneTasks = new TaskType(TaskTypes.DONE, false);
  }
  render() {
    return `${this.plannedTasks.render(this.taskLists)}
    ${this.startedTasks.render(this.taskLists)}
    ${this.doneTasks.render(this.taskLists)}`
  }

  updateTask(parent, taskId) {
    if (!parent) {
      const tasks = this.taskLists.tasks.filter(task => task.id == taskId);
      tasks[0].updateTask({ isEditing: false });
      return
    }

    let formElems = parent.children;
    const description = formElems[0].value;
    const date = formElems[1].value;
    const assignee = formElems[2].value;
    const state = formElems[3].value;
    const tasks = this.taskLists.tasks.filter(task => task.id == taskId);
    tasks[0].updateTask({ description, date, assignee, state });



  }
  addNewTask(taskType) {
    const newId = new Date().getTime()
    const newTask = new Task({ id: newId, isEditing: true, state: taskType });
    this.taskLists.addTask(newTask);

    switch (taskType) {
      case TaskTypes.PLANNED: {
        this.plannedTasks.addTask(newId);
        return;
      }
      case TaskTypes.STARTED: {
        this.startedTasks.addTask(newId);
        // this.startedTasks.addEditingTask(newId);
        return;
      }
      case TaskTypes.DONE: {
        this.doneTasks.addTask(newId);
        return;
      }
      default: return;
    }

  }


  moveTask() {

  }
}



class App {
  constructor() {
    this.taskManager = new TaskManager();
  }
  init() {
    this.renderLayout();
  }

  renderLayout() {
    const layout = `<div class="tasks-layout">
        ${this.taskManager.render()}
      </div>`

    const tasksContainer = $("#tasks-container");

    tasksContainer.innerHTML = layout;

    const addAnotherTasks = $(".add-another-task");
    addAnotherTasks.forEach(addTask => {
      addTask.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target;
        const taskType = target.getAttribute("data-type");
        this.taskManager.addNewTask(taskType);
        app.renderLayout();
      });
    })
    const saveTasks = $(".save-task");
    saveTasks.forEach(task => {
      task.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parent = e.target.parentNode;
        const taskId = parent.getAttribute("data-id");
        this.taskManager.updateTask(parent, taskId);
        app.renderLayout();
      })
    });
    const cancelTasks = $(".cancel-task");
    cancelTasks.forEach(task => {
      task.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parent = e.target.parentNode;
        const taskId = parent.getAttribute("data-id");
        this.taskManager.updateTask(null, taskId);
        app.renderLayout();
      })
    });


  }
}
const app = new App();
app.init();








