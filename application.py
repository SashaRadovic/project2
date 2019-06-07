import os
import requests
import time
from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room


channels=['music', 'fashion', 'books', 'movies','general']
history ={'general':[],'music':[],'fashion':[],'books':[],'movies':[]}
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
    print(users_per_rooms)
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
    emit('wlc', {"username":username, 'timestamp':timestamp,'users_per_rooms':users_per_rooms, 'channels':channels,'room':room },broadcast=True)

    emit('restr', {"history":history[room]})


@socketio.on('addRoom')
def createRoom(data):
    room=data['room']
    username=data['username']
    if room not in channels:
        channels.append(room)
        print(channels)
        new_chanel={room:[]}
        history.update(new_chanel)
    del users_per_rooms[username]
    new_chanel_pair={username:room}
    users_per_rooms.update(new_chanel_pair)
    emit('createRoom', {'room':room, 'username':username, 'users_per_rooms':users_per_rooms}, broadcast=True)

@socketio.on('addUser')
def checkUser(data):
    username=data['username']
    room=data['room']
    oldUser=data['oldUser']
    del users_per_rooms[oldUser]
    newValue={username:room}
    print(newValue)
    users_per_rooms.update(newValue)
    print(users_per_rooms)
    emit('checkUser', {'users_per_rooms':users_per_rooms})



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
    emit('quit_msg', {"username":username, 'timestamp':timestamp, 'room':room,'users_per_rooms':users_per_rooms },room=room)

@socketio.on("msg")
def send_message(data):
    post=data['post']
    room=data['room']
    username=data['username']
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')

    history[room].append(timestamp+': '+username+': '+post)
    print(history)

    emit("send_message", {'post': post,'username':username, 'timestamp':timestamp, 'channels':channels}, room=room)

@socketio.on("user_image")
def send_image(data):
    base64=data['base64']
    userId =request.sid
    room=data['room']
    username=[u for (u, sid) in users.items() if userId==sid][0]
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    history[room].append(timestamp+': '+username+': ')
    history[room].append(base64)
    emit("send_image", {'base64':base64, 'username':username, 'timestamp':timestamp},room=room)

@socketio.on("selectRoom")
def roomChange(data):
    username=data['username']
    oldRoom=data['oldRoom']
    leave_room(oldRoom)
    room=data['room']
    join_room(room)

    print(room,oldRoom)
    del users_per_rooms[username]
    newValueRoom={username:room}
    print(newValueRoom)
    users_per_rooms.update(newValueRoom)
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')

    print(room)
    print(users_per_rooms)


    emit("roomChange", {'username':username,'timestamp':timestamp,'room':room, 'channels':channels,'users_per_rooms':users_per_rooms} , broadcast=True)
    emit("restr", {'history':history[room]})

@socketio.on("sendGIF")
def gifDisplay(data):
    room=data['room']
    username=data['username']
    imgSrc=data['imgSrc']
    timestamp = time.strftime('%I:%M%p on %b %d, %Y')
    history[room].append(timestamp+': '+username+': ')
    history[room].append(imgSrc)
    print(imgSrc)
    emit("gifDisplay", {'username':username,'timestamp':timestamp,'room':room, 'channels':channels,'users_per_rooms':users_per_rooms, 'imgSrc':imgSrc}, room=room)




if __name__ == '__main__':
    socketio.run(app, debug=True)
