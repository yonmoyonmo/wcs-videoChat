const socket = io("/");
const videoGrid = document.getElementById("video-grid");

const myPeer = new Peer(undefined, {
  host: "wonmocyberschool.com",
  port: "443",
  path: "/wcs-peerjs",
});

const roomIdCheck = async (roomId) => {
  console.log("in check func");
  const roomlist = await fetch(
    "https://wonmocyberschool.com/api/public/roomlist",
    {
      method: "GET",
    }
  );
  const roomlistData = await roomlist.json();

  console.log(roomlistData);

  let existNames = [];

  if (roomlistData && roomlistData.success) {
    existRooms = roomlistData.data;
  }
  existNames = existRooms.map((room) => {
    return room.roomName;
  });
  console.log(existNames);
  if (!existNames.includes(roomId)) {
    console.log(false);
    return false;
  } else {
    console.log(true);
    return true;
  }
};

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      setTimeout(() => {
        connectToNewUser(userId, stream);
      }, 3000);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  console.log("checking room Id...");
  const checkprom = roomIdCheck(ROOM_ID).then((check) => {
    console.log("debug: " + check);
    if (check) {
      socket.emit("join-room", ROOM_ID, id);
    } else {
      window.location.href = "https://wonmocyberschool.com/wcs-sool-mukbang";
    }
  });
});

function connectToNewUser(userId, stream) {
  console.log(userId);

  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
