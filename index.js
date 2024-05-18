const express = require('express');
const http = require('http');
const app = express();
const port = process.env.PORT||5000;
const admin=require('./routes/AdminRoutes.js');
const connectToMongo = require('./db/ConnectToMongo.js');
app.use(express.json());
const server = http.createServer(app);
connectToMongo();
app.get('/', (req, res) => {
    res.send("---");
});
app.use("/admin",admin);

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
