import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const textarea = document.querySelector('textarea');

textarea.focus();


function switchMode() {
  let mode = document.getElementById ("mode");
  
  if(mode.className == "moon"){
    mode.classList.remove("moon");
    mode.classList.add("sun");

    document.body.style.backgroundColor = "#343541";
    document.body.style.color = "#fff";
    form.style.backgroundColor = "#40414F";
    textarea.style.color = "#fff";
    chatContainer.style.color = "#dcdcdc";
    document.documentElement.style.setProperty('--col', '#40414F');
  }
  else {
    mode.classList.remove("sun");
    mode.classList.add("moon");

    document.body.style.backgroundColor = "#fff";
    document.body.style.color = "#000";
    form.style.backgroundColor = "#fff";
    textarea.style.color = "#000";
    chatContainer.style.color = "#313030";
    document.documentElement.style.setProperty('--col', '#cad3d166');
  }
}

document.querySelector('.toggle').addEventListener('click', switchMode);

let loadInterval;

function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight

    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }
    else{
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId){
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src=${isAi ? bot : user} 
              alt="${isAi ? 'bot' : 'user'}" 
            />
          </div>
          <div class="message" id=${uniqueId}> ${value} </div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (event) => {
  event.preventDefault();
  
  textarea.style.height = '';
  
  const data = new FormData(form);
  
  // user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // to clear the textarea input
  form.reset();

  // bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response
  // dev -> http://localhost:5000    prod -> https://conversant-ai.onrender.com
  const response = await fetch('https://conversant-ai.onrender.com', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);

  }else{
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}


form.addEventListener('submit', handleSubmit);

let shiftDown = false;
form.addEventListener('keydown', (event) => {
  if(!shiftDown && event.key === 'Enter'){
    handleSubmit(event);
  }
});
form.addEventListener('keydown', (event) => {
  if(event.key === 'Shift') shiftDown = true;
})
form.addEventListener('keyup', (event) => {
  if(event.key === 'Shift') shiftDown = false;
})