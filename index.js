const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const sequelize = require("sequelize");
const db = require("./models");

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

const DB_NAME = {
  USER: "USER",
  BOARD: "BOARD",
  ISSUE: "ISSUE",
  COMMENT: "COMMENT",
};
const QUREY_TYPE = {
  CREATE: "CREATE",
  READ_ALL: "READ_ALL",
  READ_ONE: "READ_ONE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

function customQurey({
  query,
  db_name,
  type,
  resultCallback,
  errorCallback = () => {},
}) {
  var db;
  switch (db_name) {
    case DB_NAME.USER:
      db = models.user;
      break;
    case DB_NAME.BOARD:
      db = models.board;
      break;
    case DB_NAME.ISSUE:
      db = models.issue;
      break;
    case DB_NAME.COMMENT:
      db = models.comment;
      break;
    default:
      return "db name error";
      break;
  }
  switch (type) {
    case QUREY_TYPE.CREATE:
      db.create(query)
        .then((r) => {
          resultCallback(r);
        })
        .catch((e) => {
          errorCallback(e);
        });
      break;
    case QUREY_TYPE.READ_ALL:
      db.findAll(query)
        .then((r) => {
          resultCallback(r);
        })
        .catch((e) => {
          errorCallback(e);
        });
      break;
    case QUREY_TYPE.READ_ONE:
      db.findOne(query)
        .then((r) => {
          resultCallback(r);
        })
        .catch((e) => {
          errorCallback(e);
        });
      break;
    case QUREY_TYPE.UPDATE:
      db.update(query[0], query[1])
        .then((r) => {
          resultCallback(r);
        })
        .catch((e) => {
          errorCallback(e);
        });
      break;
    case QUREY_TYPE.DELETE:
      db.destroy(query)
        .then((r) => {
          resultCallback(r);
        })
        .catch((e) => {
          errorCallback(e);
        });
      break;
    default:
      return "qurey_type error";
      break;
  }
}

//토큰 인증
//id와 토큰을 넣으면 유저의 토큰 유효성 검사(30분)후 인증되면 콜백 실행
function authentication({ id, authtoken }, res, resultCallback2) {
  const query = {
    attributes: ["id", "name", "nickname", "authtoken", "updatedAt"],
    where: {
      id,
    },
  };
  const db_name = DB_NAME.USER;
  const type = QUREY_TYPE.READ_ONE;
  const resultCallback = (result) => {
    const today = new Date();
    const gap = (today.getTime() - result.updatedAt.getTime()) / 1000;
    if (result.authtoken == authtoken && gap <= 1800) {
      resultCallback2(result);
    } else {
      res.send("로그인 인증이 만료되었습니다");
    }
  };
  const errorCallback = (error) => {
    res.status(400).send("인증 실패.");
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
}

// sign up
app.post("/singup", (req, res) => {
  const body = req.body;
  const { name, nickname, pw } = body;

  if (!name || !nickname || !pw) {
    res.send("회원가입 정보를 모두 입력해주세요");
    return;
  }

  const query = { name, nickname, pw };
  const db_name = DB_NAME.USER;
  const type = QUREY_TYPE.CREATE;
  const resultCallback = (result) => {
    res.send(result);
  };
  const errorCallback = (error) => {
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
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

//login
app.post("/login", (req, res) => {
  const body = req.body;
  const { name, pw } = body;

  if (!name || !pw) {
    res.send("로그인에 필요한 정보가 부족합니다");
    return;
  }

  const query = {
    attributes: ["id", "nickname", "pw", "authtoken"],
    where: {
      name,
    },
  };
  const db_name = DB_NAME.USER;
  const type = QUREY_TYPE.READ_ONE;
  const resultCallback = (result) => {
    if (result == null) res.send("아이디가 존재하지 않습니다");
    if (result.pw != pw) res.send("비밀번호가 틀렸습니다");

    const authtoken = Math.random().toString(36).substr(2, 11);
    const userinfo = {
      id: result.id,
      nickname: result.nickname,
      authtoken,
    };

    const query = [
      {
        authtoken,
      },
      {
        where: {
          id: result.id,
        },
      },
    ];
    const type = QUREY_TYPE.UPDATE;
    const db_name = DB_NAME.USER;

    const resultCallback = (result) => {
      console.log(userinfo);
      res.send({ userinfo });
    };

    customQurey({ query, db_name, type, resultCallback });
  };
  const errorCallback = (error) => {
    console.log(error);
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

app.post("/test", (req, res) => {
  const body = req.body;

  authentication(body, res, (result) => {
    res.send(result);
  });
});

//-------------------------board-------------------------

app.post("/board", (req, res) => {
  const body = req.body;
  const { name } = body;

  if (!name) {
    res.send("게시판명을 입력해주세요");
    return;
  }

  const query = { name };
  const db_name = DB_NAME.BOARD;
  const type = QUREY_TYPE.CREATE;
  const resultCallback = (result) => {
    res.send(result);
  };
  const errorCallback = (error) => {
    res.send("게시판 생성실패");
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

app.get("/board", (req, res) => {
  const query = { attributes: ["id", "name"], order: [["id", "ASC"]] };
  const db_name = DB_NAME.BOARD;
  const type = QUREY_TYPE.READ_ALL;
  const resultCallback = (result) => {
    res.send(result);
  };
  const errorCallback = (error) => {
    res.send("게시판 조회실패");
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

//-------------------------issue-----------------------------

app.get("/issue/:boardid", (req, res) => {
  const params = req.params;
  const { boardid } = params;
  const pagescale = req.query.pagescale != null ? req.query.pagescale : 18;
  const page = req.query.page != null ? req.query.page : 1;
  const offset = (page - 1) * pagescale;

  const db_name = DB_NAME.ISSUE;
  const query = {
    limit: pagescale,
    offset,
    order: [["id", "ASC"]],
    attributes: ["id", "title", "content", "writer", "createdAt"],
    where: {
      boardid,
    },
  };
  const type = QUREY_TYPE.READ_ALL;

  const resultCallback = (r) => {
    const query = {
      attributes: [[models.sequelize.fn("count", "*"), "count"]],
      where: {
        boardid,
      },
    };
    const resultCallback = (r2) => {
      const count = r2[0];
      res.send({ issue: r, count });
    };
    const errorCallback = (error) => {
      res.send(error);
    };
    customQurey({ query, db_name, type, resultCallback, errorCallback });
  };
  const errorCallback = (e) => {
    res.send(e);
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

app.get("/issue/:boardid/:id", (req, res) => {
  const params = req.params;
  const { boardid, id } = params;

  const db_name = DB_NAME.ISSUE;
  const type = QUREY_TYPE.READ_ONE;
  const query = {
    attributes: ["id", "title", "content", "writer", "createdAt"],
    where: {
      boardid,
      id,
    },
  };
  const resultCallback = (r) => {
    res.send(r);
  };
  const errorCallback = (e) => {
    res.send(e);
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

app.put("/issue/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  const body = req.body;
  const { title, content } = body;

  const db_name = DB_NAME.ISSUE;
  const type = QUREY_TYPE.UPDATE;
  const query = [{ title, content }, { where: { id } }];
  const resultCallback = (result) => {
    res.send({
      result,
    });
  };

  customQurey({ query, db_name, type, resultCallback });
});

app.post("/issue", (req, res) => {
  const body = req.body;
  const { boardid, title, content, writer } = body;

  const db_name = DB_NAME.ISSUE;
  const type = QUREY_TYPE.CREATE;
  const query = { boardid, title, content, writer };
  const resultCallback = (r) => {
    res.send(r);
  };
  const errorCallback = (error) => {
    res.send("화제거리 생성실패");
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

app.delete("/issue/:id", (req, res) => {
  const params = req.params;
  const { id } = params;

  const db_name = DB_NAME.ISSUE;
  const type = QUREY_TYPE.DELETE;
  const query = {
    where: { id },
  };
  const resultCallback = (result) => {
    res.send({ result });
  };
  const errorCallback = (error) => {
    console.error(error);
    res.send({ error });
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

//-------------------------comment---------------------

app.get("/comment/:issueid", (req, res) => {
  const params = req.params;
  const { issueid } = params;

  const db_name = DB_NAME.COMMENT;
  const type = QUREY_TYPE.READ_ALL;
  const query = {
    order: [["id", "ASC"]],
    attributes: ["id", "content", "writer", "createdAt"],
    where: {
      issueid,
    },
  };
  const resultCallback = (r) => {
    res.send(r);
  };
  const errorCallback = (e) => {
    res.send(e);
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

app.post("/comment", (req, res) => {
  const body = req.body;
  const { issueid, content, writer } = body;

  const db_name = DB_NAME.COMMENT;
  const type = QUREY_TYPE.CREATE;
  const query = { issueid, content, writer };
  const resultCallback = (r) => {
    res.send(r);
  };
  const errorCallback = (e) => {
    res.send("댓글 생성실패");
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

app.delete("/comment/:id", (req, res) => {
  const params = req.params;
  const { id } = params;

  const db_name = DB_NAME.COMMENT;
  const type = QUREY_TYPE.DELETE;
  const query = {
    where: { id },
  };
  const resultCallback = (r) => {
    res.send({ r });
  };
  const errorCallback = (e) => {
    res.send(e);
  };

  customQurey({ query, db_name, type, resultCallback, errorCallback });
});

//------------------------------------------

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
