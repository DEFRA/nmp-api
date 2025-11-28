const boom = require("@hapi/boom");

function validateISODateFormat(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw boom.badData("Invalid date format");
  }
  return date;
}

module.exports = { validateISODateFormat };
