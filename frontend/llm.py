from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
from langchain_community.llms import Ollama
from bson.objectid import ObjectId  # Import ObjectId for querying by ObjectId

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for now

# MongoDB connection setup
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client['capstoneDB']  # Correct database name
    questions_collection = db['questions']  # Collection for questions
    tests_collection = db['tests']  # Collection for tests
    students_collection = db['students']  # Collection for students
    print("MongoDB connected successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Initialize Ollama model
llm = Ollama(model="llama3", base_url="http://127.0.0.1:11434")

# Extract table structure
def extract_table_structure(df, table_name="UploadedTable"):
    columns = df.columns
    schema = f"CREATE TABLE {table_name} (\n"
    for col in columns:
        col_type = df[col].dtype
        if col_type == 'int64':
            col_type = 'INT'
        elif col_type == 'float64':
            col_type = 'DECIMAL(10,2)'
        else:
            col_type = 'VARCHAR(255)'
        schema += f"    {col} {col_type},\n"
    schema = schema.rstrip(",\n") + "\n);"
    return schema

# Function to extract schemas from multiple files
def extract_multiple_table_structures(files):
    tables = {}
    for file in files:
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.filename.endswith('.xlsx'):
                df = pd.read_excel(file)
            else:
                continue

            table_name = file.filename.rsplit('.', 1)[0]
            schema = extract_table_structure(df, table_name=table_name)
            tables[table_name] = schema
        except Exception as e:
            print(f"Error reading file {file.filename}: {e}")
    return tables

# Function to identify keys using the Ollama model
def identify_keys_with_llama(schema):
    prompt = f"""
    You are a database expert. Based on the following SQL table schema:

    {schema}

    Identify the following keys:
    - Candidate Key
    - Primary Key
    - Foreign Key
    - Composite Key

    For each key type, list only the keys found or specify "None found" if not applicable. Do not add any other information or text.
    Format the output as:
    Candidate Key: [list of keys or "None found"]
    Primary Key: [list of keys or "None found"]
    Foreign Key: [list of keys or "None found"]
    Composite Key: [list of keys or "None found"]
    """
    try:
        response = llm.invoke(prompt)
        # Parse the response into a dictionary
        keys_info = {
            "CandidateKey": "None found",
            "PrimaryKey": "None found",
            "ForeignKey": "None found",
            "CompositeKey": "None found"
        }

        # Extract key information from the response
        for line in response.split("\n"):
            if line.startswith("Candidate Key:"):
                keys_info["CandidateKey"] = line.replace("Candidate Key:", "").strip()
            elif line.startswith("Primary Key:"):
                keys_info["PrimaryKey"] = line.replace("Primary Key:", "").strip()
            elif line.startswith("Foreign Key:"):
                keys_info["ForeignKey"] = line.replace("Foreign Key:", "").strip()
            elif line.startswith("Composite Key:"):
                keys_info["CompositeKey"] = line.replace("Composite Key:", "").strip()
        
        return keys_info

    except Exception as e:
        print(f"Error invoking LLM for key identification: {e}")
        return {
            "CandidateKey": "Error: Unable to process key identification",
            "PrimaryKey": "Error: Unable to process key identification",
            "ForeignKey": "Error: Unable to process key identification",
            "CompositeKey": "Error: Unable to process key identification"
        }
# Function to generate SQL questions for a single table
def generate_sql_questions_for_single_table(schema, num_easy, num_medium, num_hard):
    prompt = f"""
    You are an expert educator in SQL. Based on the following SQL table schema:

    {schema}

    Generate a set of SQL questions according to Bloom's Taxonomy:

    - {num_easy} Easy questions (Remembering/Understanding)
    - {num_medium} Medium questions (Applying/Analyzing)
    - {num_hard} Hard questions (Evaluating/Creating)

    Make sure each question is clear and specific. Do not provide answers, just questions.
    """
    try:
        response = llm.invoke(prompt)
        return response
    except Exception as e:
        print(f"Error generating SQL questions: {e}")
        return "Error: Unable to generate questions"

# Function to generate SQL questions for multiple tables
def generate_sql_questions_for_multiple_tables(tables, keys_info, num_easy, num_medium, num_hard):
    print("Tables received for question generation:", tables)
    print("Key information received for question generation:", keys_info)

    # Construct a clearer and more structured prompt
    prompt = f"""
    You are an expert educator in SQL. Based on the following SQL table schemas:

    {tables}

    Key Information:
    - Candidate Key: {keys_info.get("Candidate Key", "None found")}
    - Primary Key: {keys_info.get("Primary Key", "None found")}
    - Foreign Key: {keys_info.get("Foreign Key", "None found")}
    - Composite Key: {keys_info.get("Composite Key", "None found")}

    Generate a set of SQL questions according to Bloom's Taxonomy:
    - {num_easy} Easy questions (Remembering/Understanding)
    - {num_medium} Medium questions (Applying/Analyzing)
    - {num_hard} Hard questions (Evaluating/Creating)

    Each question should be clear, specific, and related to the schemas provided. Do not provide answers, only questions.
    """
    try:
        print("Prompt sent to Ollama model:", prompt)  # Debugging line
        response = llm.invoke(prompt)
        print("Response from Ollama model:", response)  # Debugging line
        return response
    except Exception as e:
        print(f"Error generating SQL questions: {e}")
        return "Error: Unable to generate questions"


# API to handle file upload for single table
@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files or 'num_easy' not in request.form or 'num_medium' not in request.form or 'num_hard' not in request.form:
            return jsonify({'error': 'Missing required parameters'}), 400

        file = request.files['file']
        num_easy = int(request.form['num_easy'])
        num_medium = int(request.form['num_medium'])
        num_hard = int(request.form['num_hard'])

        # Read the file into a pandas DataFrame
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400

        # Extract table structure and generate SQL questions
        schema = extract_table_structure(df, table_name=file.filename.rsplit('.', 1)[0])
        questions = generate_sql_questions_for_single_table(schema, num_easy, num_medium, num_hard)

        return jsonify({'schema': schema, 'questions': questions}), 200

    except Exception as e:
        print(f"Error during file upload and processing: {e}")
        return jsonify({'error': str(e)}), 500

# API to handle file upload for multiple tables
@app.route('/upload-multiple', methods=['POST'])
def upload_multiple_files():
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'Missing files'}), 400

        files = request.files.getlist('files')
        num_easy = int(request.form.get('num_easy', 0))
        num_medium = int(request.form.get('num_medium', 0))
        num_hard = int(request.form.get('num_hard', 0))

        if not files:
            return jsonify({'error': 'No files provided'}), 400

        # Debug: Log the file names and count
        print(f"Received {len(files)} files: {[file.filename for file in files]}")

        # Extract schemas for all tables
        schema_dict = extract_multiple_table_structures(files)
        if not schema_dict:
            return jsonify({'error': 'Failed to extract schema from any file'}), 400

        # Debug: Log the extracted schemas
        print(f"Extracted schemas: {schema_dict}")

        # Combine all schemas for key identification
        combined_schema = "\n\n".join(schema_dict.values())
        keys_info = identify_keys_with_llama(combined_schema)

        # Debug: Log the key information
        print(f"Identified keys: {keys_info}")

        return jsonify({'tables': schema_dict, 'key_info': keys_info}), 200

    except Exception as e:
        # Log the detailed error for debugging
        print(f"Error during file upload and processing: {e}")
        return jsonify({'error': f"Internal Server Error: {str(e)}"}), 500
