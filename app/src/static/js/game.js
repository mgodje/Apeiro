const UI = document.getElementById('ui');
const storyData = localStorage.getItem('storyData');

if (storyData) {
    let data = JSON.parse(storyData);
    if (!data.started) {
        data.started = true;
        localStorage.setItem('storyData', JSON.stringify(data));
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
        console.log(data);
    });
}
