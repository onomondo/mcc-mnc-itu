const mammoth = require('mammoth')
const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios')
const path = require('path')

function getMccMnc (html) {
  const $ = cheerio.load(html)
  const $mainTable = $('table')[1]
  const rows = []
  const $rows = $('tbody tr', $mainTable)

  const areas = {}
  const areaNames = []
  let currentArea
  $rows.each((i, $row) => {
    const firstTd = $('td:first-child', $row)
    const rowspan = Number(firstTd.attr('rowspan'))
    const isFirstEntry = !!rowspan

    if (isFirstEntry) {
      const areaName = firstTd.text().trim()
      areaNames.push(areaName)
      currentArea = areaName.toLocaleLowerCase()
      areas[currentArea] = []
      return
    }

    const name = $('td:nth-child(1)', $row).text().trim()
    const [mcc, mnc] = $('td:nth-child(2)', $row).text().trim().split(' ')

    areas[currentArea].push({ name, mcc, mnc })
  })

  return { areas, areaNames }
}

async function $get (url) {
  const { data: html, headers } = await axios.get(url)
  const $ = cheerio.load(html)
  return $
}

async function getLatestDocxUrl () {
  const $allDocs = await $get('https://www.itu.int/pub/T-SP-E.212B')

  const latestDocOverviewPath = $allDocs('.producttitle .title:last-of-type').attr('href').trim()
  const latestDocOverviewUrl = `https://www.itu.int/pub/${latestDocOverviewPath}`
  const $latestDocOverview = await $get(latestDocOverviewUrl)

  const latestDocxPath = $latestDocOverview('.itemtable tr:nth-child(3) td:nth-child(4) a').attr('href')
  const latestDocxUrl = `https://www.itu.int${latestDocxPath}`

  return latestDocxUrl
}

async function convertToHtml (docx) {
  const { value: html } = await mammoth.convertToHtml({ buffer: docx })

  return html
}

async function hasUpdated (dataPath) {
  dataPath = dataPath || path.join(__dirname, './data.json')

  const doesDataFileExist = fs.existsSync(dataPath)

  if (!doesDataFileExist) return true

  const data = await fs.promises.readFile(dataPath)
  const { etag: cachedEtag } = JSON.parse(data)
  const latestDocxUrl = await getLatestDocxUrl()
  const { headers } = await axios.get(latestDocxUrl)
  const { etag: newEtag } = headers

  return cachedEtag !== cachedEtag
}

async function update (dataPath) {
  if (!dataPath) throw new Error('Path to data file missing')

  const latestDocxUrl = await getLatestDocxUrl()
  const { data: latestDocx, headers } = await axios.get(latestDocxUrl, { responseType: 'arraybuffer' })
  const { etag } = headers
  const html = await convertToHtml(latestDocx)
  const { areas, areaNames } = getMccMnc(html)

  return fs.promises.writeFile(dataPath, JSON.stringify({ etag, areas, areaNames }))
}

function config (dataPath) {
  dataPath = dataPath || path.join(__dirname, 'data.json')

  const { areas, areaNames } = JSON.parse(fs.readFileSync(dataPath))
  const mncs = {}
  const mccs = {}

  Object.keys(areas).forEach(name => {
    const area = areas[name]
    area.forEach(network => {
      const { mcc, mnc } = network
      mncs[`${mcc} ${mnc}`] = network
      mccs[mcc] = mccs[mcc] || {
        area: name,
        networks: []
      }
      mccs[mcc].networks.push(network)
    })

    return mccs
  }, {})

  return {
    config,
    update,
    hasUpdated,
    allAreas: () => areaNames,
    allMccs: () => Object.keys(mccs),
    allMncs: () => Object.keys(mncs),
    area: area => areas[area.toLowerCase()],
    mcc: mcc => mccs[mcc],
    mnc: mnc => mncs[mnc]
  }
}

module.exports = config()
