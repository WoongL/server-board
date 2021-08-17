module.exports = function (sequelize, dataTypes) {
  const issue = sequelize.define("issue", {
    name: {
      type: dataTypes.STRING(30),
      allowNull: false,
    },
    content: {
      type: dataTypes.STRING(300),
      allowNull: false,
    },
    userid: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
  });

  issue.associate = function (models) {
    issue.hasMany(models.comment, { foreignKey: "issueid", sourceKey: "id" });
  };

  return issue;
};
