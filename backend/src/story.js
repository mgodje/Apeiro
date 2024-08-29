const geminiClient = require('./geminiClient');

exports.createStory = async (req, res) => {
  const scene = await geminiClient.createStory(req.body.prompt);
  res.status(201).send(scene);
}


exports.chooseDecision = async (req, res) => {
  const decision = await geminiClient.pickDecision(req.body.number);
  if (!decision) {
    return res.status(404).send();
  }
  const scene = await geminiClient.findLatestScene();
  res.status(201).send(scene);
}


exports.getScene = async (req, res) => {
  const scene = geminiClient.findLatestScene();
  if (!scene) {
    return res.status(404).send();
  }
  res.status(200).send(scene);
}

exports.getDecisions = async (req, res) => {
  const decisions = geminiClient.findLatestDecisions();
  if (!decisions) {
    return res.status(404).send();
  }
  res.status(200).send(decisions);
}


exports.getAllScenes = async (req, res) => {
  const scenes = geminiClient.allScenes();
  if (!scenes) {
    return res.status(404).send();
  }
  res.status(200).send(scenes);
}