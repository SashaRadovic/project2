import os
import requests
import time
from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
try:
    if history:
        print(history)
except:
    history =[]

users={}
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("index.html")




@socketio.on("welcome")
def welcome(data):
    username=data['username']
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    sid=request.sid
    new_pair={sid:username}
    users.update(new_pair)
    print(users)
    history.append(timestamp+': '+username+' connected')

    emit('wlc', {"username":username, 'timestamp':timestamp}, broadcast=True, include_self=False )

    emit('restr', {"history":history})

@socketio.on("disconnect")
def quit():
    username=users[request.sid]
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    history.append(timestamp+': '+username+' disconnected')
    emit('quit_msg', {"username":username, 'timestamp':timestamp}, broadcast=True)

@socketio.on("msg")
def send_message(data):
    post=data['post']
    username=data['username']
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')

    history.append(timestamp+': '+username+': '+post)


    emit("send_message", {'post': post,'username':username, 'timestamp':timestamp}, broadcast=True )
@socketio.on("user_image")
def send_image(data):
    base64=data['base64']
    username=users[request.sid]

    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    history.append(timestamp+': '+username+': ')
    history.append(base64)
    emit("send_image", {'base64':base64, 'username':username, 'timestamp':timestamp}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
