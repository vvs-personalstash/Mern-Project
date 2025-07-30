from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain.tools import tool

load_dotenv()


app = Flask(__name__)
CORS(app)  

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["test"]
questions_collection = db["questions"]  


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY, temperature=0.3)


@tool("get_problem_hint", return_direct=True)
def get_problem_hint(problem_id: str) -> str:
    """
    Fetch programming problem hints from MongoDB using the question ID (qid).
    Returns helpful hints or a message if not found.
    """
    try:
        qid = int(problem_id)
        print(f"DEBUG: Looking for question with qid: {qid}")
        
        # Debug: Check what's in the collection
        all_questions = list(questions_collection.find({}, {"qid": 1, "title": 1, "hints": 1}))
        print(f"DEBUG: Found {len(all_questions)} questions in collection:")
        for q in all_questions:
            print(f"  - QID: {q.get('qid')}, Title: {q.get('title')}, Hints: {q.get('hints')}")
        
        question_doc = questions_collection.find_one({"qid": qid})
        print(f"DEBUG: Query result for qid {qid}: {question_doc}")
        
        if question_doc and question_doc.get("hints"):
            hints = question_doc["hints"]
            print(f"DEBUG: Found hints: {hints}")
            if len(hints) > 1:
                formatted_hints = "\n".join([f"{i+1}. {hint}" for i, hint in enumerate(hints)])
                return f"Here are some hints for this problem:\n{formatted_hints}"
            else:
                return f"Hint: {hints[0]}"
        else:
            print(f"DEBUG: No hints found. Question doc exists: {question_doc is not None}")
            if question_doc:
                print(f"DEBUG: Question doc keys: {list(question_doc.keys())}")
                print(f"DEBUG: Hints field value: {question_doc.get('hints')}")
            return f"No hints available for problem ID '{problem_id}' in database."
            
    except ValueError:
        return f"Invalid problem ID format: '{problem_id}'. Problem ID should be a number."
    except Exception as e:
        print(f"DEBUG: Exception occurred: {str(e)}")
        return f"Error retrieving hints for problem '{problem_id}': {str(e)}"


prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant that gives feedback on programming code submissions. If you're not sure how to improve the code, "
    "you're allowed to use the available tools to get hints then use the users current code and those hints to give him direction on how to solve the question."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = [get_problem_hint]
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)


chat_history = []

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Agentic AI Feedback API",
        "description": "AI-powered code feedback system with intelligent hint retrieval",
        "endpoints": {
            "POST /agentic-feedback": "Get AI feedback on code submissions with optional hint retrieval",
            "GET /get-hint/<qid>": "Get hints for a specific problem by question ID (qid)",
            "GET /health": "Health check and database status"
        },
        "features": [
            "Intelligent code analysis using Gemini 2.0 Flash",
            "Automatic hint retrieval from question database",
            "Support for multiple programming languages",
            "Contextual feedback based on problem-specific hints"
        ]
    })

@app.route('/health', methods=['GET'])
def health_check():
    try:
        mongo_client.admin.command('ping')
        question_count = questions_collection.count_documents({})
        mongo_status = f"connected (questions: {question_count})"
    except Exception as e:
        mongo_status = f"error: {str(e)}"
    
    return jsonify({
        "status": "healthy",
        "mongodb": mongo_status,
        "ai_model": "gemini-2.0-flash",
        "database": "online_judge",
        "collection": "questions"
    })

@app.route('/debug-db', methods=['GET'])
def debug_database():
    """Debug endpoint to inspect database content"""
    try:
        # Database and collection info
        db_name = db.name
        collection_name = questions_collection.name
        
        # Get collection stats
        total_docs = questions_collection.count_documents({})
        
        # Get all questions with their basic info
        all_questions = list(questions_collection.find({}, {
            "qid": 1, 
            "title": 1, 
            "hints": 1,
            "_id": 1
        }).limit(10))
        
        # Check specifically for qid = 1
        question_1 = questions_collection.find_one({"qid": 1})
        
        return jsonify({
            "database_info": {
                "database": db_name,
                "collection": collection_name,
                "total_documents": total_docs
            },
            "sample_questions": all_questions,
            "question_id_1": question_1,
            "mongo_uri": MONGO_URI
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "database": db.name if 'db' in locals() else "Unknown",
            "collection": questions_collection.name if 'questions_collection' in locals() else "Unknown"
        }), 500

@app.route('/agentic-feedback', methods=['POST'])
def agentic_feedback():
    try:
        data = request.get_json()
        
        if not data or 'problem_id' not in data or 'user_code' not in data:
            return jsonify({"error": "Missing required fields: problem_id, user_code"}), 400
        
        problem_id = data['problem_id']
        user_code = data['user_code']
        user_plan = data.get('user_plan', 'No plan provided')
        language = data.get('language', 'python')
        
        user_input = f"""
Problem ID: {problem_id}
Language: {language}

User's Plan:
{user_plan}

User's Code:
{user_code}
Dont use tools in simple cases.
If you're not sure how to improve the code, you're allowed to call the `get_problem_hint` tool using the problem ID.
Never return code — only describe logical mistakes, inefficiencies, or strategy improvements.
"""


        result = agent_executor.invoke({
            "input": user_input,
            "chat_history": chat_history
        })
        
        output_message = result["output"]
        
        chat_history.extend([
            HumanMessage(content=user_input),
            AIMessage(content=output_message)
        ])

        used_hint = "hint" in output_message.lower()
        
        return jsonify({
            "message": output_message,
            "used_hint": used_hint,
            "problem_id": problem_id,
            "language": language
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-hint/<problem_id>', methods=['GET'])
def get_hint(problem_id):
    """Get hints for a specific problem by qid"""
    try:
        qid = int(problem_id)
        print(f"DEBUG GET-HINT: Looking for question with qid: {qid}")
        
        # Debug: Check collection connection and data
        collection_name = questions_collection.name
        database_name = questions_collection.database.name
        print(f"DEBUG GET-HINT: Using database '{database_name}', collection '{collection_name}'")
        
        # Check if collection exists and has data
        total_count = questions_collection.count_documents({})
        print(f"DEBUG GET-HINT: Total documents in collection: {total_count}")
        
        # Try to find the specific question
        question_doc = questions_collection.find_one({"qid": qid})
        print(f"DEBUG GET-HINT: Query result: {question_doc}")
        
        if question_doc and question_doc.get("hints"):
            print(f"DEBUG GET-HINT: Found hints: {question_doc['hints']}")
            return jsonify({
                "problem_id": problem_id,
                "qid": qid,
                "hints": question_doc["hints"],
                "hint_count": len(question_doc["hints"])
            })
        else:
            print(f"DEBUG GET-HINT: No hints found or question doesn't exist")
            if question_doc:
                print(f"DEBUG GET-HINT: Question exists but hints field: {question_doc.get('hints')}")
            return jsonify({
                "problem_id": problem_id,
                "qid": qid,
                "hints": [],
                "message": "No hints found for this problem",
                "debug": {
                    "question_exists": question_doc is not None,
                    "hints_field": question_doc.get("hints") if question_doc else None
                }
            }), 404
            
    except ValueError:
        return jsonify({
            "error": f"Invalid problem ID format: '{problem_id}'. Problem ID should be a number."
        }), 400
    except Exception as e:
        print(f"DEBUG GET-HINT: Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003)
