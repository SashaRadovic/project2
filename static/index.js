window.onbeforeunload = ()=>{
     window.sessionStorage.clear();
}

document.addEventListener("DOMContentLoaded", () => {
  // Connect to websocket
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );
  if (window.localStorage.getItem('avatar') != null){
  var avatarSrc=window.localStorage.getItem('avatar');
  document.getElementById('inputAvatarLabel').style.backgroundImage="url("+avatarSrc+")"
}

  function resize(image, width, height, quality) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, width, height);
    const resFile = ctx.canvas.toDataURL("image/jpeg", quality);

    return resFile;
  }

  function getGifs(value){
        let urlGIF = `https://api.tenor.com/v1/search?q=${value}&key=V413C22P4CZD&limit=9&anon_id=3a76e56901d740da9e59ffb22b988242`;
         console.log(urlGIF)
  	  fetch(urlGIF)

          .then((res) => res.json())
          .then((data) => {
  		for ( var i=0;i<9; i++){
              imgSRC=data["results"][i]["media"][0]["nanogif"]['url']
  		   console.log(imgSRC)
  		    let img= document.createElement('img')
  			img.src=imgSRC
  			img.setAttribute('class', 'searchGIFS')
  			img.width = "50";
  			img.height="50";
            document.querySelector('#gifs').appendChild(img)
  		    document.querySelector('#divGIF').appendChild(document.querySelector('#gifs'))
  			img.onclick=sendGIFToServer;




             }

          })
         .catch((error) => console.log(error));
      }

      function clearGIFS (){
          document.querySelector('#gifs').innerHTML='';
      }

      function sendGIFToServer (){


      		imgSrc=this.src
      		let username = window.localStorage.getItem('username')
            let room = window.localStorage.getItem('room')
            if (window.localStorage.getItem('avatar') != null){
            var avatarSrc=window.localStorage.getItem('avatar');}
            socket.emit("sendGIF", {imgSrc:imgSrc, username:username, room:room, avatarSrc:avatarSrc})
      		clearGIFS();
      };


  function package (data ){
  const divChat = document.createElement("li");
  divChat.className='chat';
  document.querySelector("ul").appendChild(divChat);




  const divAvatar = document.createElement("div");
  divAvatar.className = "avatar";
  if (data.avatarSrc !=null){
      divAvatar.style.backgroundImage="url("+data.avatarSrc+")"}
  divChat.appendChild(divAvatar);

  const divUser = document.createElement('p');
  divUser.className ='user';
  divUser.innerHTML=`${data.username}`
  divChat.appendChild(divUser);

  if (data.post !=null){
  const divMessage = document.createElement("p");
  divMessage.className = "chat-message";
  divMessage.innerHTML =` ${data.post}`;
  divChat.appendChild(divMessage);
  }

  if (data.base64!=null){
  const divImage = document.createElement("p");
  divImage.className = "chat-img";
  divImage.innerHTML = `${'<img src="' + data.base64 + '"/>'} `;
  divChat.appendChild(divImage);
  }

  if (data.imgSrc!=null){
   const divImage = document.createElement("p");
   divImage.className = "chat-img";
   divImage.innerHTML = `${'<img src="' + data.imgSrc + '"/>'} `;
   divChat.appendChild(divImage);
   }

   const divTime= document.createElement('p');
   divTime.className ='time';
   divTime.innerHTML=`${data.timestamp}`
   divChat.appendChild(divTime);
   document.querySelector('.chatlogs').scrollTop=document.querySelector('.chatlogs').scrollHeight;
  }

function settingRoom(){
    const changeRoom =this.innerText;
    const oldRoom=window.localStorage.getItem('room');
    console.log(this.innerText);
    var username=localStorage.getItem('username')
    console.log(username)
    document.querySelector('h3').innerHTML='#'+changeRoom;

    window.localStorage.setItem('room',changeRoom)
    socket.emit('selectRoom', {username:username, room:changeRoom, oldRoom:oldRoom})
}

  document.querySelector('#inputUserButton').addEventListener('click', ()=>{
      let oldUser=window.localStorage.getItem('username');
      let newUser = document.querySelector('#post-username').value ;
      let room= window.localStorage.getItem('room');
      socket.emit("addUser", {username:newUser, room:room, oldUser:oldUser})
      document.querySelector('#post-username').value='';
      window.localStorage.setItem('username', newUser);

  })
socket.on("checkUser", (data)=>{
    window.localStorage.setItem('userPerRoom', JSON.stringify(data.users_per_rooms));
})

