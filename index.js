const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const sequelize = require("sequelize");
const op = sequelize.Op;

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// sign up
app.post("/singup", (req, res) => {
  const body = req.body;
  const { name, nickname, pw } = body;

  if (!name || !nickname || !pw) {
    res.send("회원가입 정보를 모두 입력해주세요");
    return;
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
        switch (error.fields[0]) {
          case "name":
            res.send("아이디 중복");
            break;
          case "nickname":
            res.send("닉네임 중복");
            break;
          default:
            res.send("중복");
            break;
        }
      } else res.status(400).send("실패");
    });
});

app.post("/login", (req, res) => {
  const body = req.body;
  const { name, pw } = body;

  if (!name || !pw) {
    res.send("로그인에 필요한 정보가 부족합니다");
    return;
  }

  models.user
    .findOne({
      attributes: ["id", "nickname", "pw", "authtoken"],
      where: {
        name,
      },
    })
    .then((result) => {
      if (result == null) res.send("아이디가 존재하지 않습니다");
      if (result.pw != pw) res.send("비밀번호가 틀렸습니다");

      const authtoken = Math.random().toString(36).substr(2, 11);
      const userinfo = {
        id: result.id,
        nickname: result.nickname,
        authtoken,
      };
      models.user
        .update(
          {
            authtoken,
          },
          {
            where: {
              id: result.id,
            },
          }
        )
        .then((result) => {
          res.send({ userinfo });
        })
        .catch((error) => {});
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/test", (req, res) => {
  const body = req.body;

  authentication(body, res, (result) => {
    res.send(result);
  });
});

//토큰 인증
//id와 토큰을 넣으면 유저의 토큰 유효성 검사(30분)후 인증되면 콜백 실행
function authentication({ id, authtoken }, res, resultCallback) {
  models.user
    .findOne({
      attributes: ["id", "name", "nickname", "authtoken", "updatedAt"],
      where: {
        id,
      },
    })
    .then((result) => {
      const today = new Date();
      const gap = (today.getTime() - result.updatedAt.getTime()) / 1000;
      if (result.authtoken == authtoken && gap <= 1800) {
        resultCallback(result);
      } else {
        res.send("로그인 인증이 만료되었습니다");
      }
    })
    .catch((error) => {
      res.status(400).send("인증 실패.");
    });
}

app.listen(port, () => {
  console.log("서버 정상동작중");
  models.sequelize
    .sync()
    .then(() => {
      console.log("db 연결 성공");
    })
    .catch((e) => {
      console.log(e);
      console.log("db 연결 에러");
      process.exit();
    });
});
