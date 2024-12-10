from flask import Flask, jsonify, request
import psycopg2
from flask_cors import CORS
import jwt
import datetime
from config import host, user, password, db_name
import secrets
import random
import string

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
                loginned boolean NOT NULL,
                saved_information INT[]
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS information (
                id serial PRIMARY KEY,
                title varchar(50) NOT NULL,
                text varchar(1000) NOT NULL,
                path varchar(200)[] NOT NULL
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

    print(user)

    if user:
        token = jwt.encode({
            'id': user[0],
            'email': user[2],
            'full_name': user[1],
            'status': user[4],
            'loginned': True,
            'saved_information': user[6],
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
                'saved_information': user[6]
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


# ------------------------------------------ Information List -----------------------------------------------------------


@app.route('/api/information-list', methods=['POST'])
def information_list():
    try:
        data = request.get_json()
        user_id = data.get('id')
        page_type = data.get('page_type')
        search_value = data.get('search_value', '')
        page_number = int(data.get('page_number', 1))
        page_size = 5  

        connection = get_db_connection()
        cursor = connection.cursor()

        # Определяем условие фильтрации
        base_query = """
            SELECT id, title, text, path 
            FROM information 
        """
        where_clause = ""
        if page_type == 'savedInformation':
            if not user_id:
                return jsonify({'error': 'User ID is required for savedInformation request type'}), 400

            where_clause = """
                WHERE id IN (
                    SELECT UNNEST(saved_information)
                    FROM users
                    WHERE id = %s
                )
            """
        elif page_type == 'viewInformation':
            where_clause = "WHERE TRUE"

        if search_value:
            search_filter = " AND (title ILIKE %s OR text ILIKE %s)"
            where_clause += search_filter

        # Подсчёт общего количества записей
        count_query = f"SELECT COUNT(*) FROM ({base_query} {where_clause}) AS subquery"
        if page_type == 'savedInformation':
            cursor.execute(count_query, (user_id, f'%{search_value}%', f'%{search_value}%') if search_value else (user_id,))
        else:
            cursor.execute(count_query, (f'%{search_value}%', f'%{search_value}%') if search_value else ())

        total_records = cursor.fetchone()[0]
        total_pages = (total_records + page_size - 1) // page_size

        # Получение записей для текущей страницы
        offset = (page_number - 1) * page_size
        limit_offset_query = f"""
            {base_query} {where_clause}
            ORDER BY id 
            LIMIT %s OFFSET %s
        """
        if page_type == 'savedInformation':
            cursor.execute(
                limit_offset_query,
                (user_id, f'%{search_value}%', f'%{search_value}%', page_size, offset)
                if search_value
                else (user_id, page_size, offset)
            )
        else:
            cursor.execute(
                limit_offset_query,
                (f'%{search_value}%', f'%{search_value}%', page_size, offset)
                if search_value
                else (page_size, offset)
            )

        information_list = cursor.fetchall()
        connection.close()

        # Формируем ответ
        response = {
            'total_pages': total_pages,
            'information_list': [
                {
                    'id': info[0],
                    'title': info[1],
                    'text': info[2],
                    'path': info[3]
                }
                for info in information_list
            ]
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


    
def random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def insert_random_information():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        for _ in range(15):
            title = random_string(10)  # Генерация случайного заголовка длиной 10 символов
            text = random_string(50)  # Генерация случайного текста длиной 50 символов
            path = [f"/path/to/file{random.randint(1, 100)}"]  # Генерация случайного пути

            cursor.execute(
                """
                INSERT INTO information (title, text, path)
                VALUES (%s, %s, %s)
                """,
                (title, text, path)
            )

        connection.commit()

    except Exception as e:
        print(f"Ошибка при вставке данных: {e}")

    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/information/save', methods=['POST'])
def save_information():
    try:
        data = request.get_json()
        user_id = data['user_id']
        information_id = data['information_id']

        connection = get_db_connection()
        cursor = connection.cursor()

        # Убедиться, что массив инициализирован
        cursor.execute("""
            UPDATE users
            SET saved_information = ARRAY[]::INT[]
            WHERE saved_information IS NULL AND id = %s;
        """, (user_id,))

        # Получить текущий список сохранённой информации
        cursor.execute("""
            SELECT saved_information
            FROM users
            WHERE id = %s;
        """, (user_id,))
        result = cursor.fetchone()
        if not result:
            connection.close()
            return jsonify({'error': 'User not found'}), 404

        saved_information = result[0] if result[0] else []

        # Определить действие: добавить или удалить
        if information_id in saved_information:
            # Удалить информацию из массива
            cursor.execute("""
                UPDATE users
                SET saved_information = array_remove(saved_information, %s)
                WHERE id = %s;
            """, (information_id, user_id))
            message = 'Information removed successfully'
        else:
            # Добавить информацию в массив
            cursor.execute("""
                UPDATE users
                SET saved_information = array_append(saved_information, %s)
                WHERE id = %s;
            """, (information_id, user_id))
            message = 'Information saved successfully'

        connection.commit()

        # Получить обновлённый список сохранённой информации
        cursor.execute("""
            SELECT saved_information
            FROM users
            WHERE id = %s;
        """, (user_id,))
        updated_saved_information = cursor.fetchone()[0]

        connection.close()

        return jsonify(updated_saved_information), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/information/delete/<int:information_id>', methods=['DELETE'])
def delete_information(information_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Удаляем информацию из таблицы
        cursor.execute("DELETE FROM information WHERE id = %s;", (information_id,))
        connection.commit()
        connection.close()

        return jsonify({'message': 'Information deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    # create_tables()  
    # insert_random_information()
    app.run(debug=True)
