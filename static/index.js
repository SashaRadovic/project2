document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


    socket.on('connect', () => {
      if (window.localStorage.getItem('username')!==null){
          var username=window.localStorage.getItem('username');
          const li = document.createElement('li');
          li.innerHTML ='Welcome back '+username+'!'
          document.querySelector('#chat-messages').appendChild(li);
       } else{
           window.localStorage.setItem('username', 'Guest')
           var username=window.localStorage.getItem('username');
           const li = document.createElement('li');
           li.innerHTML ='You are now connected as:  '+username+'!'
            document.querySelector('#chat-messages').appendChild(li);
        }

      socket.emit('welcome', {'username':username});
    });

   socket.on('connect', () =>{
    document.getElementById('sendForm').addEventListener('submit', (e) =>{
            e.preventDefault();
            const post=document.getElementById('input-message').value;

            const username =window.localStorage.getItem('username')

            socket.emit('msg', {'post':post, 'username':username});
    });
    });

    socket.on('wlc', data =>{
       const li = document.createElement('li');
       li.innerHTML = `${data.username} connected`;

       document.querySelector('#chat-messages').appendChild(li);
    });


     socket.on('send_message', data =>{
       const li = document.createElement('li');
       li.innerHTML = `${data.username}: ${data.post}`;

       document.querySelector('#chat-messages').appendChild(li);
     });
});
