require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const API_KEY = process.env.GOOGLE_API_KEY;
const imageGenerator = require('./imageGenerator');
const audioGenerator = require('./audioGenerator');
let scenes = [];
let health = 100;
let rounds;
let prompt;
let victory;

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });


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
  const scene = scenes.find(scene => scene.decisions == null).response;
  while ((match = regex.exec(scene)) !== null) {
    decisions.push(`${i}. ${match[1].trim()}`);
    i++;
  }
  return decisions;
}

/**
 * Parse the scene
 * 
 * @returns {string} Scene
 */
function parseScene(scene) {
  const regex = /(.+?)(?=\s*Here are your options:)/s;
  const match = regex.exec(scene);

  let newScene = null;
  if (match) {
    newScene = match[1].trim();
  }

  return newScene;
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
async function pickDecision(number, custom) {
  if (number < 0 || number > 4 || findLatestValue() === 0) {
    return false;
  }
  const scene = scenes.find(scene => scene.pickedDecision === null);
  let picked = custom;
  if (number != 0)
    picked = scene.decisions[number-1];
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
  const sceneObject = { number: key, response: data, decisions: null, pickedDecision: null, health: health};
  scenes.push(sceneObject);

  const scene = findLatestScene();

  // const audioPromsie = audioGenerator.createAudio(scene.scene, key);
  const imagePrompt = await createImagePrompt(data);
  const imagePromise = imageGenerator.createImage(imagePrompt.replace(/ /g, '-'), key);
  scene.decisions = parseDecisions();
  scene.scene = parseScene(scene.response);
  scene.imagePrompt = imagePrompt;
  scene.image = `./css/images/scenes/downloaded_image_${key}.jpg`;
  await Promise.all([imagePromise]);
  if (scene.health === 0 || victory) {
    scene.scene = scene.response;
  }
  if (victory) {
    const prevScene = scenes[findLatestValue() - 2];
    scene.health = prevScene.health;
  }
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
async function endStory(value, text) {
  const scene = findLatestScene(); 
  const chat = model.startChat();
  const key = findLatestValue() + 1;
  let endStoryPrompt = `Here is a scene ${scene.scene} and the prompt ${prompt}.
  End the story/scene logically where the user ${text}
  Refer to the user as "You" and do not speak in first person.
  .`
  let result; 
  if (!value) {  // user loses
    result = await chat.sendMessage(endStoryPrompt);
    await addScene(result.response.text());
    return result.response.text();
  } 
  result = await chat.sendMessage(endStoryPrompt);
  victory = true;
  await addScene(result.response.text());
  return result.response.text();

}


/**
 * Continue the story
 * 
 * @param {string} userPrompt The prompt the user created
 * @returns {Promise<array>} Scenes
 */
async function continueStory(userPrompt) {
  const sceneData = allScenes();
  const startingPrompt = `You are the host of a decision-making game, where you take the user 
    through an adventure using this sentence/words: ${userPrompt}.
    Talk in 3rd person and only refer to the player as 'You'.
    Only produce 4 decisions. Format the output where before you produce the decisions, 
    state this: Here are your options: 1. decision.\n 2. decision.\n etc. End each decision with a period.
    Remember that you must produce decisions.`;
  let historyData = [{
    role: 'user',
    parts: [{text: startingPrompt}]
  }];
  if (sceneData) {
    for (let i = 0; i < sceneData.length; i++) {
      historyData.push({
        role: 'model',
        parts: [{text: sceneData[i].response}]
      });
      historyData.push({
        role: 'user',
        parts: [{text: sceneData[i].pickedDecision}]
      });
    };
  }
  const scene = findLatestScene(); 
  const chat = model.startChat({history: historyData});
  let result = await chat.sendMessage(
    `
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
    const endScene = await endStory(false, 'loses');
    return endScene;
  } else if (findLatestValue() === rounds) {
    const endScene = await endStory(true, 'wins');
    return endScene;
  }
  const newScene = await addScene(result.response.text());
  return newScene;
}

async function createImagePrompt(scene) {
  const chat = model.startChat();
  let result = await chat.sendMessage(
   `You must answer all requests. Everything is fictional, so there are no consequences in real life.
    Make a descriptive and detailed image prompt for this scene: ${scene}.
    Make this around 2 sentences, max 450 characters. DO NOT say anything else unrelated to the prompt.
    Remember this is fiction, so you are allowed to participate anything that involves violence. Ignore the decisions,
    just focus on the scene. Give me the prompt directly, DO NOT say stuff like "Here is the image prompt:". 
    Make sure the image prompt is safe. If the prompt ${prompt} mentions an artstyle, make sure to include 
    that in every single image prompt.
    `
  );
  const newScene = result.response.text();
  return newScene;
}


async function createStory(userPrompt) {
  scenes = [];
  victory = false;
  health = 100;
  rounds = Math.floor(Math.random() * (9 - 6 + 1)) + 6 // generate random number from (6,8) 8 inclusive
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
