const socket = io('https://proyo-chat-module.vercel.app/');
const chat = document.getElementById('chat');
const usernameInput = document.getElementById('usernameInput');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Load chat history from server
fetch('https://proyo-chat-module.vercel.app/chats')
    .then(response => response.json())
    .then(data => {
        data.forEach(chat => {
            addMessage(chat.username, chat.message);
    });
});

// Add message to the chat box
function addMessage(username, message) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<span class="username">${username}:</span> <i> ${message} </i>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// Send message on button click
sendButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const message = messageInput.value;
    if (username && message) {
        socket.emit('sendMessage', { username, message });
        messageInput.value = '';
    }
});

// Receive new message from server
socket.on('receiveMessage', (data) => {
    addMessage(data.username, data.message);
});