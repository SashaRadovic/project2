
const package = (data )=>{
const divChat = document.createElement("li");
divChat.className='chat';
document.querySelector(".chat-wrp").appendChild(divChat);

const divAvatar = document.createElement("div");
divAvatar.className = "avatar";
document.querySelector(".chat").appendChild(divAvatar);

const divMessage = document.createElement("p");
divMessage.className = "chat-message";
divMessage.innerHTML =` ${data.post}`;
document.querySelector(".chat").appendChild(divMessage);

const divUser = document.createElement('p');
divUser.className ='user';
divUser.innerHTML=`${data.username}`
document.querySelector('.chat').appendChild(divUser);

const divImage = document.createElement("p");
divImage.className = "chat-img";
divImage.innerHTML = `${'<img src="' + data.base64 + '"/>'} `;
document.querySelector(".chat").appendChild(divImage);

const divTime= document.createElement('p');
divTime.className ='time';
divTime.innerHTML=`${data.timestamp}`
document.querySelector('.chat').appendChild(divTime);
}
