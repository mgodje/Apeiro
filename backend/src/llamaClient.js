const url = 'https://muddy-cake-db91.patrick-1.workers.dev/';
const data = {
    prompt: "You are the host of a decision-making game, where you take the user through an adventure using this sentence/words: I am a soldier fighting in a war. Talk in 3rd person and only refer to the user as 'You'. Only produce 4 decisions. Format the output where before you produce the decisions, state this: Here are your options: (1: decision, 2: decision, etc.). After you produce all the decisions, end the sentence and don't say anything else."
} 

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
})
.then(response => response.json())
.then(result => {
    console.log(result["response"]);
})
.catch(error => {
    console.error('error:', error);
});
