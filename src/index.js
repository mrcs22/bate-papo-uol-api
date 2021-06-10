import express from "express";
import cors from "cors";
import fs from "fs";
import { stripHtml } from "string-strip-html";
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(express.json());

const data = JSON.parse(fs.readFileSync("./src/data.json"));
const participants = data.participants;
const messages = data.messages;

app.post("/participants", (req, res) => {
  const now = dayjs().format("HH:mm:ss");
  const name = stripHtml(req.body.name).result;

  if (req.body.name === "") {
    res.sendStatus(400);
    return;
  }

  const participant = {
    name,
    lastStatus: Date.now(),
  };
  participants.push(participant);

  const message = {
    from: name,
    to: "Todos",
    text: "entra na sala...",
    type: "status",
    time: now,
  };
  messages.push(message);

  fs.writeFileSync("./src/data.json", JSON.stringify(data));

  res.sendStatus(200);
});

app.get("/participants", (req, res) => {
  res.status(200).send(participants);
});

app.listen(4000);
