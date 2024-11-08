from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import random
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
    schema = f"CREATE TABLE {table_name} (\n"
    for col in df.columns:
        col_type = df[col].dtype
        if col_type == 'int64':
            col_type = 'INT'
        elif col_type == 'float64':
            col_type = 'DECIMAL(10,2)'
        else:
            col_type = 'VARCHAR(255)'
        schema += f"    {col} {col_type},\n"
    return schema.rstrip(",\n") + "\n);"

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
            tables[table_name] = extract_table_structure(df, table_name=table_name)
        except Exception as e:
            print(f"Error reading file {file.filename}: {e}")
    return tables

# Function to identify keys using the Ollama model
def identify_keys_with_llama(schema):
    prompt = f"""
    You are a database expert. Based on the following SQL table schema:

    {schema}

    Identify the following keys:
    - Primary Key
    - Foreign Key

    For each key type, list only the keys found or specify "None found" if not applicable. Do not add any other information or text.
    Format the output as:
    Primary Key: [list of keys for each and every table in the schema or "None found"]
    Foreign Key: [one foreign key  or "None found"]
    Example:
    ForeignKey: [player_id (players)-> player_id (transfers)]
    """
    try:
        response = llm.invoke(prompt)
        # Parse the response into a dictionary
        keys_info = {
            "PrimaryKey": "None found",
            "ForeignKey": "None found"
        }

        # Extract key information from the response
        for line in response.split("\n"):
            if line.startswith("Primary Key:"):
                keys_info["PrimaryKey"] = line.replace("Primary Key:", "").strip()
            elif line.startswith("Foreign Key:"):
                keys_info["ForeignKey"] = line.replace("Foreign Key:", "").strip()
        
        return keys_info

    except Exception as e:
        print(f"Error invoking LLM for key identification: {e}")
        return {
            "PrimaryKey": "Error: Unable to process key identification",
            "ForeignKey": "Error: Unable to process key identification"
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
    - Primary Key: {keys_info.get("Primary Key", "None found")}
    - Foreign Key: {keys_info.get("Foreign Key", "None found")}

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
# Function to compare answers using the Ollama model based on question and schema
def compare_answers(student_answer, question, schema):
    prompt = f"""
    You are an SQL expert grading a student’s answer based on the provided SQL table schema and question.

    Given Schema:
    {schema}

    Question:
    {question}

    Student Answer:
    {student_answer}

    Please evaluate the student’s answer with the following guidelines:
    - **Logical correctness:** Does the answer logically match the requirements of the question?
    - **Syntactical correctness:** Is the SQL syntax correct according to standard SQL?
    - **Output correctness:** If this SQL query were executed, would it produce the expected output as described by the question?

    Based on these criteria, respond with:
    - **Final Verdict:** Clearly label as either "Correct" if all aspects (logical, syntactical, and output correctness) are met, or "Incorrect" otherwise.
    - **Feedback (only if Incorrect)**: Provide feedback in the following format:
      - **Issue**: Describe what went wrong in the student’s answer.
      - **Correct Approach**: Explain the correct approach to solving this question.
      - **Tip**: Offer a practical suggestion or resource the student can review to improve.
      - **Areas for Improvement**: Suggest specific areas the student should focus on to strengthen their SQL skills.
      - **Next Steps**: Provide a final recommendation for what the student can practice or review next.

    Output Format:
    - If the answer is correct, provide only the word "Correct" on one line.
    - If the answer is incorrect, provide "Incorrect" on one line, followed by concise feedback on the next line explaining the specific issues with the student’s answer.
    """
    
    # Invoke the LLM with the refined prompt
    response = llm.invoke(prompt)
    
    # Log the response for debugging
    print(f"Ollama response: {response}")
    response_lines = response.strip().splitlines()

    for i, line in enumerate(response_lines):
        print(f"Response line {i+1}: {line}")

    # Check if the response contains "Correct" or "Incorrect" (ignoring extra formatting)
    if response_lines and any("Correct" in line for line in response_lines[0].split()):
        print("Detected 'Correct'. No feedback necessary.")
        return {"grade": "Correct", "feedback": None}
    elif response_lines and any("Incorrect" in line for line in response_lines[0].split()):
        print("Detected 'Incorrect'. Extracting feedback if available.")
        
        # Check if there is feedback in the second line
        feedback = " ".join(line for line in response_lines[1:] if line).strip()
        
        # Log the feedback captured
        print(f"Captured feedback: {feedback}")
        
        return {"grade": "Incorrect", "feedback": feedback}
    else:
        # Log unexpected response format and return fallback feedback
        print("Unexpected response format encountered. Returning fallback feedback.")
        
        return {"grade": "Incorrect", "feedback": "An error occurred in evaluation. Please review your answer."}


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

        # Grade each answer using the LLM
        graded_answers = []

        for question_data, submitted_answer in zip(questions, submitted_answers):
            student_answer = submitted_answer['submittedAnswer']
            question = question_data['questionText']  # Fetch the question text

            # Use the LLM to compare the answers and evaluate, including feedback
            result = compare_answers(student_answer, question, schema)

            # Determine the score based on the result
            if result['grade'] == "Correct":
                score = 1  # Full mark
                student_score += 1  # Increment student's score for correct answers
            else:
                score = 0  # No mark

            graded_answers.append({
                'questionId': question_data['_id'],
                'questionText': question_data['questionText'],
                'submittedAnswer': student_answer,
                'result': result['grade'],
                'feedback': result['feedback'],  # Add feedback here
                'score': score
            })

        # Store the student's total score in the performance
        total_score = student_score

        # Update the student's performance with the graded answers, total score, and feedback
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
    
from bson import ObjectId
from flask import jsonify

@app.route('/performance/<student_id>', methods=['GET'])
def get_student_performance(student_id):
    try:
        # Find the student document by their ObjectId
        student = students_collection.find_one({'_id': ObjectId(student_id)})
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        # Fetch the performance data
        performance = student.get('performance', [])

        # If no performance data is available, return an empty summary
        if not performance:
            return jsonify({
                'totalTests': 0,
                'averageScore': None,
                'bestScore': None,
                'worstScore': None,
                'recentTests': []
            }), 200

        # Calculate summary details for valid scores
        valid_scores = [
            (perf['totalScore'] / perf['totalPossibleScore']) * 100
            for perf in performance
            if 'totalScore' in perf and 'totalPossibleScore' in perf
        ]

        # Handle the case where there are no valid scores
        if not valid_scores:
            return jsonify({
                'totalTests': len(performance),
                'averageScore': None,
                'bestScore': None,
                'worstScore': None,
                'recentTests': []
            }), 200

        total_tests = len(performance)
        average_score = sum(valid_scores) / len(valid_scores)
        best_score = max(valid_scores)
        worst_score = min(valid_scores)

        # Get recent tests (last 5 or fewer tests)
        recent_tests = sorted(performance, key=lambda x: x.get('testName', ''), reverse=True)[:5]
        recent_test_data = [
            {
                'testName': test.get('testName', 'Unnamed Test'),
                'totalScore': test.get('totalScore'),
                'totalPossibleScore': test.get('totalPossibleScore'),
                'scorePercentage': (test['totalScore'] / test['totalPossibleScore']) * 100 if 'totalScore' in test and 'totalPossibleScore' in test else None,
            } for test in recent_tests
        ]

        # Compile the final response
        performance_summary = {
            'totalTests': total_tests,
            'averageScore': average_score,
            'bestScore': best_score,
            'worstScore': worst_score,
            'recentTests': recent_test_data
        }

        return jsonify(performance_summary), 200

    except Exception as e:
        print(f"Error fetching performance data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/generate_flashcard', methods=['POST'])
def generate_flashcard():
    data = request.json
    topic = data.get('topic', '')
    question_type = data.get('question_type', 'scenario')  

    # Validate input
    if not topic:
        return jsonify({"error": "Please provide a topic"}), 400

    # Variability phrases to encourage diverse responses
    variation_phrases = [
        "Explain with a new perspective.",
        "Provide a unique example this time.",
        "Describe this concept with additional details.",
        "Create a different type of flashcard on this topic.",
        "Generate this in a fresh way."
    ]
    # Randomly choose a variation phrase
    chosen_variation = random.choice(variation_phrases)

    # Generate prompt based on question type
    if question_type == 'scenario':
        prompt = (
            f"Generate a real-world scenario flashcard based on the topic '{topic}' in SQL. {chosen_variation} "
            "Create a practical situation that requires applying SQL skills to solve a problem. "
            "Format response as follows:\n"
            "Question: Describe a scenario in which [topic-related task or issue] needs to be addressed using SQL.Just the question and nothing else "
            "How would you solve it?\n"
            "Answer: [Just give the main pointers as it is a flashcard,no more than 120 words]\n"
            "Just add the question and answer to the response and no other line not even the Here is a flashcard on topic in SQL:"
        )
    elif question_type == 'theory':
        prompt = (
            f"Generate a theory-based flashcard on the topic '{topic}' in SQL. {chosen_variation} "
            "Provide a concise explanation of the topic. "
            "Format response as follows:\n"
            "Question: [Any Theory-based question about the topic, Just the question and nothing else]\n"
            "Answer: [Provide a brief and clear explanation, no more than 120 words]\n"
            "Just add the question and answer to the response and no other line not even the Here is a flashcard on topic in SQL:"
        )
    elif question_type == 'coding':
        prompt = (
            f"Generate a coding-based flashcard with an example on the topic '{topic}' in SQL. {chosen_variation} "
            "Include a practical coding example. "
            "Format response as follows:\n"
            "Question: Write a SQL query to [topic-related task].\n"
            "Answer: [Provide the SQL query and a brief explanation, no more than 100 words]\n"
            "Just add the question and answer to the response and no other line not even the Here is a flashcard on topic in SQL:"
        )
    else:
        return jsonify({"error": "Invalid question type"}), 400

    # Debugging: Print the prompt for inspection
    try:
        print("Prompt sent to Ollama model:", prompt)
        response = llm.invoke(prompt)
        print("Response from Ollama model:", response)

        # Handle the response
        if isinstance(response, str):
            flashcard = response
        else:
            flashcard = response.content

        # Extract question and answer from the flashcard response
        try:
            question, answer = flashcard.split("Answer:", 1)
            question = question.replace("Question:", "").strip()
            answer = answer.strip()
            print("Parsed Question:", question)
            print("Parsed Answer:", answer)
        except ValueError:
            print("Unexpected format in LLM response")
            return jsonify({"error": "Unexpected format in LLM response"}), 500

        return jsonify({
            "question": question,
            "answer": answer
        }), 200
    except Exception as e:
        print(f"Error generating flashcard: {e}")
        return jsonify({"error": f"Failed to generate flashcard: {str(e)}"}), 500


if __name__ == '__main__':
    # Run the Flask app locally
    app.run(port=5000, debug=True)
