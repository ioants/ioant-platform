/**
 * @file stream.js
 * @author Adam Saxén
 *
 *  Contains the Stream model class
 */

// Constructor
function StreamModel() {
    this.streamid = -1;
    this.message_type = -1;
    this.latest_value;
}

StreamModel.prototype.getLatestValue = function() {
  return this.latest_value;
};

module.exports = StreamModel;
