from flask import Flask, render_template, request
import re

app = Flask(__name__)

# Open signup page
@app.route('/')
def home():
    return render_template('signup.html')


# Signup validation
@app.route('/signup', methods=['POST'])
def signup():

    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    confirm_password = request.form['confirm_password']

    # Email Regex Validation
    email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'

    if not re.match(email_pattern, email):
        return "<h2>Invalid Email Address</h2>"

    # Password Length
    if len(password) < 6:
        return "<h2>Password must contain at least 6 characters</h2>"

    # Uppercase Check
    if not re.search(r'[A-Z]', password):
        return "<h2>Password must contain at least 1 uppercase letter</h2>"

    # Number Check
    if not re.search(r'[0-9]', password):
        return "<h2>Password must contain at least 1 number</h2>"

    # Confirm Password Check
    if password != confirm_password:
        return "<h2>Passwords do not match</h2>"

    # Success
    return f"<h2>Welcome {username}! Account Created Successfully.</h2>"


if __name__ == '__main__':
    app.run(debug=True)
