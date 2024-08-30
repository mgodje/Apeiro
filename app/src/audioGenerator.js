const axios = require("axios").default;
const fs = require("fs");
const path = require("path");


function createAudio(prompt, number) {
  return new Promise ((resolve, reject) => {
    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/audio/text_to_speech",
      headers: {
        authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWIyMGY3ZGQtZTgwZC00OWIwLWIyYWItOWUyNTI5NjZhOTA4IiwidHlwZSI6ImFwaV90b2tlbiJ9.B8l06fMoyL-62XGDxro0g41xn0H9njD4FZvJTZQZB7g",
      },
      data: {
        providers: "openai/af_alloy",
        language: "en-US",
        text: prompt,
      },
    };
  axios
    .request(options)
    .then((response) => {
      const audioUrl = response.data['openai/af_alloy'].audio_resource_url;
      const audioDir = path.resolve(__dirname, "static", "audio");
      const filePath = path.join(audioDir, `downloaded_audio_${number}.mp3`)
      console.log('audio cost:',response.data['openai/af_alloy'].cost);
      axios({
        method: "get",
        url: audioUrl,
        responseType: "stream",
      })
        .then((response) => {
          response.data.pipe(fs.createWriteStream(filePath));
  
          response.data.on("end", () => {
            console.log("audio downloaded successfully to", filePath);
            resolve(filePath)
          });
  
          response.data.on("error", (err) => {
            console.error("error downloading the audio:", err);
            reject(err);
          });
        })
        .catch((error) => {
          console.error("error fetching the audio:", error);
          reject(err);
        });
    })
    .catch((error) => {
      console.error("error generating the audio:", error);
      reject(error);
    });
  });
}

module.exports = {
  createAudio
}
