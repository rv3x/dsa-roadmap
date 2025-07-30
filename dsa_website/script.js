// script.js - Handles state persistence and progress tracking for the DSA roadmap.

/**
 * Initialize page based on its purpose. Run this on DOMContentLoaded.
 */
function init() {
  // Determine page type based on elements present.
  if (document.querySelector('.task-list')) {
    // We're on the roadmap page; initialise checkboxes.
    initialiseCheckboxes();
  }
  if (document.getElementById('progressBar')) {
    // We're on the progress page; compute and display progress.
    updateProgressSummary();
    initDailyLog();
    renderWeekSummary();
  }
}

/**
 * Initialise checkboxes on the roadmap by loading their state from localStorage and
 * attaching event listeners to persist changes.
 */
function initialiseCheckboxes() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    const id = checkbox.id;
    // Load saved state; default to false.
    const saved = localStorage.getItem(id);
    if (saved !== null) {
      checkbox.checked = saved === 'true';
    }
    // Save state on change.
    checkbox.addEventListener('change', () => {
      localStorage.setItem(id, checkbox.checked);
    });
  });
}

/**
 * Calculate overall progress across all tasks and update the UI.
 */
function updateProgressSummary() {
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  // Identify all keys in localStorage that correspond to tasks (w#t#).
  const keys = Object.keys(localStorage).filter((k) => /^w\d+t\d+$/.test(k));
  // There are 12 weeks with 4 tasks each on the roadmap.
  const TOTAL_TASKS = 48;
  let completed = 0;
  keys.forEach((key) => {
    if (localStorage.getItem(key) === 'true') {
      completed++;
    }
  });
  const percent = TOTAL_TASKS > 0 ? Math.round((completed / TOTAL_TASKS) * 100) : 0;
  progressText.textContent = `You have completed ${completed} of ${TOTAL_TASKS} tasks (${percent}%).`;
  if (progressBar) {
    progressBar.style.width = percent + '%';
  }
}

/**
 * Initialise the daily problem log functionality.
 */
function initDailyLog() {
  const input = document.getElementById('problemInput');
  const btn = document.getElementById('addLogBtn');
  const logList = document.getElementById('logList');

  // Retrieve existing logs or initialize empty array.
  let logs = [];
  const stored = localStorage.getItem('problemLogs');
  if (stored) {
    try {
      logs = JSON.parse(stored);
    } catch (e) {
      logs = [];
    }
  }

  // Render existing logs.
  renderLogList(logs, logList);

  // Add new log entry.
  btn.addEventListener('click', () => {
    const count = parseInt(input.value, 10);
    if (isNaN(count) || count < 0) {
      alert('Please enter a valid number.');
      return;
    }
    const entry = {
      date: new Date().toLocaleDateString('en-GB'),
      count: count
    };
    logs.push(entry);
    localStorage.setItem('problemLogs', JSON.stringify(logs));
    input.value = '';
    renderLogList(logs, logList);
  });
}

/**
 * Render the daily problem logs into the provided list element.
 * @param {Array<{date:string, count:number}>} logs 
 * @param {HTMLElement} logList 
 */
function renderLogList(logs, logList) {
  logList.innerHTML = '';
  if (logs.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No entries yet.';
    logList.appendChild(li);
    return;
  }
  logs.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.date}: ${entry.count} problem${entry.count === 1 ? '' : 's'}`;
    logList.appendChild(li);
  });
}

/**
 * Generate week‑wise summary showing completed vs total tasks for each week.
 */
function renderWeekSummary() {
  const container = document.getElementById('weekSummary');
  if (!container) return;
  container.innerHTML = '';
  // Predefined tasks per week (4 tasks each week in this roadmap).
  const tasksPerWeek = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4,
    7: 4, 8: 4, 9: 4, 10: 4, 11: 4, 12: 4
  };
  // Render summary for each week.
  for (let week = 1; week <= 12; week++) {
    const totalTasks = tasksPerWeek[week] || 0;
    let completed = 0;
    for (let task = 1; task <= totalTasks; task++) {
      const key = `w${week}t${task}`;
      if (localStorage.getItem(key) === 'true') {
        completed++;
      }
    }
    const percent = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    const div = document.createElement('div');
    div.classList.add('week-summary-item');
    div.style.marginBottom = '0.5rem';
    div.innerHTML = `<strong>Week ${week}:</strong> ${completed}/${totalTasks} tasks completed (${percent}%)`;
    container.appendChild(div);
  }
}

// Initialise when DOM is ready.
document.addEventListener('DOMContentLoaded', init);