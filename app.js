const { mongoose } = require("./db")
const Koa = require("koa")
const app = new Koa()
const router = require("koa-router")()
const bodyparse = require("koa-bodyparser")
const FastScanner = require("fastscan")
const { Sensitive } = require("./schema")
const cors = require("koa2-cors")

require("dotenv").config()
const PORT = process.env.PORT
app.use(cors())
app.use(bodyparse())
let scanner = null

const loadData = async () => {
  const data = await Sensitive.find({}).exec()
  const words = data.map(item => item.word)
  scanner = new FastScanner(words)
  const count = words.length
  console.log(`数据加载完毕, 总共${count}条记录`)
  return count
}

loadData()


router.get("/admin/words", async ctx => {
  const { page = 1, pageSize = 20, ...rest } = ctx.query
  const count = await Sensitive.countDocuments(rest)
  const data = await Sensitive.find(rest)
    .skip((Number(page) - 1) * Number(pageSize))
    .limit(Number(pageSize))
    .exec()
  ctx.body = {
    count,
    data,
  }
})

router.post("/admin/words", async ctx => {
  ctx.body = "admin"
})

router.delete("/admin/words/:id", async ctx => {
  await Sensitive.deleteOne({ _id: ctx.params.id})
  ctx.body = `delete ${ctx.params.id}`
})

router.put("/admin/words", async ctx => {
  ctx.body = "admin"
})

router.get("/admin/reload", async ctx => {
  const count = await loadData()
  ctx.body = count
})

router.post("/", async ctx => {
  const { text = "", options = { quick: true } } = ctx.request.body
  if (text.trim() === "") {
    ctx.response.status = 400
    ctx.body = {
      code: 400,
      message: "text is required",
    }
    return
  }
  const offWords = scanner.search(text, options)
  ctx.body = {
    data: offWords,
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () =>
  console.log(`sensitive word detection server is running on port: ${PORT}`),
)
