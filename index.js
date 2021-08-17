const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const sequelize = require("sequelize");
const op = sequelize.Op;

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.get("/issue", (req, res) => {
  res.send("테스트 성공");
});

app.listen(port, () => {
  console.log("서버 정상동작중");
  models.sequelize
    .sync()
    .then(() => {
      console.log("db 연결 성공");
    })
    .catch((eff) => {
      console.log(err);
      console.log("db 연결 에러");
      process.exit();
    });
});
