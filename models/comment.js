module.exports = function (sequelize, dataTypes) {
  const comment = sequelize.define("comment", {
    issueid: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: dataTypes.STRING(500),
      allowNull: false,
    },
    userid: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
  });

  comment.associate = function (models) {
    comment.belongsTo(models.issue, { foreignKey: "issueid", sourceKey: "id" });
  };

  return comment;
};
