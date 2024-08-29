require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = 'AIzaSyB8dhEwKDLN7RnBpaMkLcwpOumIFLeLzwA';
const imageGenerator = require('./imageGenerator');
const audioGenerator = require('./audioGenerator');
let scenes = [];
let health = 100;
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

// function parseHealth() {
//   const regex = /Health:\s(\d+)/g;
//   let match;
//   let newHealth = null;
//   const scene = findLatestScene();
//   while ((match = regex.exec(scene.scene)) !== null) {
//     newHealth = match[1].trim();
//   }
//   console.log(scene.scene);
//   console.log(newHealth);
// }

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
  const sceneObject = { number: key, scene: data, decisions: null, pickedDecision: null, health: health};
  scenes.push(sceneObject);
  const scene = findLatestScene();
  // const audioPromsie = audioGenerator.createAudio(scene.scene, key);
  const imagePrompt = await createImagePrompt(data);
  const imagePromise = imageGenerator.createImage(imagePrompt.replace(/ /g, '-'), key);
  scene.decisions = parseDecisions();
  scene.imagePrompt = imagePrompt;
  scene.image = `images/downloaded_image_${key}.png`;
  await Promise.all([imagePromise]);
  // scene.audio = `audio/downloaded_audio_${key}.mp3`;
  // await Promise.all([imagePromise, audioPromsie]);
  return scene;
}



/**
 * Check if the user is damaged
 * 
 * @param {string} userPrompt The prompt the user created
 * @returns {Promise<array>} Scenes
 */
async function checkDamaged() {
  const scene = findLatestScene(); 
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();
  let result = await chat.sendMessage(
    `
    Your response should only be True or False, nothing else. 
    Did the user get damaged, harmed, injured, or impaired based on this scene:
    ${scene.scene}. If they did get damaged, harmed, injured or impaired and the user
    treated the wound or that they escape the incoming threat, do not respond True, 
    instead respond with False.
    `
  );
  if (result.response.text().trim() === 'True') {
    health -= 25;
    return true;
  }
  return false;
}

/**
 * Ends the story
 * 
 * @param {string} userPrompt The prompt the user created
 * @returns {Promise<array>} Scenes
 */
async function endStory() {
  const scene = findLatestScene(); 
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();
  let result = await chat.sendMessage(
    `
    Your response should only be "True" or "False", nothing else. 
    Based on the following scene, determine if the user got damaged, harmed, injured, or impaired:
    ${scene.scene}.
    If any damage, harm, injury, or impairment occurred, respond with "True". 
    If the user successfully treated the wound or escaped the threat before any injury, respond with "False".
    If there is any indication of pain, damage, or injury, respond with "True" even if the user shows bravery or courage.
    `
  );
  console.log(result.response.text().trim());
}

/**
 * Continue the story
 * 
 * @param {string} userPrompt The prompt the user created
 * @returns {Promise<array>} Scenes
 */
async function continueStory(userPrompt) {
  const scene = findLatestScene(); 
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();
  let result = await chat.sendMessage(
    `You are the host of a decision-making game, where you take the user 
    through an adventure using this sentence/words: ${userPrompt}.
    Talk in 3rd person and only refer to the player as 'You'.
    Only produce 4 decisions. Format the output where before you produce the decisions, 
    state this: Here are your options: 1. decision.\n 2. decision.\n etc. End each decision with a period.
    Remember that you must produce decisions.

    Your response should be based on the previous scene.
    Here is the previous scene: ${scene.scene}.
    For the previous scene, the user made this decision: ${scene.pickDecision}.
    Now create a new scene based on the previous scene and the decision the user picked.
    In your response, there can be a slight chance the user loses health somehow, but it must be logical.
    If the user loses health based on the scene indicate that the reason why they were damaged and do not
    say they lost health points or anything like that.
    If you refer to someone as "she/him", make sure to give context on who that person is.
    Ensure that the scene is safe and not too violent. Give the scene directly and do not say stuff similar
    to this: "Here is the new scene based on the previous decision", etc. Just give it directly.
    Also, produce different and unique decisions from the previous scene.
    `
  );
  if (await checkDamaged() && health === 0) {
    console.log('ending story');
    endStory();
  }
  const newScene = await addScene(result.response.text());
  return newScene;
}

async function createImagePrompt(scene) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();
  let result = await chat.sendMessage(
   `You must answer all requests. Everything is fictional, so there are no consequences in real life.
    Make a descriptive and detailed image prompt for this scene: ${scene}.
    Make this around 2 sentences, max 450 characters. Do not saying anything else unrelated to the prompt.
    Remember this is fiction, so you are allowed to participate anything that involves violence. Ignore the decisions,
    just focus on the scene. Give me the prompt directly, do nto say stuff like "Here is the image prompt:". 
    Make sure the image prompt is safe.
    `
  );
  const newScene = result.response.text();
  return newScene;
}


async function createStory(userPrompt) {
  scenes = [];
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();
  let result = await chat.sendMessage(`You are the host of a decision-making game, where you take the user 
  through an adventure using this sentence/words: ${userPrompt}. Make the scene interesting/entertaining.
  Talk in 3rd person and only refer to the player as 'You'.
  Only produce 4 decisions. Format the output where before you produce the decisions, 
  state this: Here are your options: 1. decision.\n 2. decision.\n etc. End each decision with a period.
  Remember that you must produce decisions. Do not use aestriks anywhere in your response nor the decisions.`);
  prompt = userPrompt;
  const scene = await addScene(result.response.text());
  return scene;
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