const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const sequelize = require("sequelize");
const op = sequelize.Op;

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.get("/test", (req, res) => {
  res.send("테스트 성공");
});

// sign up

app.post("/signup", (req, res) => {
  const body = req.body;
  const { name, nickname, pw } = body;

  if (!name || !nickname || !pw) {
    res.status(400).send("회원가입 정보를 모두 입력해주세요");
  }
  models.user
    .create({
      name,
      nickname,
      pw,
    })
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      if (error.name == "SequelizeUniqueConstraintError") {
        res.status(400).send("중복된 이름이 있습니다");
      } else res.status(400).send("실패");
    });
});

app.post("/login", (req, res) => {
  const body = req.body;
  const { name, pw } = body;

  models.user
    .findOne({
      attributes: ["id", "nickname", "pw"],
      where: {
        name,
      },
    })
    .then((result) => {
      const userinfo = { id: result.id, nickname: result.nickname };
      if (result.pw == pw) res.send({ userinfo });
      else res.send("비밀번호가 틀렸습니다");
    })
    .catch((error) => {
      res.status(400).send("로그인 실패.");
    });
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
