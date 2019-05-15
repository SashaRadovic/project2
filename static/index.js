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
           var guest ='Guest'+ Math.floor((Math.random() * 10000) + 5000);
           window.localStorage.setItem('username', guest)
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

            const username =window.localStorage.getItem('username');
            document.getElementById('input-message').value="";
            socket.emit('msg', {'post':post, 'username':username});
    });
    });



    socket.on('disconnect', () =>{



        socket.emit('disconnect', {'username':username});
    });

   socket.on('quit_msg', data=>{
       const li = document.createElement('li');
       li.innerHTML = `${data.timestamp}: ${data.username} disconnected`;

       document.querySelector('#chat-messages').appendChild(li);
   });

    socket.on('wlc', data =>{

       const li = document.createElement('li');
       li.innerHTML = `${data.timestamp}: ${data.username} connected`;
       document.querySelector('#chat-messages').appendChild(li);
    });

    socket.on('restr', data =>{
        var history=data.history;
        var histLength=history.length;
        for( var i=0; i<histLength; i++){
            let li = document.createElement('li');
            if (history[i].includes("base64")){
                li.innerHTML = `${'<img src="' + history[i] + '"/>'}`;
                console.log(history[i]);
            }
            else {
            li.innerHTML = history[i];
        }
            document.querySelector('#chat-messages').appendChild(li);
        }
    });


     socket.on('send_message', data =>{
       const li = document.createElement('li');
       li.innerHTML = `${data.timestamp}: ${data.username}: ${data.post}`;

       document.querySelector('#chat-messages').appendChild(li);
     });



socket.on('connect', () =>{
    document.getElementById('imagefile').addEventListener('change', e =>{
        var width =200;
        var height=200;
    var file = e.target.files[0],
    reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function(evt){
        //Because of how the file was read,
        //evt.target.result contains the image in base64 format
        //Nothing special, just creates an img element
        //and appends it to the DOM so my UI shows
        //that I posted an image.
        //send the image via Socket.io

        const img =new Image();
        img.src = evt.target.result;

        img.onload = () => {
        const canvas =document.createElement('canvas');
        canvas.width=width;
        canvas.height=height;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,width, height);
        const base64 = ctx.canvas.toDataURL('image/jpeg', 0.5);








        socket.emit('user_image',{'base64':base64} );
};
    //And now, read the image and base64
    //reader.readAsDataURL(base64);
        };
});

socket.on('send_image', data =>{
  const li = document.createElement('li');
  li.innerHTML = `${data.timestamp}: ${data.username}: ${'<img src="' + data.base64 + '"/>'}`;

  document.querySelector('#chat-messages').appendChild(li);
});

});
});