@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    try:
        # Extract the request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing request data'}), 400

        tables = data.get('tables')
        key_info = data.get('key_info')
        num_easy = int(data.get('num_easy', 0))
        num_medium = int(data.get('num_medium', 0))
        num_hard = int(data.get('num_hard', 0))

        if not tables or not key_info:
            return jsonify({'error': 'Missing tables or key information'}), 400

        # Generate SQL questions using the provided schemas and keys
        questions = generate_sql_questions_for_multiple_tables(tables, key_info, num_easy, num_medium, num_hard)
        print("Generated Questions:", questions)


        return jsonify({'questions': questions}), 200

    except Exception as e:
        print(f"Error generating questions: {e}")
        return jsonify({'error': str(e)}), 500

# Function to generate SQL answers for a question
def generate_sql_answers_with_llama(schema, question):
    prompt = f"""
    You are a database expert. Based on the following SQL table schema:

    {schema}

    Answer the SQL question below with a well-formed and optimized SQL query. Make sure the query adheres to best practices, including:
    - Correct use of table and column names.
    - Proper use of SQL functions and operators.
    - Ensuring efficiency and avoiding common pitfalls such as unnecessary joins or subqueries.

    Question: {question}

    Provide only the SQL query and nothing else, no explanations or additional text.
    """
    response = llm.invoke(prompt)
    return response.strip()


# API to generate answers for a specific test based on its schema and questions from the database
@app.route('/generate-answers/<test_id>', methods=['POST'])
def generate_answers(test_id):
    try:
        # Fetch all questions related to the test_id
        questions = list(questions_collection.find({'testId': ObjectId(test_id)}))
        if len(questions) == 0:
            return jsonify({'error': 'No questions found for the given testId'}), 404

        # Fetch the schema from the Test document
        test_data = tests_collection.find_one({'_id': ObjectId(test_id)})
        if not test_data or 'schema' not in test_data:
            return jsonify({'error': 'Test or schema not found'}), 404

        schema = test_data['schema']

        # Generate answers for each question
        for question in questions:
            question_text = question['questionText']
            answer = generate_sql_answers_with_llama(schema, question_text)

            # Update the question with the generated answer
            questions_collection.update_one(
                {'_id': question['_id']},
                {'$set': {'correctAnswer': answer}}
            )

        return jsonify({'message': 'Answers generated and updated successfully'}), 200

    except Exception as e:
        print(f"Error generating answers: {e}")
        return jsonify({'error': str(e)}), 500

