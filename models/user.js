module.exports = function (sequelize, dataTypes) {
  const user = sequelize.define("user", {
    name: {
      type: dataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nickname: {
      type: dataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    pw: {
      type: dataTypes.STRING(20),
      allowNull: false,
    },
    authtoken: {
      type: dataTypes.STRING(15),
      allowNull: true,
    },
  });

  return user;
};
