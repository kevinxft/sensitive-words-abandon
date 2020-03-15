const fs = require("fs")
const { mongoose } = require("./db")
const { Sensitive } = require("./schema")
const words = fs.readFileSync("./SensitiveWord.txt", "utf-8").split("\n")


const main = async () => {
  console.log(`开始录入敏感词, 总共${words.length} 个`)
  for (let word of words) {
    await new Promise((resolve, reject) => {
      new Sensitive({
        word,
      }).save(err => {
        if (err) {
          console.log(err)
          return resolve(err)
        }
        return resolve()
      })
    })
  }
  console.log("录入完毕")
  mongoose.disconnect()
}

main()
