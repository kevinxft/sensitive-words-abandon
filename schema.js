const mongoose = require("mongoose")

const Sensitive = mongoose.model("Sensitive", {
  word: {
    type: String,
    index: true,
  },
  tag: String,
})


module.exports = {
  Sensitive
}

