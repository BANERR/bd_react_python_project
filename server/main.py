from flask import Flask, jsonify, request
import psycopg2
from flask_cors import CORS
import jwt
import datetime
from config import host, user, password, db_name
import secrets

app = Flask(__name__)
CORS(app)  
SECRET_KEY = secrets.token_hex(32) 

def get_db_connection():
    connection = psycopg2.connect(
        host=host,
        user=user,
        password=password,
        dbname=db_name
    )
    return connection

def create_tables():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id serial PRIMARY KEY,
                full_name varchar(50) NOT NULL,
                email varchar(50) NOT NULL,
                password varchar(50) NOT NULL,
                status varchar(50) NOT NULL,
                loginned boolean NOT NULL
            );
        """)
        connection.commit()
        connection.close()
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")


# ------------------------------------------ Registration -------------------------------------------------------------------

@app.route('/api/user/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()  
        full_name = data['full_name']
        email = data['email']
        password = data['password']
        status = 'user' 
        loginned = False 

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """INSERT INTO users (full_name, email, password, status, loginned) 
            VALUES (%s, %s, %s, %s, %s);""",
            (full_name, email, password, status, loginned)
        )
        connection.commit()
        connection.close()
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data['email']
    password = data['password']

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE email = %s AND password = %s;", 
        (email, password)
    )
    user = cursor.fetchone()
    connection.close()

    if user:
        token = jwt.encode({
            'id': user[0],
            'email': user[2],
            'full_name': user[1],
            'status': user[4],
            'loginned': True,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  
        }, SECRET_KEY, algorithm="HS256")
        
        response = {
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user[0],
                'full_name': user[1],
                'email': user[2],
                'status': user[4],
                'loginned': True,
                'password': user[3],
            }
        }
        return jsonify(response), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401

@app.route('/api/user/check-token', methods=['GET'])
def check_token():
    token = request.headers.get('Authorization').split("Bearer ")[-1]
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({'message': 'Token is valid', 'user': decoded}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401





if __name__ == '__main__':
    # create_tables()  
    app.run(debug=True)
