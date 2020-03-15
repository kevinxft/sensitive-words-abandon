const fs = require('fs')
const { uniq } = require('lodash')
const USE_LIST = ['敏感词.txt', '色情词库.txt', '政治类.txt', '暴恐词库.txt']

const updateFile = (fileList) => {
  let finalList = fileList.reduce((sen, filename) => {
    const data = fs.readFileSync(`./dict/${filename}`, 'utf-8')
    let list = data.split('\n')
    list = list.map(item => item.replace('\r', '').trim()).filter(line =>
      line.length > 1
    )
    sen = sen.concat(list)
    return sen
  }, [])
  finalList = uniq(finalList)
  console.log(`一共${finalList.length}个敏感词`)
  fs.writeFileSync('./SensitiveWord.txt', finalList.join('\n'))
}

updateFile(USE_LIST)


