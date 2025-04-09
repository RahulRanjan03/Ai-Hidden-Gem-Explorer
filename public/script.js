var context = [];

document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Enhanced place validation (strictly countries, states, or cities)
function isValidPlace(input) {
    // Regex for 1-3 words, each word containing only letters, with spaces between
    const placeNameRegex = /^([A-Za-z]+(?:\s+[A-Za-z]+){0,2})$/;
    // List of terms that suggest non-place entities (e.g., features, activities)
    const nonPlaceTerms = [
        'mines', 'mine', 'gold', 'silver', 'copper', 'ore', 'deposit', 'quarry', 'pit', 'shaft',
        'beach', 'resort', 'hotel', 'tourist', 'spot', 'park', 'mountain', 'river', 'lake', 'forest',
        'desert', 'valley', 'canyon', 'waterfall', 'island'
    ];
    // Check if input matches place name pattern and has no numbers or special chars
    const isValidPattern = placeNameRegex.test(input) && !/\d/.test(input) && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(input);
    // Check if input contains any non-place terms (case-insensitive)
    const hasNonPlaceTerm = nonPlaceTerms.some(term => input.toLowerCase().includes(term.toLowerCase()));
    
    return isValidPattern && !hasNonPlaceTerm;
}

// Send message function with loading animation
async function sendMessage() {
    var prompt = '';
    context.forEach(element => {
        prompt = JSON.stringify(element);
    });
    var payload = {};
    const inputField = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const rawMessage = inputField.value.trim();

    // Validate input as a place name (countries, states, or cities only)
    if (!rawMessage || !isValidPlace(rawMessage)) {
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Please enter a valid place name (e.g., India, Rajasthan, Jaipur). Only countries, states, or cities are allowed.';
        errorMessage.style.background = '#ff4562';
        errorMessage.style.color = 'white';
        errorMessage.style.padding = '12px 18px';
        errorMessage.style.margin = '8px 0';
        errorMessage.style.borderRadius = '15px';
        errorMessage.style.alignSelf = 'flex-start';
        errorMessage.style.maxWidth = '80%';
        chatBox.appendChild(errorMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
        inputField.value = '';
        return;
    }

    const message = prompt + ' ' + rawMessage;
    payload.userMessage = message;

    if (message) {
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.textContent = rawMessage;
        userMessage.style.background = '#212623';
        userMessage.style.color = 'white';
        userMessage.style.padding = '12px 18px';
        userMessage.style.margin = '8px 0';
        userMessage.style.borderRadius = '15px';
        userMessage.style.alignSelf = 'flex-end';
        userMessage.style.maxWidth = '80%';
        userMessage.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        chatBox.appendChild(userMessage);

        // Add typing animation instead of loader
        const typing = document.createElement('div');
        typing.className = 'typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatBox.appendChild(typing);
        chatBox.scrollTop = chatBox.scrollHeight;
        inputField.value = '';

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: message })
            });

            const data = await response.json();
            console.log("Frontend Received:", data.reply); // Add this for debugging
            chatBox.removeChild(typing);
            payload.aiResponse = data.reply;
            context.push(payload);

            // Format AI response
            let formattedText = data.reply
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')  // Links
                .replace(/\n/g, '<br>')  // New lines
                .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');  // Code blocks

            // Add bot response
            const botMessage = document.createElement('div');
            botMessage.innerHTML = formattedText; // Use innerHTML to render formatting
            botMessage.style.background = '#2C2040';
            botMessage.style.color = '#fff';
            botMessage.style.padding = '12px 18px';
            botMessage.style.margin = '8px 0';
            botMessage.style.borderRadius = '15px';
            botMessage.style.alignSelf = 'flex-start';
            botMessage.style.maxWidth = '80%';
            botMessage.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            chatBox.appendChild(botMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (error) {
            console.error('Error fetching response:', error);
            chatBox.removeChild(typing);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Oops! Something went wrong. Try again!';
            errorMessage.style.background = '#ff4562';
            errorMessage.style.color = 'white';
            errorMessage.style.padding = '12px 18px';
            errorMessage.style.margin = '8px 0';
            errorMessage.style.borderRadius = '15px';
            errorMessage.style.alignSelf = 'flex-start';
            errorMessage.style.maxWidth = '80%';
            chatBox.appendChild(errorMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
}

// Delete button functionality
document.getElementById('delete-btn').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    const welcomeMessage = document.createElement('div');
    welcomeMessage.textContent = 'Hey there! Ready to explore some hidden gems? Ask me anything!';
    welcomeMessage.style.textAlign = 'center';
    welcomeMessage.style.color = '#fff';
    welcomeMessage.style.padding = '15px';
    welcomeMessage.style.fontSize = '18px';
    welcomeMessage.style.fontStyle = 'italic';
    welcomeMessage.style.background = 'linear-gradient(45deg, #007bff, #00d4ff)';
    welcomeMessage.style.borderRadius = '12px';
    welcomeMessage.style.marginBottom = '15px';
    welcomeMessage.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
    welcomeMessage.style.maxWidth = '85%';
    welcomeMessage.style.alignSelf = 'center';
    chatBox.appendChild(welcomeMessage);
});

