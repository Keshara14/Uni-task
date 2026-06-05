import mysql.connector
from mysql.connector import Error

DB_CONFIG = {
    'host': 'localhost',          
    'database': 'student_planner', 
    'user': 'root',               
    'password': ''                
                                  
}


def get_db_connection():
    """
    Establish a connection to the MySQL database.
    
    Returns:
        - mysql.connector.connection: Active database connection if successful
        - None: If connection fails
    """
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Database connection error: {e}")
        return None

def execute_query(query, params=None, fetch=False):
    """
    Execute a SQL query (SELECT, INSERT, UPDATE, DELETE).
    
    Args:
        query (str): SQL query string with %s placeholders for parameters
        params (tuple/list, optional): Parameters to bind to query
        fetch (bool): If True, return query results; if False, return last row ID
    
    Returns:
        - For SELECT queries (fetch=True): List of dictionaries (rows)
        - For INSERT/UPDATE/DELETE (fetch=False): Last inserted row ID (or True if successful)
        - None/False: If query execution fails
    
    Example:
        # SELECT query
        tasks = execute_query("SELECT * FROM tasks WHERE user_id = %s", (user_id,), fetch=True)
        
        # INSERT query
        new_id = execute_query("INSERT INTO tasks (user_id, title) VALUES (%s, %s)", 
                              (user_id, title), fetch=False)
    """
    connection = get_db_connection()
    if not connection:
        return None if fetch else False
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute(query, params or ())
        
        if fetch:
            result = cursor.fetchall()
            return result
        else:
            connection.commit()
            return cursor.lastrowid
    except Error as e:
        print(f"Query error: {e}")
        return None if fetch else False
    finally:
        cursor.close()
        connection.close()
