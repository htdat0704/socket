const express = require("express");
const app = express();
const PORT = 4000;
const fs = require("fs");
const http = require("http").Server(app);
const cors = require("cors");
const path = require("path");

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());

const pathDestination = path.join(__dirname, "../data.json");

const rawData = fs.readFileSync(pathDestination);
const productData = JSON.parse(rawData);

function findProduct(nameKey, productsArray, last_bidder, new_price) {
  for (let i = 0; i < productsArray.length; i++) {
    if (productsArray[i].name === nameKey) {
      productsArray[i].last_bidder = last_bidder;
      productsArray[i].price = new_price;
    }
  }
  const stringData = JSON.stringify(productData, null, 2);
  fs.writeFile(pathDestination, stringData, (err) => {
    console.error(err);
  });
}

function getProduct(idKey, productsArray) {
  return productsArray.find((product) => product.id == `${idKey}`);
}

function getRoomNames(productsArray) {
  return productsArray.map((product) => product.id);
}

socketIO.on("connection", (socket) => {
  console.log(socketIO.of("/").adapter);

  console.log(socket.rooms);

  socket.on("join", (data) => {
    socket.join(data.room);

    socket.in(data.room).emit("joined", `${data.user} has joined the auction`);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });

  //Listens to the addProduct event
  socket.on("addProduct", (data) => {
    productData["products"].push(data);
    const stringData = JSON.stringify(productData, null, 2);
    fs.writeFile(pathDestination, stringData, (err) => {
      console.error(err);
    });

    //Sends back the data after adding a new product
    socket.broadcast.emit("addProductResponse", data);
  });

  socket.on("bidProduct", (data) => {
    //Function call
    findProduct(
      data.name,
      productData["products"],
      data.last_bidder,
      data.amount
    );

    //Sends back the data after placing a bid
    socket.broadcast.emit("bidProductResponse", data);

    const dataReturn = getProduct(data.id, productData["products"]);
    //Sends back the data after placing a bid
    socketIO.to(data.id).emit("project updated", dataReturn);
  });

  socket.on("getProduct", (data) => {
    //Function call
    console.log(data.id);
    const dataReturn = getProduct(data.id, productData["products"]);
    //Sends back the data after placing a bid
    socketIO.to(data.id).emit("project updated", dataReturn);
  });
});

//Returns the JSON file
app.get("/api", (req, res) => {
  res.json(productData);
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
