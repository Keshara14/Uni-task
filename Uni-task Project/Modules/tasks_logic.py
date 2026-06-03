from flask import Flask, render_template
import mysql.connector

app = Flask(__name__)

# Database settings
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',
    'database': 'academic_db'
}

@app.route('/dashboard')
def dashboard():
    # Connect to MySQL
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True) # Fetch rows as dictionaries
    
    # 3. Data Fetching process
    cursor.execute("SELECT id, title, description, category, due_date, status FROM tasks")
    tasks = cursor.fetchall()
    
    # Calculating stats for summary cards
    total_tasks = len(tasks)
    completed = sum(1 for t in tasks if t['status'] == 'Completed')
    pending = total_tasks - completed
    rate = (completed / total_tasks * 100) if total_tasks > 0 else 0.0
    
    cursor.close()
    conn.close()
    
    # Passing data to HTML template
    return render_template('dashboard.html', 
                           tasks=tasks, 
                           total_tasks=total_tasks, 
                           completed=completed, 
                           pending=pending, 
                           rate=rate)

if __name__ == '__main__':
    app.run(debug=True)
    
