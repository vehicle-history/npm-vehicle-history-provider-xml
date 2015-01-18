module.exports.ClientUrlError = function ClientUrlError(message) {
  Error.call(this);
  this.message = message;
};