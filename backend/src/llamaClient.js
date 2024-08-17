const url = 'https://muddy-cake-db91.patrick-1.workers.dev/';
const scenes = {}

/**
 * Find the latest scene
 * 
 * @returns {object} Latest Scene
 */
function findLatestScene() {
  const keys = Object.keys(scenes);
  const latestValue = keys[keys.length-1];
  return scenes[latestValue];
}

/**
 * Find the latest value
 * 
 * @returns {number} Latest Value
 */
function findLatestValue() {
  const keys = Object.keys(scenes);
  return keys[keys.length-1];
}

/**
 * Adds current scene to a dictionary
 * 
 * @param {*} data
 */
function addContext(data) {
  if (Object.keys(scenes).length === 0) {
    scenes[1] = [{scene: data, decision: null}];
    return;
  }
  const latestValue = findLatestScene();
  scenes[latestValue+1] = [{scene: data, decision: null}];
}

/**
 * Creates the initial story
 * 
 * @param {string} userPrompt The prompt the user created
 */
function createStory(userPrompt) {
  const data = {
    prompt: `You are the host of a decision-making game, where you take the user 
    through an adventure using this sentence/words: ${userPrompt}.
    Talk in 3rd person and only refer to the user as 'You'.
    Only produce 4 decisions. Format the output where before you produce the decisions, 
    state this: Here are your options: (1: decision, 2: decision, etc.). 
    After you produce all the decisions, end the sentence and don't say anything else.`
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
    addContext(result["response"]);
    console.log(result["response"]);
  })
  .catch(error => {
      console.error('error:', error);
  });
}

createStory("I am a soldier fighting in a war");