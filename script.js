document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const themeToggle = document.querySelector('.theme-toggle');
    const progressBar = document.getElementById('progress');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loading = document.getElementById('loading');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateProgress() {
        const completed = tasks.filter(task => task.completed).length;
        const total = tasks.length;
        const percent = total === 0 ? 0 : (completed / total) * 100;
        progressBar.style.width = `${percent}%`;
    }

    function showLoading() {
        loading.style.display = 'block';
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    function hideLoading() {
        loading.style.display = 'none';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function handleResponsiveLayout() {
        const isMobile = window.innerWidth <= 640;
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            if (isMobile) {
                item.querySelector('.task-meta').style.width = '100%';
            } else {
                item.querySelector('.task-meta').style.width = 'auto';
            }
        });
    }

    async function renderTasks(filter = 'all') {
        await showLoading();
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            if (filter === 'active' && task.completed) return;
            if (filter === 'completed' && !task.completed) return;

            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.priority = task.priority || 'low';
            
            taskItem.innerHTML = `
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="custom-checkbox" ${task.completed ? 'checked' : ''}>
                    <i class="fas fa-check check-icon"></i>
                </div>
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <div class="task-meta">
                        <span class="task-category">
                            ${getCategoryIcon(task.category)} ${task.category || 'general'}
                        </span>
                        <span class="task-date">
                            <i class="far fa-clock"></i> ${task.createdAt ? formatDate(task.createdAt) : 'No date'}
                        </span>
                    </div>
                </div>
                <span class="priority-badge priority-${task.priority}">
                    ${getPriorityIcon(task.priority)} ${task.priority}
                </span>
                <div class="task-actions">
                    <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `;

            // Add staggered animation with scale
            taskItem.style.animation = `fadeIn 0.3s ease ${index * 0.1}s both, scale 0.3s ease ${index * 0.1}s both`;

            // Add animation class
            setTimeout(() => taskItem.style.opacity = '1', 10);

            const checkbox = taskItem.querySelector('input');
            checkbox.addEventListener('change', () => toggleTask(index));

            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(index));

            taskList.appendChild(taskItem);
        });
        
        handleResponsiveLayout();
        updateProgress();
        hideLoading();
    }

    function getCategoryIcon(category) {
        const icons = {
            general: '📝',
            work: '💼',
            personal: '🏠',
            shopping: '🛒',
            health: '❤️'
        };
        return icons[category] || icons.general;
    }

    function getPriorityIcon(priority) {
        const icons = {
            low: '🟢',
            medium: '🟡',
            high: '🔴'
        };
        return icons[priority];
    }

    function celebrateCompletion() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    async function addTask(text) {
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        
        const newTask = {
            text,
            completed: false,
            priority,
            category,
            createdAt: new Date().toISOString()
        };

        await showLoading();
        tasks.push(newTask);
        saveTasks();
        await renderTasks();
        
        showNotification(`✨ New ${category} task added!`);
    }

    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        if (tasks[index].completed) {
            celebrateCompletion();
        }
        saveTasks();
        renderTasks();
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove the notification after animation
        notification.addEventListener('animationend', (e) => {
            if (e.animationName === 'slideOutRight') {
                notification.remove();
            }
        });
    }

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', document.body.dataset.theme);
    });

    // Set initial theme
    document.body.dataset.theme = localStorage.getItem('theme') || 'light';

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            addTask(text);
            taskInput.value = '';
        }
    });

    // Add window resize listener
    window.addEventListener('resize', handleResponsiveLayout);

    renderTasks();
});
