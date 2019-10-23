const test = require('tape')
const fs = require('fs')
const mccMnc = require('./')

test('Basic functionality', t => {
  t.plan(8)

  t.equals(mccMnc.allAreas().length, 214)
  t.equals(mccMnc.allMccs().length, 218)
  t.equals(mccMnc.allMncs().length, 1972)
  t.equals(mccMnc.area('denmark').length, 24)
  t.equals(mccMnc.area('dEnMaRk').length, 24)
  t.equals(mccMnc.mcc('238').area, 'denmark')
  t.equals(mccMnc.mcc('238').networks.length, 24)
  t.equals(mccMnc.mnc('238 73').name, 'Onomondo ApS')
})

test('No cached data set means the data has updated', async t => {
  t.plan(1)

  const hasUpdated = await mccMnc.hasUpdated('./some-file-that-does-not-exist')
  t.equals(hasUpdated, true)
})

test('Cached data set is the most recent one (etag test)', async t => {
  t.plan(1)

  const hasUpdated = await mccMnc.hasUpdated()
  t.equals(hasUpdated, false, 'Current data set is the most recent one - if this fails, you should run "npm run update-cached-dataset" and update the module')
})

test('Get recent dataset, and check that it matches the cached one', async t => {
  t.plan(3)

  const cachedMccmnc = mccMnc // An instance using the cached dataset
  await mccMnc.update('.testdata.json') // Fetch the dataset from ITU
  const fetchedMccmnc = mccMnc.config('.testdata.json') // An instance using the new dataset

  t.deepEqual(fetchedMccmnc.allAreas(), cachedMccmnc.allAreas())
  t.deepEqual(fetchedMccmnc.allMccs(), cachedMccmnc.allMccs())
  t.deepEqual(fetchedMccmnc.allMncs(), cachedMccmnc.allMncs())
  fs.unlinkSync('.testdata.json')
})
