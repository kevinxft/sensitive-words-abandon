const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { v4: uuid } = require("uuid")

const Sensitive = mongoose.model(
  "Sensitive",
  new Schema(
    {
      word: {
        type: String,
        index: true
      },
      tag: String
    },
    {
      timestamps: true
    }
  )
)

const appSchema = new Schema(
  {
    name: {
      type: String,
      index: true
    },
    desc: {
      type: String
    },
    appID: {
      type: String
    },
    createAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

appSchema.pre("save", function(next) {
  console.log("save")
  if (!this.appID) {
    this.appID = uuid()
  }
  next()
})

const App = mongoose.model("App", appSchema)

const Log = mongoose.model(
  "Log",
  new Schema(
    {
      appName: {
        type: String,
        index: true
      },
      appID: {
        type: String,
        index: true
      },
      words: {
        type: Array
      }
    },
    {
      timestamps: true
    }
  )
)

module.exports = {
  Sensitive,
  App,
  Log
}
