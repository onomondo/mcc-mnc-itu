const Mccmnc = require('./')

async function update () {
  await Mccmnc.update('data.json')
  console.log('Data updated. You can now push the new data set to the repo')
}

update()
