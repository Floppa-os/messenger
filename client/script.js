const socket = io();

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const fileInput = document.getElementById('fileInput');

// Загрузка истории сообщений
socket.on('load_messages', (msgs) => {
  msgs.forEach(addMessage);
});

// Новое сообщение
socket.on('new_message', addMessage);

// Отправка сообщения
sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (text) {
    socket.emit('send_message', {
      type: 'text',
      text: text,
      timestamp: new Date().toISOString()
    });
    messageInput.value = '';
  }
});

// Отправка файла
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      socket.emit('send_file', {
        filename: file.name,
        file: e.target.result
      });
    };
    reader.readAsDataURL(file);
    fileInput.value = ''; // Очистка поля
  }
});

// Добавление сообщения в чат
function addMessage(data) {
  const div = document.createElement('div');
  div.className = `message ${data.type === 'file' ? 'file-message' : ''}`;

  if (data.type === 'text') {
    div.textContent = `${new Date(data.timestamp).toLocaleString()}: ${data.text}`;
  } else if (data.type === 'file') {
    const link = document.createElement('a');
    link.href = data.url;
    link.textContent = data.filename;
    link.target = '_blank';
    
    div.innerHTML = `<span class="file-icon">📁</span>`;
    div.appendChild(link);
    div.insertAdjacentHTML('beforeend', ` <small>(${new Date(data.timestamp).toLocaleString()})</small>`);
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
