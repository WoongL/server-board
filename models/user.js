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
    },
    pw: {
      type: dataTypes.STRING(20),
      allowNull: false,
    },
  });

  return user;
};
