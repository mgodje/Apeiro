const url = 'https://muddy-cake-db91.patrick-1.workers.dev/';
const scenes = []

/**
 * Parse the given decisions
 */
function parseDecisions() {
  const regex = /\d.\s(.+)/g;
  const decisions = [];
  let match;
  let i = 1;
  const scene = scenes.find(scene => scene.decisions == null).scene;
  while ((match = regex.exec(scene)) !== null) {
    decisions.push(`${i}. ${match[1].trim()}`);
    i++;
  }
  return decisions;
}

/**
 * Find the latest scene
 * 
 * @returns {object} Latest Scene
 */
function findLatestScene() {
  return scenes.find(scene => scene.number === findLatestValue());
}

/**
 * Find the latest value
 * 
 * @returns {number} Latest Value
 */
function findLatestValue() {
  return scenes.length;
}

/**
 * Picks the decision based on the number
 * 
 * @param {int} number The number of the decision
 * @returns {string} Picked decision
 */
function pickDecision(number) {
  const scene = scenes.find(scene => scene.pickedDecision == null);
  const picked = scene.decisions[number-1];
  scene.pickedDecision = picked;
  console.log(scene);
  return scene.pickedDecision;
}

/**
 * Adds current scene to a dictionary
 * 
 * @param {*} data
 */
function addScene(data) {
  const key = findLatestValue() + 1;
  scenes.push({number: key, scene: data, decisions: null, pickedDecision: null});
  const parsedDecisions = parseDecisions();
  const scene = findLatestScene();
  scene.decisions = parsedDecisions;
  return scene;
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
    state this: Here are your options: 1. decision. 2. decision. etc.). End each decision with a period.
    Remember that you must produce decisions.
    `
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
    addScene(result["response"]);
    pickDecision(1);
    // console.log(findLatestScene());
    // const decisions = parseDecisions();
    // console.log(decisions);
  })
  .catch(error => {
    console.error('error:', error);
  });
}

createStory("I am a soldier fighting in a war");