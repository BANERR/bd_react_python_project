from flask import Flask, jsonify, request, Response
import psycopg2
from flask_cors import CORS
import jwt
import datetime
from config import host, user, password, db_name
import secrets
import random
import string
from werkzeug.utils import secure_filename
import datetime
import json


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
                saved_information INT[] DEFAULT '{}'
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS information (
                id serial PRIMARY KEY,
                title varchar(50) NOT NULL,
                text varchar(1000) NOT NULL,
                file_ids INT[] DEFAULT '{}'
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS files (
                id serial PRIMARY KEY,
                file_data BYTEA NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

        base_query = """
            SELECT id, title, text, file_ids 
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

        count_query = f"SELECT COUNT(*) FROM ({base_query} {where_clause}) AS subquery"
        if page_type == 'savedInformation':
            cursor.execute(count_query, (user_id, f'%{search_value}%', f'%{search_value}%') if search_value else (user_id,))
        else:
            cursor.execute(count_query, (f'%{search_value}%', f'%{search_value}%' if search_value else ()))

        total_records = cursor.fetchone()[0]
        total_pages = (total_records + page_size - 1) // page_size

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

        response_list = []
        for info in information_list:
            info_id, title, text, file_ids = info
            
            file_list = []
            if file_ids:
                cursor.execute(
                    "SELECT id, file_name FROM files WHERE id = ANY(%s)",
                    (file_ids,)
                )
                files = cursor.fetchall()
                for file in files:
                    file_id = file[0]
                    file_name = file[1]
                    file_url = f"http://localhost:5000/api/files/{file_id}/download"
                    file_list.append({
                        'id': file_id,
                        'name': file_name,
                        'url': file_url  
                    })
            response_list.append({
                'id': info_id,
                'title': title,
                'text': text,
                'files': file_list
            })

        connection.close()

        response = {
            'total_pages': total_pages,
            'information_list': response_list
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/files/<int:file_id>/download', methods=['GET'])
def download_file(file_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT file_data, file_name FROM files WHERE id = %s", (file_id,))
        file = cursor.fetchone()

        if not file:
            return jsonify({'error': 'File not found'}), 404

        file_data, file_name = file
        connection.close()

        return Response(
            file_data,
            mimetype='application/octet-stream',
            headers={
                'Content-Disposition': f'attachment; filename={file_name}'
            }
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/api/information/save', methods=['POST'])
def save_information():
    try:
        data = request.get_json()
        user_id = data['user_id']
        information_id = data['information_id']

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE users
            SET saved_information = ARRAY[]::INT[]
            WHERE saved_information IS NULL AND id = %s;
        """, (user_id,))

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

        if information_id in saved_information:
            cursor.execute("""
                UPDATE users
                SET saved_information = array_remove(saved_information, %s)
                WHERE id = %s;
            """, (information_id, user_id))
        else:
            cursor.execute("""
                UPDATE users
                SET saved_information = array_append(saved_information, %s)
                WHERE id = %s;
            """, (information_id, user_id))

        connection.commit()

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

        cursor.execute("DELETE FROM information WHERE id = %s;", (information_id,))
        connection.commit()
        connection.close()

        return jsonify({'message': 'Information deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# ------------------------------------------ Add information -----------------------------------------------------------


@app.route('/api/information/add', methods=['POST'])
def add_information_with_files():
    try:
        data = request.form
        title = data.get('title')
        text = data.get('text')

        files = request.files.getlist('files')
        file_ids = []

        connection = get_db_connection()
        cursor = connection.cursor()

        for file in files:
            file_data = file.read()
            file_name = secure_filename(file.filename)
            cursor.execute(
                """
                INSERT INTO files (file_data, file_name)
                VALUES (%s, %s) RETURNING id;
                """,
                (file_data, file_name)
            )
            file_id = cursor.fetchone()[0]
            file_ids.append(file_id)

        cursor.execute(
            """
            INSERT INTO information (title, text, file_ids)
            VALUES (%s, %s, %s);
            """,
            (title, text, file_ids)
        )
        connection.commit()
        connection.close()

        return jsonify({'message': 'Information and files saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------------------------------ Edit information -----------------------------------------------------------


@app.route('/api/get-information', methods=['POST'])
def get_information():
    try:
        data = request.get_json()
        user_id = data['user_id']
        information_id = data['information_id']
        print(user_id, information_id)
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """SELECT title, text, file_ids FROM information WHERE id = %s""", 
            (information_id,)
        )

        info = cursor.fetchone()

        if not info:
            return jsonify({"error": "Information not found"}), 404
        
        title, text, file_ids = info

        cursor.execute(
            """SELECT id, file_name FROM files WHERE id = ANY(%s)""", 
            (file_ids,)
        )

        files = [{"id": file[0], "name": file[1]} for file in cursor.fetchall()]

        connection.close()

        response = {
            "title": title, 
            "text": text, 
            "files": files
        }

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/information/<int:info_id>', methods=['PUT'])
def update_information(info_id):
    try:
        title = request.form['title']
        text = request.form['text']
        new_files = request.files.getlist('files') 
        deleted_files = json.loads(request.form['deleted_files']) 

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE information
            SET title = %s, text = %s
            WHERE id = %s
        """, (title, text, info_id))

        if deleted_files:
            for file_id in deleted_files:
                cursor.execute("""
                    DELETE FROM files WHERE id = %s
                """, (file_id,))

                cursor.execute("""
                    UPDATE information
                    SET file_ids = array_remove(file_ids, %s)
                    WHERE id = %s
                """, (file_id, info_id))

        file_ids = []
        for file in new_files:
            file_data = file.read()  
            file_name = file.filename

            cursor.execute("""
                INSERT INTO files (file_data, file_name)
                VALUES (%s, %s) RETURNING id
            """, (file_data, file_name))
            file_ids.append(cursor.fetchone()[0])

        if file_ids:
            cursor.execute("""
                UPDATE information
                SET file_ids = array_cat(file_ids, %s)
                WHERE id = %s
            """, (file_ids, info_id))

        connection.commit()
        return jsonify({"message": "Information updated successfully"})

    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    

# ------------------------------------------ Edit profile -----------------------------------------------------------


@app.route('/api/user/update', methods=['PUT'])
def update_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        full_name = data.get('full_name')
        email = data.get('email') 
        password = data.get('password') 

        connection = get_db_connection()
        cursor = connection.cursor()

        update_query = "UPDATE users SET full_name = %s, email = %s, password = %s WHERE id = %s"
        cursor.execute(update_query, (full_name, email, password, user_id))

        connection.commit()
        connection.close()

        return jsonify({'message': 'User information updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# ------------------------------------------ User Managment -----------------------------------------------------------

    

@app.route('/api/users-list', methods=['POST'])
def users_list():
    try:
        data = request.get_json()
        search_value = data.get('search_value', '')  
        page_number = int(data.get('page_number', 1)) 
        page_size = 5 

        connection = get_db_connection()
        cursor = connection.cursor()

        base_query = """
            SELECT id, full_name, email, status 
            FROM users
        """
        where_clause = ""

        if search_value:
            where_clause = "WHERE full_name ILIKE %s OR email ILIKE %s"

        count_query = f"SELECT COUNT(*) FROM ({base_query} {where_clause}) AS subquery"
        if search_value:
            cursor.execute(count_query, (f'%{search_value}%', f'%{search_value}%'))
        else:
            cursor.execute(count_query)

        total_records = cursor.fetchone()[0]
        total_pages = (total_records + page_size - 1) // page_size  

        offset = (page_number - 1) * page_size
        limit_offset_query = f"""
            {base_query} {where_clause}
            ORDER BY id
            LIMIT %s OFFSET %s
        """
        if search_value:
            cursor.execute(limit_offset_query, (f'%{search_value}%', f'%{search_value}%', page_size, offset))
        else:
            cursor.execute(limit_offset_query, (page_size, offset))

        users_list = cursor.fetchall()

        connection.close()

        response_list = [{
            'id': user[0],
            'full_name': user[1],
            'email': user[2],
            'status': user[3]
        } for user in users_list]

        response = {
            'total_pages': total_pages,
            'users_list': response_list
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/user/promote', methods=['POST'])
def promote_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        new_status = data.get('new_status')

        if new_status not in ['admin', 'superAdmin', 'user']:
            return jsonify({'error': 'Invalid status'}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE users
            SET status = %s
            WHERE id = %s;
        """, (new_status, user_id))

        connection.commit()
        connection.close()

        return jsonify({'message': 'User status updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    # create_tables()  
    app.run(debug=True)