/////////////////
socket.on("roomChange", (data)=>{
    window.localStorage.setItem('userPerRoom', JSON.stringify(data.users_per_rooms));
    document.querySelectorAll('.ch-button').forEach (function(button){

        var buttonValue = button.innerText
        console.log(button.innerText)
        var users =Object.values(data.users_per_rooms);
        if(button.contains(button.querySelector('span'))){
        button.removeChild(button.querySelector('span'))}

        console.log(users);

        if(users.indexOf(buttonValue)!=-1){
        var numberOfUsers =
        users.filter(function(value){
        return value === buttonValue;}).length;
        let badge=document.createElement('span')
        badge.className='badge';
        badge.innerHTML=numberOfUsers;
        button.appendChild(badge);
                    }


});
});



  socket.on("connect", () => {
const inputChannel =document.querySelector('#post-channel');
document.getElementById("inputChannelButton").addEventListener("click", e => {
     e.stopPropagation();
        const newRoom = inputChannel.value;
        console.log(newRoom)


          const username = window.localStorage.getItem("username");
          if (inputChannel.value !=''){

         socket.emit("addRoom", {username: username, room :newRoom });
         inputChannel.value =''
    }

});
});



  socket.on("connect", () => {
    if (window.localStorage.getItem("username") !== null) {
      var username = window.localStorage.getItem("username");
      const wMessage = document.createElement("li");
      wMessage.className='server-message';

      var room = window.localStorage.getItem("room");
      wMessage.innerHTML = "Welcome back " + username + "!";
      document.querySelector("#chat-wrp").appendChild(wMessage);
      document.querySelector("h3").innerHTML = "#" + room;
  }

      else {
      var guest = "Guest" + Math.floor(Math.random() * 10000 + 5000);
      window.localStorage.setItem("username", guest);
      var username = window.localStorage.getItem("username");
      const info = document.createElement("li");
      var room = "general";
      window.localStorage.setItem("room", room);

      info.innerHTML =
        "You are now connected as:  " +
        username +
        ", on channel --"+ room+ "! You can set new username or channel";
      document.querySelector("#chat-wrp").appendChild(info);
      document.querySelector("h3").innerHTML = "#" + room;
  };
    socket.emit("welcome", { username: username, room: room });
  });



  socket.on("connect", () => {
       const input = document.getElementById("input-message");
       document.querySelectorAll('.emoji').forEach(function(button) {
              button.onclick = function(e) {
              e.stopPropagation();
              console.log(input.value);
              input.value +=  String.fromCodePoint(button.dataset.value);
              }
       });
    document.getElementById("input-send").addEventListener("click", e => {
      e.preventDefault();


      if (window.localStorage.getItem('avatar') != null){
      var avatarSrc=window.localStorage.getItem('avatar');}

          const post = input.value;
          console.log(post);
          let room = window.localStorage.getItem("room");
          const username = window.localStorage.getItem("username");
          if (input.value !=''){
              console.log(avatarSrc);
          socket.emit("msg", { post: post, username: username, room: room, avatarSrc:avatarSrc });
      }
          document.getElementById("input-message").value = "";
      });
  });

  socket.on("wlc", data => {
      document.querySelector('#newItem').innerHTML="";
      window.localStorage.setItem('userPerRoom', JSON.stringify(data.users_per_rooms));
      var users_per_rooms =JSON.parse(window.localStorage.getItem('userPerRoom'))
      const divChat = document.createElement("li");
      divChat.className = "chat";
      document.querySelector("ul").appendChild(divChat);
      const span = document.createElement("p");
      span.className = "server-message";
      span.innerHTML = `${data.timestamp}: ${
      data.username
      } connected on channel ${data.room}`;
      divChat.appendChild(span);
      console.log(data.channels)


    //if (sessionStorage.getItem('channels')==null){
    //    sessionStorage.setItem('channels', 'set')








     for (i =0; i<data.channels.length;i++){
         var channelButton = document.createElement('button');
         console.log(i)
         channelButton.className='ch-button form-control';
         channelButton.innerHTML=data.channels[i];
         console.log(data.channels[i])
         document.getElementById('newItem').appendChild(channelButton);
         var users =Object.values(users_per_rooms);


         if(users.indexOf(data.channels[i])!=-1){
         var numberOfUsers =
         users.filter(function(value){
         return value === data.channels[i];}).length;
         let badge= document.createElement('span');
         badge.innerHTML=numberOfUsers;

         badge.className='badge';
         channelButton.appendChild(badge);
     }


         channelButton.onclick = settingRoom;

        // document.querySelector('#newItem').appendChild(channelButton);
     }

    window.localStorage.setItem('userPerRoom', JSON.stringify(data.users_per_rooms));
  });


socket.on("createRoom", data=>{
    var channelButton =document.createElement('button');
    channelButton.className='ch-button form-control';
    channelButton.innerHTML=data.room;
    console.log(data.room);
    channelButton.onclick = settingRoom;
    document.querySelector('#newItem').appendChild(channelButton);
})

document.querySelector('#searchGIFButton').addEventListener('click', (e)=>{
         e.stopPropagation();
         var value=document.querySelector('#searchGIF').value
		 if (value!=""){
		 clearGIFS()
		 getGifs(value)
		 //value=document.querySelector('#searchGif').style.display='box;'
		 }
});
document.querySelector('#GIF').addEventListener('click', (e)=>{

				if (document.querySelector('#searchGIF').value==''){
				var value="trending"
		 } else{var value = document.querySelector('#searchGIF').value}
					clearGIFS();
					getGifs(value);



});




