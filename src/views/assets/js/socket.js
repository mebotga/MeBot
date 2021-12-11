const socket = io.connect("https://mebot.ga");

socket.on('userCount', userCount => {
let doc = document.getElementById('connectionCount');
  if(doc) {
    doc.innerHTML = userCount;
  }
})