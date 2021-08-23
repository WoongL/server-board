module.exports = function (sequelize, dataTypes) {
  const board = sequelize.define("board", {
    name: {
      type: dataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
  });

  board.associate = function (models) {
    board.hasMany(models.issue, { foreignKey: "issueid", sourceKey: "id" });
  };

  return board;
};