socket.on("gifDisplay", data => {

      package(data);

});

  socket.on("send_message", data => {
    if (data.post !=''){
        package(data);
    }
  });

  socket.on("connect", () => {
    document.getElementById("imagefile").addEventListener("change", e => {

      let room = window.localStorage.getItem("room");
      var file = e.target.files[0],
        reader = new FileReader();

      reader.readAsDataURL(e.target.files[0]);
      reader.onload = function(evt) {
        const img = new Image();
        img.src = evt.target.result;
        var mock = img.src;

        img.onload = () => {
          image = new Image();
          image.src = mock;
          var base64 = resize(image, 150, 100, 0.6);
          if (window.localStorage.getItem('avatar') != null){
          var avatarSrc=window.localStorage.getItem('avatar');}
          socket.emit("user_image", { base64: base64, room: room,avatarSrc:avatarSrc });
        };
      };
    });
  });

  socket.on("send_image", data => {

      package(data)

  });



document.getElementById('inputAvatar').addEventListener('change', e =>{
    var file = e.target.files[0],
      reader = new FileReader();

    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function(evt) {
      const img = new Image();
      img.src = evt.target.result;
      var mock = img.src;

      img.onload = () => {
        image = new Image();
        image.src = mock;
        var avatarSrc = resize(image, 50, 50, 0.5);
        document.getElementById('inputAvatarLabel').style.backgroundImage="url("+avatarSrc+")"
        window.localStorage.setItem('avatar', avatarSrc);
    };
};
});














socket.on("restr", data => {
  document.querySelector('#chat-wrp').innerHTML='';
  var history = data.history;
  var histLength = history.length;

  for (var i = 0; i < histLength; i++) {

        var historySplit=history[i].split("$??$");

    var divChat = document.createElement("li");
    divChat.className = "chat";
    document.querySelector("ul").appendChild(divChat);



    var divAvatar = document.createElement("div");
    divAvatar.className = "avatar";
    if(historySplit[1]!=window.localStorage.getItem('username')){
    divAvatar.style.backgroundImage="url("+historySplit[0]+")"}
    else{divAvatar.style.backgroundImage="url("+(window.localStorage.getItem('avatar'))+")"}
    divChat.appendChild(divAvatar);

    var divUsername = document.createElement("p");
    divUsername.className = "user";
    divUsername.innerHTML = historySplit[1];
    divChat.appendChild(divUsername);

    if ((historySplit[2].includes("data:image/jpeg;base64")||(historySplit[2].includes("https://media.tenor.com")))) {
     // const divChat = document.createElement("li");
     // divChat.className = "chat";
     // document.querySelector("ul").appendChild(divChat);

      var divMessage = document.createElement("p");
      divMessage.className = "chat-img";
     // divMessage.appendChild(divTimestamp)
      divChat.appendChild(divMessage);

      divMessage.innerHTML = `${'<img src="' + historySplit[2] + '"/>'}`;
    }
    else  {
        //const divChat = document.createElement("li");
        //divChat.className = "chat";
    //    document.querySelector("ul").appendChild(divChat);

        var divMessage = document.createElement("p");
        divMessage.className = "chat-message";
        divChat.appendChild(divMessage);
        //divMessage.appendChild(divTimestamp)
        divMessage.innerHTML =historySplit[2];

    }
    const divTimestamp = document.createElement("p");
    divTimestamp.className = "time";
    divChat.appendChild(divTimestamp);
    divTimestamp.innerHTML = historySplit[3];
    document.querySelector('.chatlogs').scrollTop=document.querySelector('.chatlogs').scrollHeight;

     //else if (historySplit[2].includes("https://media.tenor.com")) {
//      const divChat = document.createElement("li");
//      divChat.className = "chat";
//      document.querySelector("ul").appendChild(divChat);

    //  const divMessage = document.createElement("p");
//      divMessage.className = "chat-message";
//      divChat.appendChild(divMessage);

//      divMessage.innerHTML = `${'<img src="' + historySplit[2] + '"/>'}`;
//    }

    //else if (
//      history[i].includes("connect") ||
//      history[i].includes("disconnect")
//    ) {
    //    const divChat = document.createElement("li");
    //    divChat.className = "chat";
    //    document.querySelector("ul").appendChild(divChat);
    //  const span = document.createElement("p");
    //  span.className = "server-message";
//      span.innerHTML = `${history[i]}`;
//      divChat.appendChild(span);
//    }

//    else {



    }

});
socket.on("disconnect", () => {
  let username = window.localStorage.getItem("username");
  let room = window.localStorage.getItem("room");
  socket.emit("disconnect", { username: username, room: room });
});

socket.on("quit_msg", data => {
  const li = document.createElement("li");
  li.className = "server-message";
  li.innerHTML = `${data.timestamp}: ${data.username} disconnected`;

  document.querySelector("ul").appendChild(li);
});



});
