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

app.post("/messages", (req, res) => {
  const now = dayjs().format("HH:mm:ss");
  let { to, text, type } = req.body;
  const from = req.headers.user;

  to = stripHtml(to).result;
  text = stripHtml(text).result;
  type = stripHtml(type).result;

  const isUserOk = !!participants.find((p) => p.name === from);
  const isToOk = to !== "" && to.length > 0;
  const isTextOk = text !== "" && text.length > 0;
  const isTypeOk = type === "message" || type === "private_message";

  if (isUserOk && isToOk && isTextOk && isTypeOk) {
    const newMessage = {
      from,
      to,
      text,
      type,
      time: now,
    };

    messages.push(newMessage);
    fs.writeFileSync("./src/data.json", JSON.stringify(data));
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.get("/messages", (req, res) => {
  const limit = +req.query.limit;
  const user = req.headers.user;

  const visibleMessages = messages.filter(
    (m) => m.type === "message" || m.to === user || m.from === user
  );

  if (!!limit) {
    const limitedMessages =
      visibleMessages.length <= limit
        ? visibleMessages
        : visibleMessages.slice(visibleMessages.length - limit);

    res.send(limitedMessages);
  } else {
    res.send(visibleMessages);
  }
});

app.listen(4000);
