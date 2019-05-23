document.addEventListener("DOMContentLoaded", () => {
  // Connect to websocket
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  function resize(image, width, height, quality) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, width, height);
    const resFile = ctx.canvas.toDataURL("image/jpeg", quality);

    return resFile;
  }

  socket.on("connect", () => {
    if (window.localStorage.getItem("username") !== null) {
      var username = window.localStorage.getItem("username");
      const li = document.createElement("li");
      li.innerHTML = "Welcome back " + username + "!";
      document.querySelector("#chat-messages").appendChild(li);
    } else {
      var guest = "Guest" + Math.floor(Math.random() * 10000 + 5000);
      window.localStorage.setItem("username", guest);
      var username = window.localStorage.getItem("username");
      const li = document.createElement("li");
      li.innerHTML = "You are now connected as:  " + username + "!";
      document.querySelector("#chat-messages").appendChild(li);
    }

    socket.emit("welcome", { username: username });
  });

  socket.on("connect", () => {
    document.getElementById("sendForm").addEventListener("submit", e => {
      e.preventDefault();
      const post = document.getElementById("input-message").value;

      const username = window.localStorage.getItem("username");
      document.getElementById("input-message").value = "";
      socket.emit("msg", { post: post, username: username });
    });
  });

  socket.on("disconnect", () => {
    let username = window.localStorage.getItem("username");

    socket.emit("disconnect", { username: username });
  });

  socket.on("quit_msg", data => {
    const span = document.createElement("span");
    span.innerHTML = `${data.timestamp}: ${data.username} disconnected`;

    document.querySelector(".chat").appendChild(span);
  });

  socket.on("wlc", data => {
    const span = document.createElement("span");
    span.innerHTML = `${data.timestamp}: ${data.username} connected`;
    document.querySelector(".chat").appendChild(span);
  });

  socket.on("restr", data => {
    var history = data.history;
    var histLength = history.length;

    for (var i = 0; i < histLength; i++) {
      
      if (history[i].includes("base64")) {
        const divChat = document.createElement("div");
        divChat.className = "chat";
        document.querySelector(".chatlogs").appendChild(divChat);

        const divMessage = document.createElement("p");
        divMessage.className = "chat-message";
        document.querySelector(".chat").appendChild(divMessage);
        const divAvatar = document.createElement("div");
        divAvatar.className = "avatar";
        document.querySelector(".chat").appendChild(divAvatar);
        divMessage.innerHTML = `${'<img src="' + history[i] + '"/>'}`;
      } else if (
        history[i].includes("connect") ||
        history[i].includes("disconnect")
      ) {
        const span = document.createElement("span");
        span.innerHTML = `${history[i]}`;
        document.querySelector(".chat").appendChild(span);
      } else {
        const divChat = document.createElement("div");
        divChat.className = "chat";
        document.querySelector(".chatlogs").appendChild(divChat);

        const divMessage = document.createElement("p");
        divMessage.className = "chat-message";
        document.querySelector(".chat").appendChild(divMessage);
        const divAvatar = document.createElement("div");
        divAvatar.className = "avatar";
        document.querySelector(".chat").appendChild(divAvatar);
        divMessage.innerHTML = history[i];
      }
      //document.querySelector('#chat-messages').appendChild(li);
    }
  });

  socket.on("send_message", data => {
    const divChat = document.createElement("div");
    divChat.className = "chat";
    document.querySelector(".chatlogs").appendChild(divChat);

    const divMessage = document.createElement("p");
    divMessage.className = "chat-message";
    document.querySelector(".chat").appendChild(divMessage);
    const divAvatar = document.createElement("div");
    divAvatar.className = "avatar";
    document.querySelector(".chat").appendChild(divAvatar);
    //const p = document.createElement('p');
    divMessage.innerHTML = `<small><i>${data.timestamp}:<br></i></small> <b>${
      data.username
    }:</b> ${data.post}`;
    //document.querySelector('.chat-message').appendChild(p);
  });

  socket.on("connect", () => {
    document.getElementById("imagefile").addEventListener("change", e => {
      //var width =200;
      //var height=200;
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

          socket.emit("user_image", { base64: base64 });
        };
      };
    });
  });

  socket.on("send_image", data => {

    const p = document.createElement("p");
    p.className = "chat-message";
    p.innerHTML = `${data.timestamp}: ${data.username}: ${'<img src="' +
      data.base64 +
      '"/>'}`;

    document.querySelector(".chat").appendChild(p);
    const divAvatar = document.createElement("div");
    divAvatar.className = "avatar";
    document.querySelector(".chat").appendChild(divAvatar);
  });
});
