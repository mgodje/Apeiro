const UI = document.getElementById('ui');
const body = document.querySelector('body');
const message = document.getElementById('message');
const narrationBox = document.getElementById('narration-box');
const optionBoxes = document.querySelectorAll('.option-box');
const customPrompt = document.getElementById('custom-prompt');
const customPromptInput = document.getElementById('custom-prompt-input');
const customPromptClose = document.getElementById('custom-prompt-close');
const customPromptBtn = document.getElementById('custom-prompt-btn');
const customPromptSubmitBtn = document.getElementById('custom-prompt-submit');
const hearts = document.querySelectorAll('.heart');
const fadeInOut = document.querySelector('.fade');
const storyData = localStorage.getItem('storyData');

optionBoxes.forEach((box, index) => {
    box.addEventListener('click', () => {
        makeDecision(index);
    });
});

if (storyData) {
    let data = JSON.parse(storyData);
    setTimeout(() => {
        fadeOut();
    }, 1000);
    if (!data.started) {
        data.started = true;
        localStorage.setItem('storyData', JSON.stringify(data));
        createStory(data.prompt);
    } else {
        currentScene();
    }
}

function createStory(prompt) {
    fetch('/v0/create-story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    }).then(
        res => res.json()
    ).then(data => {
        updateState(data);;
    });
}

function currentScene() {
    fetch('/v0/current-scene').then(
        res => res.json()
    ).then(data => {
        updateState(data);
    });
}

function makeDecision(index) {
    optionBoxes.forEach(box => {
        box.removeEventListener('click', makeDecision);
        box.style.display = 'none';
    });
    customPromptBtn.style.display = 'none';
    fadeOut();
    fetch('/v0/choose-decision', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            number: index + 1,
            custom: ''
        })
    }).then(
        res => res.json()
    ).then(data => {
        updateState(data);
    });
}

function updateState(sceneInfo) {
    message.innerText = '';
    sceneInfo.decisions.forEach((decision, index) => {
        optionBoxes[index].textContent = decision;
        optionBoxes[index].style.display = 'none';
    });

    if (sceneInfo.decisions.length === 0) {
        optionBoxes.forEach(box => {
            box.style.display = 'none';
        });
    }

    body.style.background = `url(${sceneInfo.image})`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';

    heartNumber = Math.round(sceneInfo.health / 25);
    hearts.forEach((heart, index) => {
        if (index < heartNumber) {
            heart.classList.remove('dead');
        } else {
            heart.classList.add('dead');
        }
    });

    UI.style.display = 'flex';
    narrationBox.textContent = '';

    fadeIn();
    setTimeout(() => {
        typeInBox(sceneInfo.scene, narrationBox, sceneInfo.decisions.length);
    }, 800);
}

function endStory() {
    fadeOut();
    UI.style.display = 'none';
    message.innerText = 'Game Over';
    message.style.zIndex = '100';
    setTimeout(() => {
        message.style.opacity = '1';
        window.location.href = '/explore';
    }, 5000);
}

function replaceSmartQuotes(text) {
    text = text.replace(/[\u201C\u201D]/g, '"');
    text = text.replace(/[\u2018\u2019]/g, "'");
    return text;
}

function typeInBox(text, element, decisionsLength) {
    let sentences = text.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g);
    for (let i = 0; i < sentences.length - 1; i++) { 
        if (sentences[i].length < 150) {
            sentences[i] = sentences[i].trim() + ' ' + sentences[i + 1].trim();
            sentences.splice(i + 1, 1);
            i--;
        }
    }
    let currentSentenceIndex = 0;

    function typeSentence() {
        if (currentSentenceIndex < sentences.length) {
            const sentence = replaceSmartQuotes(sentences[currentSentenceIndex]);
            element.innerHTML = "";
            let charIndex = 0;
            function typeChar() {
                if (charIndex < sentence.length) {
                    element.innerHTML += sentence.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChar, 10); 
                } else {    
                    if (currentSentenceIndex === sentences.length - 1) {
                        UI.style.cursor = 'default';
                        UI.removeEventListener('click', proceedToNextSentence);
                        if (decisionsLength === 0) {
                            setTimeout(() => {
                                endStory();
                            }, 3000);
                            return;   
                        }
                        optionBoxes.forEach((box, index) => {
                            if (decisionsLength === 0) 
                                return;
                            box.style.display = 'block';
                        });
                        customPromptBtn.style.display = 'block';
                    } else {
                        UI.addEventListener('click', proceedToNextSentence);
                        UI.style.cursor = 'pointer';
                    }
                }
            }
            typeChar();
        }
    }

    function proceedToNextSentence() {
        UI.style.cursor = 'default';
        UI.removeEventListener('click', proceedToNextSentence);
        currentSentenceIndex++;
        typeSentence();
    }
    typeSentence();
}

function fadeIn() {
    fadeInOut.classList.add('in');
    setTimeout(() => {
        fadeInOut.style.display = 'none';
    }, 1000);
}

function fadeOut() {
    fadeInOut.style.display = 'block'
    setTimeout(() => {
        fadeInOut.classList.remove('in');
    }, 100);
}

customPromptClose.addEventListener('click', () => {
    customPrompt.style.display = 'none';
});

customPromptBtn.addEventListener('click', () => {
    customPrompt.style.display = 'flex';
});

customPromptSubmitBtn.addEventListener('click', () => {
    const prompt = customPromptInput.value.slice(0, 100);
    if (prompt.length === 0) {
        alert('Please enter a prompt');
        return;
    }
    customPrompt.style.display = 'none';
    customPromptBtn.style.display = 'none';
    fadeOut();
    fetch('/v0/choose-decision', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            number: 0,
            custom: prompt
        })
    }).then(
        res => res.json()
    ).then(data => {
        updateState(data);
    });
});
