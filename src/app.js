const { exec } = require("child_process");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const eventsCollection = require("../assets/events_collection.json");
const excursionCollection = require("../assets/excursion_collection.json");
const restaurantsCollection = require("../assets/restaurants_collection.json");

app.use(bodyParser.json());
app.use(cors());

app.get("/", function (_, res) {
  res.send("All inclusive, E-com, API");
});

const eventCollectionMap = new Map();
eventsCollection.forEach((card) => eventCollectionMap.set(card.objectId, card));

const excursionCollectionMap = new Map();
excursionCollection.forEach((card) =>
  excursionCollectionMap.set(card.objectId, card)
);

const restaurantsCollectionMap = new Map();
restaurantsCollection.forEach((card) =>
  restaurantsCollectionMap.set(card.objectId, card)
);

app.post("/ask_lingvo_model", async (req, res) => {
  try {
    const { prompt } = req.body;

    const cardCollection = await askGigaChat(prompt);

    const eventsMap = new Map();
    const excursionMap = new Map();
    const restaurantsMap = new Map();

    for (const card of cardCollection) {
      if (card.objectType === "EVENT") {
        eventsMap.set(card.objectId, eventCollectionMap.get(card.objectId));
      }
      if (card.objectType === "EXCURSION") {
        excursionMap.set(
          card.objectId,
          excursionCollectionMap.get(card.objectId)
        );
      }
      if (card.objectType === "RESTAURANT") {
        restaurantsMap.set(
          card.objectId,
          restaurantsCollectionMap.get(card.objectId)
        );
      }
    }

    res.json({
      events: [...eventsMap.values()],
      excursion: [...excursionMap.values()],
      restaurant: [...restaurantsMap.values()],
    });
  } catch {
    res.status(500);
  }
});

app.listen(3000, () => {
  console.log("server running on 3000");
});

async function askGigaChat(prompt) {
  return new Promise((res, reject) => {
    const pythonExecCommand = `python3 model/ask_model.py "${prompt}"`;

    exec(pythonExecCommand, (error, stdout) => {
      if (error) {
        return reject(error);
      }

      try {
        const data = JSON.parse(stdout);

        return res(data);
      } catch (error) {
        return reject(error);
      }
    });
  });
}
