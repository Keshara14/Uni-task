from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'student-planner-secret-key-2024'

from Modules.login_route import authenticate_user
from Modules.verify import register_user
from Modules.tasks_logic import get_user_tasks, create_task, update_task_status, get_task_summary
from Modules.timer import get_tasks_due_in_one_hour, get_upcoming_tasks
from Modules.search import search_tasks, filter_tasks_by_category, filter_tasks_by_status
from Modules.modify import delete_task, update_task

from db_conn import execute_query


def login_required(route_function):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return route_function(*args, **kwargs)
    wrapper.__name__ = route_function.__name__
    return wrapper


@app.route('/')
def index():
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username_or_email = request.form.get('username')
        password = request.form.get('password')
        user, message = authenticate_user(username_or_email, password)
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['email'] = user['email']
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error=message)
    return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        success, message = register_user(username, email, password, confirm_password)
        if success:
            return render_template('signup.html', success=message)
        else:
            return render_template('signup.html', error=message)
    return render_template('signup.html')


@app.route('/dashboard')
@login_required
def dashboard():
    try:
        user_id = session['user_id']
        category = request.args.get('category')
        status = request.args.get('status')
        search = request.args.get('search')

        if search:
            tasks = search_tasks(user_id, search)
        elif category or status:
            tasks = get_user_tasks(user_id, status=status, category=category)
        else:
            tasks = get_user_tasks(user_id)

        summary = get_task_summary(user_id)
        upcoming_tasks = get_upcoming_tasks(user_id, 48)
        due_in_one_hour = get_tasks_due_in_one_hour(user_id)

        return render_template('dashboard.html',
                               tasks=tasks,
                               summary=summary,
                               upcoming_tasks=upcoming_tasks,
                               due_in_one_hour=due_in_one_hour,
                               username=session['username'])
    except Exception as e:
        print(f"Dashboard error: {e}")
        import traceback
        traceback.print_exc()
        tasks = [
            {'id': 1, 'title': 'Test Task 1', 'status': 'pending', 'category': 'assignment', 'deadline': datetime.now()},
            {'id': 2, 'title': 'Test Task 2', 'status': 'completed', 'category': 'exam', 'deadline': datetime.now()}
        ]
        summary = {
            'total': 2, 'completed': 1, 'pending': 1, 'completion_rate': 50.0,
            'categories': {'assignment': 1, 'exam': 1, 'lecture': 0, 'other': 0}
        }
        upcoming_tasks = [
            {'title': 'Upcoming Task', 'deadline_formatted': 'Tomorrow 2:00 PM', 'hours_remaining': 24}
        ]
        return render_template('dashboard.html',
                               tasks=tasks,
                               summary=summary,
                               upcoming_tasks=upcoming_tasks,
                               due_in_one_hour=[],
                               username=session.get('username', 'Test User'))


@app.route('/task/create', methods=['POST'])
@login_required
def task_create():
    user_id = session['user_id']
    create_task(
        user_id,
        request.form.get('title'),
        request.form.get('description', ''),
        request.form.get('category', 'other'),
        request.form.get('deadline')
    )
    return redirect(url_for('dashboard'))


@app.route('/task/<int:task_id>/update', methods=['POST'])
@login_required
def task_update(task_id):
    user_id = session['user_id']
    update_task(
        task_id, user_id,
        title=request.form.get('title'),
        description=request.form.get('description'),
        category=request.form.get('category'),
        deadline=request.form.get('deadline'),
        status=request.form.get('status')
    )
    return redirect(url_for('dashboard'))


@app.route('/task/<int:task_id>/delete', methods=['POST'])
@login_required
def task_delete(task_id):
    user_id = session['user_id']
    delete_task(task_id, user_id)
    return redirect(url_for('dashboard'))


@app.route('/task/<int:task_id>/toggle-status', methods=['POST'])
@login_required
def task_toggle_status(task_id):
    user_id = session['user_id']
    status = request.form.get('status', 'pending')
    update_task_status(task_id, user_id, status)
    return redirect(url_for('dashboard'))


@app.route('/notifications')
@login_required
def notifications():
    user_id = session['user_id']
    due_in_one_hour = get_tasks_due_in_one_hour(user_id)
    upcoming_tasks = get_upcoming_tasks(user_id, 24)
    return render_template('notifications.html',
                           due_in_one_hour=due_in_one_hour,
                           upcoming_tasks=upcoming_tasks,
                           username=session['username'])


@app.route('/init-db')
def init_db():
    try:
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        for statement in statements:
            if statement:
                print(f"Executing: {statement[:50]}...")
                execute_query(statement, fetch=False)
        return "Database initialized successfully! <a href='/'>Go to login</a>"
    except Exception as e:
        return f"Database initialization failed: {e}"


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