// Attach files button functionality
document.getElementById('attach-btn').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function() {
    const chatBox = document.getElementById('chat-box');
    const files = this.files;
    if (files.length > 0) {
        const fileMessage = document.createElement('div');
        let fileList = 'Attached files:\n';
        for (let i = 0; i < files.length; i++) {
            fileList += `- ${files[i].name} (${(files[i].size / 1024).toFixed(2)} KB)\n`;
        }
        fileMessage.textContent = fileList;
        fileMessage.style.background = 'linear-gradient(45deg, #17a2b8, #20c997)';
        fileMessage.style.color = 'white';
        fileMessage.style.padding = '12px 18px';
        fileMessage.style.margin = '8px 0';
        fileMessage.style.borderRadius = '15px';
        fileMessage.style.alignSelf = 'flex-end';
        fileMessage.style.maxWidth = '80%';
        fileMessage.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        fileMessage.style.whiteSpace = 'pre-line'; // Preserve line breaks
        chatBox.appendChild(fileMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
        this.value = ''; // Reset file input
    }
});

// Voice button functionality
document.getElementById('voice-btn').addEventListener('click', function() {
    const inputField = document.getElementById('user-input');
    const voiceBtn = this;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        voiceBtn.style.background = 'linear-gradient(45deg, #e84393, #ff7675)';
        inputField.placeholder = 'Say a place name (e.g., India, Rajasthan, Jaipur)...';

        recognition.onstart = function() {
            console.log('Voice recognition started.');
        };

        recognition.onresult = function(event) {
            const speechResult = event.results[0][0].transcript.trim();
            if (isValidPlace(speechResult)) {
                inputField.value = speechResult;
                sendMessage();
            } else {
                inputField.value = '';
                const chatBox = document.getElementById('chat-box');
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Please say a valid place name (e.g., India, Rajasthan, Jaipur). Only countries, states, or cities are allowed.';
                errorMessage.style.background = '#ff4562';
                errorMessage.style.color = 'white';
                errorMessage.style.padding = '12px 18px';
                errorMessage.style.margin = '8px 0';
                errorMessage.style.borderRadius = '15px';
                errorMessage.style.alignSelf = 'flex-start';
                errorMessage.style.maxWidth = '80%';
                chatBox.appendChild(errorMessage);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            let errorMessage = '';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please speak clearly!';
                    break;
                case 'audio-capture':
                    errorMessage = 'Microphone issue. Check your device!';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Allow permissions!';
                    break;
                case 'network':
                    errorMessage = 'Network error. Check your connection!';
                    break;
                default:
                    errorMessage = 'Speech recognition failed. Try again!';
            }
            inputField.value = errorMessage;
        };

        recognition.onend = function() {
            console.log('Voice recognition ended.');
            voiceBtn.style.background = 'linear-gradient(45deg, #6f42c1, #9b59b6)';
            inputField.placeholder = 'Type a place name...';
        };

        try {
            recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            inputField.value = 'Failed to start voice recognition. Try again!';
            voiceBtn.style.background = 'linear-gradient(45deg, #6f42c1, #9b59b6)';
        }
    } else {
        inputField.value = 'Speech recognition not supported in this browser.';
    }
});

// Particle Animation with Mouse Interaction
// Particle Animation with Mouse Interaction and Mode Consistency
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesArray = [];
const numberOfParticles = 150;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.updateColor(); // Set initial color based on mode
        this.angle = 0;
        this.distance = 0;
    }

    updateColor() {
        // Check if dark mode is active (assumes 'dark-mode' class on body or data-theme)
        const isDarkMode = document.body.classList.contains('dark-mode') || 
                          document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Use contrasting colors: lighter in dark mode, darker in light mode
        this.color = isDarkMode 
            ? `hsl(${Math.random() * 360}, 70%, 70%)` // Lighter particles for dark mode
            : `hsl(${Math.random() * 360}, 70%, 30%)`; // Darker particles for light mode
    }

    update(mouse) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);
        if (this.distance < 100) {
            this.x += Math.cos(this.angle) * 2;
            this.y += Math.sin(this.angle) * 2;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particlesArray.length = 0; // Clear existing particles
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDarkMode = document.body.classList.contains('dark-mode') || 
                      document.documentElement.getAttribute('data-theme') === 'dark';
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(mouse);
        particlesArray[i].draw();
        for (let j = i; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                ctx.beginPath();
                // Use a neutral gray line that works in both modes, with opacity based on distance
                ctx.strokeStyle = isDarkMode 
                    ? `rgba(200, 200, 200, ${1 - distance / 150})` // Light gray for dark mode
                    : `rgba(100, 100, 100, ${1 - distance / 150})`; // Darker gray for light mode
                ctx.lineWidth = 1;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

const mouse = { x: null, y: null };
canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Observe theme changes (if dynamically toggled)
const observer = new MutationObserver(() => {
    particlesArray.forEach(particle => particle.updateColor()); // Update colors on mode change
});
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

init();
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(); // Reinitialize particles to fit new canvas size
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});