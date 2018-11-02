// DOM Elements
const todoForm = document.getElementById('toDo');
const todoInput = document.getElementById('todoInput');
const beepStart = document.getElementById('beepStart');
const beepEnd = document.getElementById('beepEnd');
const micOff = document.querySelector('#micOff')
const micOn = document.querySelector('#micOn')
const itemList = document.getElementById('todoList');
const clearBtn = document.getElementById('clearList');
const feedback = document.querySelector('.feedback');
// Main arrays
let itemData = JSON.parse(localStorage.getItem('list')) || [];
let itemDone = JSON.parse(localStorage.getItem('list-done')) || [];

// To check if the user browser is chrome because unfortunately speech recognition in not yet supported elsewhere
const isChrome = !!window.chrome;

if (!isChrome) {
    // Remove the mic btn since we dont need it
    document.getElementById('mic').remove();
} else {
    // Speech recognition
    const constraints = {
        audio: true
    };

    // We are going to ask for mic permission
    navigator.mediaDevices.getUserMedia(constraints)
        // if ok.. 
        .then(() => {
            window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.interimResults = true;
            recognition.lang = 'en-US' || navigator.language;
            // onStart
            recognition.onresult = e => {
                let speech = '';
                for (const result of e.results) {
                    speech += result[0].transcript;
                    // Display on DOM
                    todoInput.value = speech;
                    //completed = interim;
                    if (result.isFinal) {
                        // Now we overwrite it
                        todoInput.value = speech;
                    }
                }
            }
            // OnSpeech
            recognition.onspeechstart = () => {
                todoInput.setAttribute('placeholder', 'Listening..');
            }
            // onEnd
            recognition.onspeechend = () => {
                micOn.classList.add('d-none');
                micOff.classList.remove('d-none');
                todoInput.setAttribute('placeholder', 'What else?');
                beepEnd.play();
            }
            // Start speech btn
            micOff.addEventListener('click', e => {
                e.currentTarget.classList.add('d-none');
                micOn.classList.remove('d-none');
                beepStart.play();
                recognition.start();
            });
            // Abort btn
            micOn.onclick = () => {
                micOn.classList.add('d-none');
                micOff.classList.remove('d-none');
                todoInput.setAttribute('placeholder', 'What to do?');
                beepEnd.play();
                recognition.abort();
            }
        })
        // always check for errors at the end.
        .catch(err => console.log(err.name + ": " + err.message));
}

// Create new list (if any) from saved localStorage when page load
if (itemData.length > 0) {
    itemData.forEach(list => {
        addItem(list)
        itemsControl(list);
    })
}

// Form submit handler
todoForm.addEventListener('submit', e => {
    e.preventDefault();
    const textValue = todoInput.value;
    if (textValue === '') {
        doAlert('Please enter a valid value', 'danger')
    } else if (itemData.includes(textValue)) {
        doAlert('Item already exists.', 'danger')
    } else {
        doAlert(`Item Added!`, `success`);
        // Add item
        addItem(textValue);
        // Clear the form input
        todoInput.value = '';
        // Add the entered item to the main array
        itemData.push(textValue);
        // Save to Localstorage
        localStorage.setItem('list', JSON.stringify(itemData));
        // Add eventListener to icons
        itemsControl(textValue);
    }
});

// Add item
function addItem(value) {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'item', 'd-flex', 'justify-content-between');
    const completed = itemDone.includes(value) ? 'completed' : '';
    li.innerHTML = `<p class="m-0 p-1 item-name ${completed}">${value}</p>
    <span class="item-icons">
    <a href="#" class="item-icon icon-complete"><img src="img/done_all.svg"></a>
    <a href="#" class="item-icon icon-delete"><img src="img/delete.svg"></a>
    <a href="#" class="item-icon icon-edit"><img src="img/edit.svg"></a>
    </span>`;
    // show clear btn if there is any item
    if (value) clearList.classList.remove('d-none');
    itemList.appendChild(li);
}
// Handle items event listener
function itemsControl(value) {
    const items = itemList.querySelectorAll('.item');
    // Loop through all items
    items.forEach(item => {
        // Check if item has the same value
        if (item.querySelector('.item-name').textContent === value) {
            // Compelete event
            item.querySelector('.icon-complete').addEventListener('click', function (e) {
                e.preventDefault();
                item.querySelector('.item-name').classList.toggle('completed');
                this.classList.toggle('visibility');
                itemDone.push(value);
                localStorage.setItem('list-done', JSON.stringify(itemDone));
            });
            // Edit event
            item.querySelector('.icon-edit').addEventListener('click', function (e) {
                e.preventDefault();
                todoInput.value = value;
                todoInput.focus();
                itemList.removeChild(item);
                itemData = itemData.filter(i => i !== value)
                localStorage.setItem('list', JSON.stringify(itemData));
            });
            // Delete event
            item.querySelector('.icon-delete').addEventListener('click', function (e) {
                e.preventDefault();
                itemList.removeChild(item);
                // Save Item data
                itemData = itemData.filter(i => i !== value);
                localStorage.setItem('list', JSON.stringify(itemData));
                // Save done items too
                itemDone = itemDone.filter(i => i !== value);
                localStorage.setItem('list-done', JSON.stringify(itemDone));
                doAlert(`Item Deleted!`, `success`);
            })
        }
    })
}

// Show Alerts
function doAlert(message, style) {
    feedback.classList.remove('hidden');
    feedback.classList.add('fadeIn', `alert-${style}`);
    feedback.textContent = message;
    // Remove the alert after 1s
    setTimeout(() => {
        feedback.classList.add('hidden');
        feedback.classList.remove('fadeIn', `alert-${style}`);
    }, 1000)
}

// Clear all 
clearBtn.addEventListener('click', () => {
    itemData = [];
    itemDone = [];
    localStorage.removeItem('list');
    localStorage.removeItem('list-done');
    const items = itemList.querySelectorAll('.item');
    if (items.length > 0) {
        items.forEach(item => itemList.removeChild(item))
    }
    clearList.classList.add('d-none');
});
