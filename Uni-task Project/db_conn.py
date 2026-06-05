import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password=""
)

mycursor = mydb.cursor()

mycursor.execute("CREATE DATABASE studentdatabase")

mycursor.execute("USE studentdatabase")

create_table_query = """
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
)
"""

mycursor.execute(create_table_query)

print("Users table created successfully!")

mycursor.close()
mydb.close()
