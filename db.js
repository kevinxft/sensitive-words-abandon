const mongoose = require('mongoose')
require("dotenv").config()

mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

module.exports = {
  mongoose
}