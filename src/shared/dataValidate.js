const boom = require("@hapi/boom");

function validateISODateFormat(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw boom.badData("Invalid date format");
  }
  return date;
}

function normalizeDateWithTime(date, time) {
  const d = new Date(date);
  d.setHours(time.HOUR, time.MINUTE, time.SECOND, time.MILLISECOND);
  return d;
}


module.exports = { validateISODateFormat, normalizeDateWithTime };
