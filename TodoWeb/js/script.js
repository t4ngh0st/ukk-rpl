// ======= Simple ToDo App with Priority, Timestamp, DarkMode, localStorage =======

// Main // Selectors
const priorityFilter = document.getElementById("priority-filter");
const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const prioritySelect = document.getElementById('priority-select');
const unfinishedList = document.getElementById('unfinished-list');
const finishedList = document.getElementById('finished-list');
const searchInput = document.getElementById('search-input');
const darkToggle = document.getElementById('dark-mode-toggle');
const tabButtons = document.querySelectorAll('.tab-button');

// Data store key
const STORAGE_KEY = 'todo_app_v1';

// App state
let todos = []; // { id, text, priority, createdAt, done: bool }

// ------------------ Helpers ------------------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    todos = JSON.parse(raw);
  } catch (e) {
    todos = [];
  }
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function priorityClass(p) {
  if (p === 'Low') return 'priority-low';
  if (p === 'Medium') return 'priority-medium';
  return 'priority-high';
}

// ------------------ Render ------------------
function render() {
  unfinishedList.innerHTML = '';
  finishedList.innerHTML = '';

  const q = searchInput.value.trim().toLowerCase();
  const filter = priorityFilter ? priorityFilter.value : 'All';

  todos.forEach(todo => {
    // search filter
    if (q && !todo.text.toLowerCase().includes(q)) return;
    // priority filter
    if (filter !== "All" && todo.priority !== filter) return;

    const li = document.createElement('li');
    li.className = 'todo-item';
    if (todo.done) li.classList.add('finished');

    const left = document.createElement('div');
    left.className = 'todo-left';

    const meta = document.createElement('div');
    meta.className = 'todo-meta';

    const pBadge = document.createElement('span');
    pBadge.className = priorityClass(todo.priority);
    pBadge.textContent = todo.priority;

    const txt = document.createElement('div');
    txt.className = 'todo-text';
    txt.textContent = todo.text;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'todo-meta todo-date';
    dateSpan.textContent = formatDate(todo.createdAt);

    meta.appendChild(pBadge);
    meta.appendChild(dateSpan);

    left.appendChild(txt);
    left.appendChild(meta);

    // actions
    const actions = document.createElement('div');
    actions.className = 'actions';

    const finishBtn = document.createElement('button');
    finishBtn.className = 'finish';
    finishBtn.innerHTML = todo.done ? '<i class="fa-solid fa-undo"></i>' : '<i class="fa-solid fa-check"></i>';
    finishBtn.title = todo.done ? 'Mark as started' : 'Mark as finished';
    finishBtn.onclick = () => toggleDone(todo.id);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.title = 'Delete';
    delBtn.onclick = () => deleteTodo(todo.id);

    actions.appendChild(finishBtn);
    actions.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(actions);

    if (todo.done) finishedList.appendChild(li);
    else unfinishedList.appendChild(li);
  });
}

// ------------------ Actions ------------------
function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  const priority = prioritySelect.value || 'Medium';

  const newTodo = {
    id: uid(),
    text,
    priority,
    createdAt: Date.now(),
    done: false
  };
  todos.unshift(newTodo); // newest top
  saveTodos();
  render();
  input.value = '';
  input.focus();
}

function deleteTodo(id) {
  if (!confirm('Hapus task ini?')) return;
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function toggleDone(id) {
  todos = todos.map(t => t.id === id ? ({ ...t, done: !t.done }) : t);
  saveTodos();
  render();
}

// ------------------ Tabs ------------------
function showTab(tabName) {
  if (tabName === 'unfinished') {
    unfinishedList.classList.remove('hidden');
    finishedList.classList.add('hidden');
  } else {
    finishedList.classList.remove('hidden');
    unfinishedList.classList.add('hidden');
  }
  tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
}

// ------------------ Dark Mode ------------------
function loadTheme() {
  const dark = localStorage.getItem('darkMode') === 'true';
  if (dark) document.body.classList.add('dark');
}
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

// ------------------ Export / Import ------------------
function exportTodos() {
  const dataStr = JSON.stringify(todos, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `todos_backup_${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function importTodos(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON format");
      todos = imported;
      saveTodos();
      render();
      alert("Import berhasil!");
    } catch (err) {
      alert("Gagal import: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ------------------ Events ------------------
addBtn.addEventListener('click', addTodo);
input.addEventListener('keyup', (e) => { if (e.key === 'Enter') addTodo(); });
searchInput.addEventListener('input', render);
darkToggle.addEventListener('click', toggleTheme);
tabButtons.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
if (priorityFilter) priorityFilter.addEventListener("change", render);

// Export/Import buttons
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
if (exportBtn) exportBtn.addEventListener("click", exportTodos);
if (importFile) importFile.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    importTodos(e.target.files[0]);
    e.target.value = ""; // reset input
  }
});

// ------------------ Init ------------------
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadTodos();
  render();
  showTab('unfinished');
});

