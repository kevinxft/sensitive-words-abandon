const { mongoose } = require("./db")
const ObjectId = mongoose.Types.ObjectId
const Koa = require("koa")
const app = new Koa()
const router = require("koa-router")()
const bodyparse = require("koa-bodyparser")
const FastScanner = require("fastscan")
const MODEL = require("./schema")
const cors = require("koa2-cors")
const { v4: uuid } = require("uuid")

require("dotenv").config()
const PORT = process.env.PORT
app.use(cors())
app.use(bodyparse())
let scanner = null

const loadData = async () => {
  const data = await MODEL["Sensitive"].find({}).exec()
  const words = data.map(item => item.word)
  scanner = new FastScanner(words)
  const count = words.length
  console.log(`数据加载完毕, 总共${count}条记录`)
  return count
}
loadData()

const pagination = async (model, ctx) => {
  const { current = 1, pageSize = 20, ...params } = ctx.query
  const count = await model.countDocuments(params)
  const data = await model
    .find(params, null, { sort: [{ _id: -1 }] })
    .skip((Number(current) - 1) * Number(pageSize))
    .limit(Number(pageSize))
    .exec()
  return {
    count,
    data
  }
}

router.get("/words/admin/:model", async ctx => {
  try {
    const modelName = ctx.params.model
    ctx.body = await pagination(MODEL[modelName], ctx)
  } catch (error) {
    ctx.status = 400
    ctx.body = error
  }
})

router.post("/words/admin/:model", async ctx => {
  try {
    const modelName = ctx.params.model
    const form = ctx.request.body
    const res = await new MODEL[modelName](form).save((err, info) => {
      if (err) {
        return Promise.reject(err)
      }
      return Promise.resolve(info)
    })
    ctx.body = res
  } catch (error) {
    ctx.body = error
  }
})

router.delete("/words/admin/:model/:id", async ctx => {
  const modelName = ctx.params.model
  const res = await MODEL[modelName].deleteOne({ _id: ctx.params.id })
  ctx.body = res
})

router.get("/words/sensitive/reload", async ctx => {
  const count = await loadData()
  ctx.body = count
})

const validateAppID = async appID => {
  const appModel = MODEL["App"]
  const app = await appModel.findOne({ appID }).exec()
  return app
}

const inertLog = async words => {
  try {
    const LogModel = MODEL["Log"]
    if (words.length) {
      new LogModel({ words }).save(err => {
        if (err) {
          return Promise.reject(err)
        }
        Promise.resolve()
      })
    }
  } catch (error) {
    return error
  }
}

router.post("/", async ctx => {
  const { text = "", options = {} } = ctx.request.body
  const { quick = false, longest = false, ...rest } = options
  if (text.trim() === "") {
    ctx.response.status = 400
    ctx.body = {
      code: 400,
      message: "text is required"
    }
    return
  }
  const offWords = scanner.search(text, { quick, longest })
  if (offWords.length) {
    inertLog(offWords)
  }
  ctx.body = {
    data: offWords
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () =>
  console.log(`sensitive word detection server is running on port: ${PORT}`)
)