# Function to compare answers using the Ollama model
# Function to compare answers using the Ollama model
# Function to compare answers using the Ollama model based on question and schema
def compare_answers(student_answer, question, schema):
    prompt = f"""
    You are an SQL expert.

    Given the following SQL table schema:

    {schema}

    Question: {question}

    Student Answer: {student_answer}

    Evaluate the student's answer based on:
    - Logical correctness according to the schema
    - Syntactical correctness of the SQL query

    Provide one of the following responses:
    - 'Correct' if the student answer is fully correct.
    - 'Incorrect' if the student answer is wrong.
    """
    
    # Invoke Ollama model with the prompt
    response = llm.invoke(prompt)
    
    # Log the response for debugging
    print(f"Ollama response: {response}")
    
    # Check for 'Correct' or 'Incorrect' in the response
    if "Correct" in response:
        return 'Correct'
    elif "Incorrect" in response:
        return 'Incorrect'
    else:
        # Fallback in case the response is unclear
        return 'Incorrect'


# API to grade the student's answers
@app.route('/grade-test/<test_id>/<student_id>', methods=['POST'])
def grade_test(test_id, student_id):
    try:
        # Convert to ObjectId for querying
        test_id = ObjectId(test_id)
        student_id = ObjectId(student_id)

        # Fetch the test data including questions
        test_data = tests_collection.find_one({'_id': test_id})
        if not test_data:
            return jsonify({'error': 'Test not found'}), 404

        schema = test_data['schema']
        questions = test_data['questions']  # List of questions

        # Fetch the student's submitted answers
        student = students_collection.find_one({'_id': student_id})
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        # Find the student's performance for this specific test
        performance = next((perf for perf in student['performance'] if perf['testId'] == test_id), None)
        if not performance:
            return jsonify({'error': 'Test not submitted by the student'}), 404

        submitted_answers = performance['submittedAnswers']

        # Set total possible score and initialize student's score
        total_possible_score = len(questions)  # Each question is worth 1 point
        student_score = 0

        # Grade each answer using Ollama
        graded_answers = []

        for question_data, submitted_answer in zip(questions, submitted_answers):
            student_answer = submitted_answer['submittedAnswer']
            question = question_data['questionText']  # Fetch the question text

            # Use the Ollama model to compare the answers and evaluate
            result = compare_answers(student_answer, question, schema)

            # Determine the score based on the result
            if result == 'Correct':
                score = 1  # Full mark
                student_score += 1  # Increment student's score for correct answers
            else:
                score = 0  # No mark

            graded_answers.append({
                'questionId': question_data['_id'],
                'questionText': question_data['questionText'],
                'submittedAnswer': student_answer,
                'result': result,
                'score': score
            })

        # Store the student's total score in the performance
        total_score = student_score

        # Update the student's performance with the graded answers and total score
        students_collection.update_one(
            {'_id': student_id, 'performance.testId': test_id},
            {'$set': {
                'performance.$.gradedAnswers': graded_answers,
                'performance.$.totalScore': total_score,  # Add student's total score
                'performance.$.totalPossibleScore': total_possible_score  # Add total possible score
            }}
        )

        return jsonify({
            'message': 'Test graded successfully', 
            'totalScore': total_score, 
            'totalPossibleScore': total_possible_score
        }), 200

    except Exception as e:
        print(f"Error grading test: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/graded-tests/<student_id>', methods=['GET'])
def get_graded_tests(student_id):
    try:
        student = students_collection.find_one({'_id': ObjectId(student_id)})
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        graded_tests = []
        for performance in student.get('performance', []):
            if 'totalScore' in performance:  # Only include tests that have been graded
                graded_tests.append({
                    'testId': str(performance['testId']),
                    'testName': performance.get('testName'),
                    'totalScore': performance.get('totalScore'),
                    'totalPossibleScore': performance.get('totalPossibleScore')
                })

        return jsonify({'gradedTests': graded_tests}), 200

    except Exception as e:
        print(f"Error fetching graded tests: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/view-test/<test_id>/<student_id>', methods=['GET'])
def view_test_details(test_id, student_id):
    try:
        # Find the student document by their ObjectId
        student = students_collection.find_one({'_id': ObjectId(student_id)})
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        # Find the specific test performance for the test_id
        performance = next((perf for perf in student.get('performance', []) if str(perf['testId']) == test_id), None)
        if not performance:
            return jsonify({'error': 'Test not found or not graded yet'}), 404

        # Convert ObjectId to string in the graded answers (if necessary)
        graded_answers = performance.get('gradedAnswers', [])
        for answer in graded_answers:
            answer['questionId'] = str(answer['questionId'])  # Ensure questionId is a string

        # Prepare the response with the detailed question and grading info
        test_details = {
            'testName': performance.get('testName'),
            'totalScore': performance.get('totalScore'),
            'totalPossibleScore': performance.get('totalPossibleScore'),
            'questions': graded_answers  # This contains the question text, student's answer, and the grade
        }

        return jsonify({'testDetails': test_details}), 200

    except Exception as e:
        print(f"Error fetching test details: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app locally
    app.run(port=5000, debug=True)
