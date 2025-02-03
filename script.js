const taskInput = document.getElementById("task-input");
const taskImageInput = document.getElementById("task-image");
const addTaskButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");

const listInput = document.getElementById("list-name");
const createListButton = document.getElementById("create-list");
const listsContainer = document.getElementById("lists");
const currentListName = document.getElementById("current-list-name");

const fontSelect = document.getElementById("font-style");
const colorPicker = document.getElementById("theme-color");
const applyThemeButton = document.getElementById("apply-theme");

let lists = JSON.parse(localStorage.getItem("lists")) || {};
let activeList = null;
let currentFilter = "all";

// Save lists to localStorage
const saveLists = () => {
    localStorage.setItem("lists", JSON.stringify(lists));
};

// Render available lists
const renderLists = () => {
    listsContainer.innerHTML = "";
    Object.keys(lists).forEach(listName => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="list-name">${listName}</span>
            <button class="delete-list" data-list="${listName}">🗑️</button>
        `;

        listItem.className = listName === activeList ? "active-list" : "";

        listItem.querySelector(".list-name").addEventListener("click", () => {
            activeList = listName;
            renderTasks(currentFilter);
            renderLists();
            applyTheme(); // 🔥 Fix: Apply theme when switching lists
            currentListName.textContent = listName;
        });

        listItem.querySelector(".delete-list").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteList(listName);
        });

        listsContainer.appendChild(listItem);
    });
};

// **🔥 Fix: Apply theme correctly when switching lists**
const applyTheme = () => {
    if (!activeList || !lists[activeList].theme) return;

    const { font, color } = lists[activeList].theme;

    document.querySelector(".todo-container").style.fontFamily = font;
    document.querySelector(".todo-container").style.backgroundColor = color;

    fontSelect.value = font;
    colorPicker.value = color;
};

// Delete a to-do list
const deleteList = (listName) => {
    if (confirm(`Are you sure you want to delete the list "${listName}"? This cannot be undone.`)) {
        delete lists[listName];
        saveLists();

        if (activeList === listName) {
            activeList = null;
            taskList.innerHTML = "";
            currentListName.textContent = "Select a list";
        }

        renderLists();
        applyTheme();
    }
};

// Render tasks for the selected list
const renderTasks = (filter = "all") => {
    taskList.innerHTML = "";
    if (!activeList) return;

    currentFilter = filter;
    const tasks = lists[activeList].tasks || [];

    tasks
        .filter(task => {
            if (filter === "completed") return task.completed;
            if (filter === "pending") return !task.completed;
            return true;
        })
        .forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
            taskItem.dataset.index = index;

            taskItem.innerHTML = `
                <div class="task-content">
                    <span class="task-text ${task.completed ? "task-done" : ""}">${task.text}</span>
                    ${task.image ? `<img src="${task.image}" class="task-image" alt="Task Image">` : ""}
                </div>
                <div class="task-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            // Toggle task completion
            taskItem.querySelector(".task-text").addEventListener("click", () => {
                tasks[index].completed = !tasks[index].completed;
                saveLists();
                renderTasks(currentFilter);
            });

            taskItem.querySelector(".edit-btn").addEventListener("click", () => {
                const newText = prompt("Edit task:", task.text);
                if (newText !== null) {
                    tasks[index].text = newText;
                    saveLists();
                    renderTasks(currentFilter);
                }
            });

            taskItem.querySelector(".delete-btn").addEventListener("click", () => {
                tasks.splice(index, 1);
                saveLists();
                renderTasks(currentFilter);
            });

            taskList.appendChild(taskItem);
        });

    filterButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active");
};

// **🔥 Fix: Create a new list with proper theme initialization**
createListButton.addEventListener("click", () => {
    const listName = listInput.value.trim();
    
    if (!listName) {
        alert("List name cannot be empty.");
        return;
    }
    
    if (lists[listName]) {
        alert("A list with this name already exists.");
        return;
    }

    lists[listName] = {
        tasks: [],
        theme: { font: "Arial, sans-serif", color: "#4caf50" }
    };

    activeList = listName;
    saveLists();
    renderLists();
    renderTasks(currentFilter);
    applyTheme(); // 🔥 Fix: Ensure new list applies default theme
    currentListName.textContent = listName;
    listInput.value = "";
});

// Add new task with image support
addTaskButton.addEventListener("click", () => {
    if (!activeList) {
        alert("Select or create a list first!");
        return;
    }
    const text = taskInput.value.trim();
    const file = taskImageInput.files[0];

    if (text) {
        let imageData = "";
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                imageData = reader.result;
                lists[activeList].tasks.push({ text, completed: false, image: imageData });
                taskInput.value = "";
                taskImageInput.value = "";
                saveLists();
                renderTasks(currentFilter);
            };
            reader.readAsDataURL(file);
        } else {
            lists[activeList].tasks.push({ text, completed: false, image: "" });
            taskInput.value = "";
            saveLists();
            renderTasks(currentFilter);
        }
    }
});

// **🔥 Fix: Apply theme updates when changed**
applyThemeButton.addEventListener("click", () => {
    if (!activeList) return;
    
    lists[activeList].theme = {
        font: fontSelect.value,
        color: colorPicker.value
    };

    saveLists();
    applyTheme();
});

// Initialize the app
renderLists();
renderTasks(currentFilter);
applyTheme();
