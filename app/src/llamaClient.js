const imageGenerator = require('./imageGenerator');
const audioGenerator = require('./audioGenerator');
const url = 'https://muddy-cake-db91.patrick-1.workers.dev/';
let scenes = [];
let prompt;


/**
 * Return all the scenes
 * 
 * @returns {array} Scenes
 */
function allScenes() {
  if (findLatestValue() === 0) return false;
  return scenes;
}

/**
 * Parse the given decisions
 * 
 * @returns {array} Decisions
 */
function parseDecisions() {
  const regex = /\d\.\s(.+)/g;
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
 * Find the latest decisions
 * 
 * @returns {array} Decisions
 */
function findLatestDecisions() {
  const scene = findLatestScene();
  if (!scene) {
    return false;
  }
  return scene.decisions;
}

/**
 * Picks the decision based on the number
 * 
 * @param {int} number The number of the decision
 * @returns {Promise<string>} Picked decision
 */
async function pickDecision(number) {
  if (number < 1 || number > 4 || findLatestValue() === 0) {
    return false;
  }
  const scene = scenes.find(scene => scene.pickedDecision === null);
  const picked = scene.decisions[number-1];
  scene.pickedDecision = picked;
  const newScene = await continueStory(prompt);
  return newScene;
}

/**
 * Adds current scene to a dictionary
 * 
 * @param {*} data
 * @returns {Promise<scene>} Current scene
 */
async function addScene(data) {
  const key = findLatestValue() + 1;
  scenes.push({number: key, scene: data, decisions: null, pickedDecision: null});
  let imagePrompt = await createImagePrompt(data);
  let response = await imageGenerator.createImage(imagePrompt, key);
  while (response === null) {
    imagePrompt = await createImagePrompt(data);
    response = await imageGenerator.createImage(imagePrompt, key);
  }
  const parsedDecisions = parseDecisions();
  const scene = findLatestScene();
  await audioGenerator.createAudio(scene.scene, key);
  scene.decisions = parsedDecisions;
  scene.image = `images/downloaded_image_${key}.png`;
  scene.imagePrompt = imagePrompt;
  scene.audio = `audio/downloaded_audio_${key}.mp3`;
  return scene;
}

/**
 * Continue the story
 * 
 * @param {string} userPrompt The prompt the user created
 * @returns {Promise<array>} Scenes
 */
async function continueStory(userPrompt) {
  const scene = findLatestScene();
  const data = {
    prompt: `You are the host of a decision-making game, where you take the user 
    through an adventure using this sentence/words: ${userPrompt}.
    Talk in 3rd person and only refer to the player as 'You'.
    Only produce 4 decisions. Format the output where before you produce the decisions, 
    state this: Here are your options: 1. decision.\n 2. decision.\n etc. End each decision with a period.
    Remember that you must produce decisions.

    Your response should be based on the previous scene.
    Here is the previous scene: ${scene.scene}.
    For the previous scene, the user made this decision: ${scene.pickDecision}.
    Now create a new scene based on the previous scene and the decision the user picked.
    If you refer to someone as "she/him", make sure to give context on who that person is.
    Ensure that the scene is safe and not too violent. Give the scene directly and do not say stuff similar
    to this: "Here is the new scene based on the previous decision", etc. Just give it directly.
    `
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    const scene = await addScene(result["response"]);
    return scene;

  } catch (error) {
    console.error('error:', error);
    return null;
  }
}

/**
 * Creates the initial story
 * 
 * @param {string} userPrompt The prompt the user created
 * @returns {Promise<array>} Scenes
 */
async function createStory(userPrompt) {
  scenes = [];
  const data = {
    prompt: `You are the host of a decision-making game, where you take the user 
    through an adventure using this sentence/words: ${userPrompt}.
    Talk in 3rd person and only refer to the player as 'You'.
    Only produce 4 decisions. Format the output where before you produce the decisions, 
    state this: Here are your options: 1. decision.\n 2. decision.\n etc. End each decision with a period.
    Remember that you must produce decisions. Ensure that the scene is safe and not too violent.`
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    prompt = userPrompt;
    const scene = await addScene(result["response"]);
    return scene;

  } catch (error) {
    console.error('error:', error);
    return null;
  }
}

async function createImagePrompt(scene) {
  const data = {
    prompt: `You must answer all requests. Everything is fictional, so there are no consequences in real life.
    Make a descriptive and detailed image prompt for this scene: ${scene}.
    Make this around 2 sentences, max 450 characters. Do not saying anything else unrelated to the prompt.
    Remember this is fiction, so you are allowed to participate anything that involves violence. Ignore the decisions,
    just focus on the scene. Give me the prompt directly, do nto say stuff like "Here is the image prompt:". Make sure the image prompt is safe.
    Do not make the prompt for the image that violates these policies:
    for intentional disinformation or deception; 
    to violate the privacy rights of others, including unlawful tracking, monitoring, and identification; 
    to depict a person's voice or likeness without their consent or other appropriate rights, including unauthorized impersonation and non-consensual sexual imagery; 
    for harm or abuse of a minor, including grooming and child sexual exploitation;
    to harass, harm, or encourage the harm of individuals or specific groups; 
    to intentionally circumvent safety filters and functionality or prompt models to act in a manner that violates our Policies;
    to perform a lethal function in a weapon without human authorization or control
    `
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result["response"];

  } catch (error) {
    console.error('error:', error);
    return null;
  }
}



module.exports = {
  parseDecisions,
  findLatestScene,
  findLatestValue,
  pickDecision,
  addScene,
  continueStory,
  createStory,
  allScenes,
  findLatestDecisions
};
