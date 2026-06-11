window.editTask = editTask;
window.closeModal = closeModal;
window.showAddTaskModal = showAddTaskModal;

function showAddTaskModal() {
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskForm').action = '/task/create';
    document.getElementById('taskModal').classList.add('show');
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('show');
}

function editTask(taskId) {
    var card = document.querySelector('.task-card[data-task-id="' + taskId + '"]');
    if (!card) return;

    var task = JSON.parse(card.getAttribute('data-task-json'));

    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskCategory').value = task.category;

    var deadline = new Date(task.deadline);
    var formattedDeadline = deadline.toISOString().slice(0, 16);
    document.getElementById('taskDeadline').value = formattedDeadline;

    document.getElementById('taskForm').action = '/task/' + taskId + '/update';
    document.getElementById('taskModal').classList.add('show');
}

function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle') + '"></i><span>' + message + '</span>';
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:' + (type === 'success' ? '#4caf50' : '#f44336') + ';color:white;padding:12px 24px;border-radius:8px;z-index:9999;animation:slideIn 0.3s ease;box-shadow:0 2px 10px rgba(0,0,0,0.2);font-family:Inter,sans-serif;font-size:14px;display:flex;align-items:center;gap:10px;';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

var style = document.createElement('style');
style.textContent = '\
    @keyframes fadeOut {\
        from { opacity: 1; transform: translateX(0); }\
        to { opacity: 0; transform: translateX(100px); }\
    }\
    @keyframes slideIn {\
        from { opacity: 0; transform: translateX(100px); }\
        to { opacity: 1; transform: translateX(0); }\
    }\
';
document.head.appendChild(style);

window.onclick = function(event) {
    var modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeModal();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    var revealElements = document.querySelectorAll('.stat-card, .card, .breakdown-box, .upcoming-task-item, .task-card');
    revealElements.forEach(function(el, index) {
        el.classList.add('scroll-reveal-item');
        var delay = (index % 4) * 100;
        el.style.setProperty('--reveal-delay', delay + 'ms');
    });

    var revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    revealElements.forEach(function(el) { revealObserver.observe(el); });
});
