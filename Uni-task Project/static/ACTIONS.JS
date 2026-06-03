/* ========================================
   ACTIONS.JS - All Interactive JavaScript
   
   This file contains ALL JavaScript functionality:
   - Edit/Delete operations
   - Task status toggle
   - Filter and search
   - Modal handling
   - Toast notifications
   ======================================== */

// Export functions to global scope for HTML event handlers
window.toggleStatus = toggleStatus;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.showAddTaskModal = showAddTaskModal;
window.closeModal = closeModal;
window.filterTasks = filterTasks;
window.searchTasks = searchTasks;

let currentEditTaskId = null;

// ========================================
// TASK STATUS TOGGLE (Complete/Incomplete)
// ========================================

async function toggleStatus(taskId, isChecked) {
    const status = isChecked ? 'completed' : 'pending';
    
    try {
        const response = await fetch(`/api/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        // Optimistic UI Update: change style immediately
        const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.classList.toggle('completed-task', isChecked);
        }
        
        showToast('Task status updated!', 'success');
        
        // Brief delay before reload so users can see the smooth transition & update counters
        setTimeout(() => location.reload(), 800);

    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Could not update status. Please try again.', 'error');
    }
}

// ========================================
// DELETE TASK FUNCTION
// ========================================

async function deleteTask(taskId) {
    const confirmed = confirm('⚠️ Are you sure you want to delete this task?\n\nThis action cannot be undone!');
    if (!confirmed) return;
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Delete request failed');
        }

        const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
        if (taskCard) {
            // Apply a sleek fade-out animation before removing from DOM
            taskCard.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                taskCard.remove();
                showToast('Task deleted successfully!', 'success');
                setTimeout(() => location.reload(), 400);
            }, 300);
        } else {
            location.reload();
        }

    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task.', 'error');
    }
}

// ========================================
// EDIT TASK FUNCTION
// ========================================

async function editTask(taskId) {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks list');
        
        const tasks = await response.json();
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            showToast('Task data not found.', 'error');
            return;
        }

        currentEditTaskId = taskId;
        
        // Populate form details
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.category;
        
        // Convert to datetime-local friendly format (YYYY-MM-DDTHH:MM)
        if (task.deadline) {
            const deadline = new Date(task.deadline);
            const formattedDeadline = deadline.toISOString().slice(0, 16);
            document.getElementById('taskDeadline').value = formattedDeadline;
        }
        
        // Trigger modal appearance
        document.getElementById('taskModal').classList.add('show');

    } catch (error) {
        console.error('Error loading task details:', error);
        showToast('Failed to load task data.', 'error');
    }
}

// ========================================
// MODAL MANAGEMENT
// ========================================

function showAddTaskModal() {
    currentEditTaskId = null;
    document.getElementById('modalTitle').textContent = 'Add New Task';
    
    const taskForm = document.getElementById('taskForm');
    if (taskForm) taskForm.reset();
    
    document.getElementById('taskId').value = '';
    document.getElementById('taskModal').classList.add('show');
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('show');
}

// Trigger action when form is submitted
document.getElementById('taskForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        category: document.getElementById('taskCategory').value,
        deadline: document.getElementById('taskDeadline').value
    };

    if (!taskData.title) {
        showToast('Please provide a task title.', 'error');
        return;
    }
    
    try {
        const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';
        const method = taskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Save request failed');
        
        showToast(taskId ? 'Task updated successfully!' : 'Task created successfully!', 'success');
        closeModal();
        
        setTimeout(() => location.reload(), 500);

    } catch (error) {
        console.error('Error saving task:', error);
        showToast('An error occurred while saving the task.', 'error');
    }
});

// ========================================
// FILTER AND SEARCH CONTROLS
// ========================================

async function filterTasks() {
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const status = document.getElementById('statusFilter')?.value || 'all';
    
    let queryParams = [];
    if (category !== 'all') queryParams.push(`category=${category}`);
    if (status !== 'all') queryParams.push(`status=${status}`);
    
    const url = queryParams.length > 0 ? `/api/tasks?${queryParams.join('&')}` : '/api/tasks';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Filtering failed');
        
        const tasks = await response.json();
        renderTaskCards(tasks);
    } catch (error) {
        console.error('Error filtering tasks:', error);
    }
}

async function searchTasks() {
    const searchTerm = document.getElementById('searchInput')?.value.trim();
    
    // Reset back to normal view if user clears the search field
    if (!searchTerm) {
        filterTasks();
        return;
    }
    
    if (searchTerm.length < 2) return; // Wait till user inputs at least 2 chars
    
    try {
        const response = await fetch(`/api/tasks?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Search request failed');
        
        const tasks = await response.json();
        renderTaskCards(tasks);
    } catch (error) {
        console.error('Error searching tasks:', error);
    }
}

// ========================================
// DYNAMIC COMPONENT RENDERING
// ========================================

function renderTaskCards(tasks) {
    const grid = document.getElementById('tasksGrid');
    if (!grid) return;
    
    if (!tasks || tasks.length === 0) {
        grid.innerHTML = '<div class="no-tasks">No tasks found <i class="fas fa-smile-wink"></i></div>';
        return;
    }
    
    grid.innerHTML = tasks.map(task => {
        const isCompleted = task.status === 'completed';
        return `
            <div class="task-card ${isCompleted ? 'completed-task' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <span class="task-category category-${task.category}">
                        ${getCategoryIcon(task.category)} ${capitalize(task.category)}
                    </span>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="window.editTask(${task.id})" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="window.deleteTask(${task.id})" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3>${escapeHtml(task.title)}</h3>
                <p>${escapeHtml(task.description || 'No description provided.')}</p>
                <div class="task-footer">
                    <div class="deadline">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formatDate(task.deadline)}</span>
                    </div>
                    <label class="checkbox-label">
                        <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                               onchange="window.toggleStatus(${task.id}, this.checked)">
                        <span>Complete</span>
                    </label>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// HELPER UTILITIES
// ========================================

function getCategoryIcon(category) {
    const icons = {
        'assignment': '📝',
        'exam': '📚',
        'lecture': '🎓',
        'other': '📌'
    };
    return icons[category] || '📌';
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    if (!dateString) return 'No Deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Dynamic Toast Notifications
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Applied structured modern inline styles
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease forwards;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(toast);
    
    // Seamless automatic self-destruct
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Global UI Animations Setup
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Window backdrop clicking triggers close modal
window.addEventListener('click', function(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeModal();
    }
});
