const UI = document.getElementById('ui');
const body = document.querySelector('body');
const message = document.getElementById('message');
const narrationBox = document.getElementById('narration-box');
const optionBoxes = document.querySelectorAll('.option-box');
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
    console.log(data)
    if (!data.started) {
        data.started = true;
        localStorage.setItem('storyData', JSON.stringify(data));
        setTimeout(() => {
            fadeOut();
        }, 1000);
        createStory(data.prompt);
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

function makeDecision(index) {
    optionBoxes.forEach(box => {
        box.removeEventListener('click', makeDecision);
        box.style.display = 'none';
    });
    console.log("index", index)
    fadeOut();
    fetch('/v0/choose-decision', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number: index + 1})
    }).then(
        res => res.json()
    ).then(data => {
        updateState(data);
    });
}

function updateState(sceneInfo) {
    console.log(sceneInfo)
    message.innerText = '';
    sceneInfo.decisions.forEach((decision, index) => {
        optionBoxes[index].textContent = decision;
        optionBoxes[index].style.display = 'none';
    });

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
        typeInBox(sceneInfo.scene, narrationBox);
    }, 800);
}

function typeInBox(text, element) {
    let sentences = text.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g);
    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].length < 150) {
            sentences[i] = sentences[i] + ' ' + sentences[i + 1];
            sentences.splice(i + 1, 1);
        }
    }

    let currentSentenceIndex = 0;

    function typeSentence() {
        if (currentSentenceIndex < sentences.length) {
            const sentence = sentences[currentSentenceIndex];

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
                        optionBoxes.forEach((box, index) => {
                            box.style.display = 'block';
                        });
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
