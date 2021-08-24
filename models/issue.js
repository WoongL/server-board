module.exports = function (sequelize, dataTypes) {
  const issue = sequelize.define("issue", {
    boardid: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: dataTypes.STRING(30),
      allowNull: false,
    },
    content: {
      type: dataTypes.STRING(300),
      allowNull: false,
    },
    writer: {
      type: dataTypes.STRING(20),
      allowNull: false,
    },
  });

  issue.associate = function (models) {
    issue.belongsTo(models.board, { foreignKey: "boardid", sourceKey: "id" });
  };

  issue.associate = function (models) {
    issue.hasMany(models.comment, { foreignKey: "issueid", sourceKey: "id" });
  };
  return issue;
};
