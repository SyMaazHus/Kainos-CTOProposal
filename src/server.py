import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

#Load API Key from .env
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

#Setup Flask
app = Flask(__name__)
CORS(app) #Enables Electron to talk to Python

#Setup Groq Client
client = Groq(api_key=api_key)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('messages')

    try:
        chat_completion = client.chat.completions.create(
            messages=user_input,
            model="llama-3.3-70b-versatile",
        )
        
        reply = chat_completion.choices[0].message.content
        return jsonify({"reply": reply})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Flush stdout so we see prints in Electron console immediately
    print("Starting Python Server on Port 5000...")
    sys.stdout.flush() 
    app.run(host='127.0.0.1', port=5000)