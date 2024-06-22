// Catch Async function
module.exports = function (fn) {
  return function (request, response, next) {
    fn(request, response, next).catch(next);
  };
};
