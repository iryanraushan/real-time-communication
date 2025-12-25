const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.static("public"));

let orderStatus = "Order Placed";
let waitingClients = [];

app.get("/order-status", (req, res) => {
  const lastStatus = req.query.last;

  // If order status changes, respond immediately
  if (orderStatus !== lastStatus) {
    return res.json({ status: orderStatus });
  }

  // Otherwise, wait
  waitingClients.push(res);

  // Timeout after 30 seconds
  setTimeout(() => {
    if (waitingClients.includes(res)) {
      waitingClients = waitingClients.filter((r) => r !== res);
      res.json({ status: orderStatus });
    }
  }, 30000);
});

app.get("/update-status/:status", (req, res) => {
  orderStatus = req.params.status;

  waitingClients.forEach((client) => {
    client.json({ status: orderStatus });
  });
  waitingClients = [];

  res.json({ updatedTo: orderStatus });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
