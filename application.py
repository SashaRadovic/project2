import os
import requests

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("welcome")
def welcome(data):
    username=data['username']
    print(username)
    emit('wlc', {"username":username}, broadcast=True )

@socketio.on("msg")
def send_message(data):
    post=data['post']
    username=data['username']

    emit("send_message", {'post': post,'username':username}, broadcast=True )

if __name__ == '__main__':
    socketio.run(app, debug=True)
