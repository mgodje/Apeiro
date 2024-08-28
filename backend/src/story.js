const llamaClient = require('./llamaClient');

exports.createStory = async (req, res) => {
  const scene = await llamaClient.createStory(req.body.prompt);
  res.status(201).send(scene);
}


exports.chooseDecision = async (req, res) => {
  const decision = await llamaClient.pickDecision(req.body.number);
  if (!decision) {
    return res.status(404).send();
  }
  const scene = await llamaClient.findLatestScene();
  console.log('latest scene', scene);
  res.status(201).send(scene);
}


exports.getScene = async (req, res) => {
  const scene = llamaClient.findLatestScene();
  if (!scene) {
    return res.status(404).send();
  }
  res.status(200).send(scene);
}

exports.getDecisions = async (req, res) => {
  const decisions = llamaClient.findLatestDecisions();
  if (!decisions) {
    return res.status(404).send();
  }
  res.status(200).send(decisions);
}


exports.getAllScenes = async (req, res) => {
  const scenes = llamaClient.allScenes();
  if (!scenes) {
    return res.status(404).send();
  }
  res.status(200).send(scenes);
}