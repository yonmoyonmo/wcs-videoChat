const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
//const { v4: uuidV4 } = require('uuid')

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/wcs-sool-mukbang`);
});

app.get("/vchat", (req, res) => {
  res.redirect(`/wcs-sool-mukbang`);
});

app.get("/vchat/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log("roomID: " + roomId + "\nuserID: " + userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(4000);
