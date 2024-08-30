const userInput = document.getElementById('userInput');
const yesBtn = document.querySelector('.button_yes');
const noBtn = document.querySelector('.button_no');
const startBtn = document.querySelector('.button_start');

let narration = false;

// Event listeners

// yesBtn.addEventListener('click', () => {
//   narration = true;
//   document.querySelector('.narrator-text').innerText = 'Do you want a Narrator? (YES)';
// });

// noBtn.addEventListener('click', () => {
//     narration = false;
//     document.querySelector('.narrator-text').innerText = 'Do you want a Narrator? (NO)';
// }); 

startBtn.addEventListener('click', () => {
    const prompt = userInput.value.slice(0, 100);
    if (prompt.length === 0) {
        alert('Please enter a prompt');
        return;
    }

    const storyData = JSON.stringify({
        started: false,
        prompt: prompt,
        narration: narration
    });
    
    localStorage.setItem('storyData', storyData);
    window.location.href = '/game';
});
