import os
import requests
import time
from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room


channels=['music', 'fashion', 'books', 'movies','baba']
history ={'music':[],'fashion':[],'books':[],'movies':[]}
users={}
users_per_rooms={}
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("index.html")




@socketio.on("welcome")
def welcome(data):
    username=data['username']
    room=data['room']

    upr={username:room}
    print(upr)
    users_per_rooms.update(upr)
    if room not in channels:
        channels.append(room)
        print(channels)
        new_chanel={room:[]}
        history.update(new_chanel)
    join_room(room)
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    sid=request.sid
    if username in users:
        del users[username]
    new_pair={username:sid}
    users.update(new_pair)
    print(users)
    print(users_per_rooms)
    history[room].append(timestamp+': '+username+' connected on channel '+room)
    print(history)
    emit('wlc', {"username":username, 'timestamp':timestamp,"room":room,'users_per_rooms':users_per_rooms, 'channels':channels }, broadcast=True)

    emit('restr', {"history":history[room]})

@socketio.on("disconnect")
def quit():

    userId =request.sid
    username=[u for (u, sid) in users.items() if userId==sid][0]
    room=users_per_rooms[username]
    print(username)
    leave_room(room)
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    history[room].append(timestamp+': '+username+' disconnected')
    del users_per_rooms[username]
    print(users_per_rooms)
    emit('quit_msg', {"username":username, 'timestamp':timestamp, 'room':room,'users_per_rooms':users_per_rooms }, broadcast=True)

@socketio.on("msg")
def send_message(data):
    post=data['post']
    room=data['room']
    username=data['username']
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')

    history[room].append(timestamp+': '+username+': '+post)
    print(history)

    emit("send_message", {'post': post,'username':username, 'timestamp':timestamp, 'room':room, 'channels':channels}, broadcast=True )

@socketio.on("user_image")
def send_image(data):
    base64=data['base64']
    userId =request.sid
    room=data['room']
    username=[u for (u, sid) in users.items() if userId==sid][0]
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    history[room].append(timestamp+': '+username+': ')
    history[room].append(base64)
    emit("send_image", {'base64':base64, 'username':username, 'timestamp':timestamp,'room':room}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
