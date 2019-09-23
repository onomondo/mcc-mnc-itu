# mcc-mnc-itu

Module to lookup MCC and MNC information. Uses the official data from International Telecommunications Union (ITU) which guarantees it is the most current one.

The most recent data is included, so that when the module is initiated you don't need to fetch any data.

## Installation

```
$ npm install mcc-mnc-itu
```

## Usage

``` js
const mccMnc = require('mcc-mnc-itu')

console.log(mccMnc.allAreas())
// ['Afghanistan', ..., 'Zimbabwe']

console.log(mccMnc.allMccs())
// ['202', ..., '750']

console.log(mccMnc.allMncs())
// ['412 1', ..., '648 4']

console.log(mccMnc.area('United States'))
// [{ name: 'Verizon Wireless', mcc: 310, mnc: 10 }, ..., { name: 'Southern Communications Services Inc.', mcc: 316, mnc: 11 }]

console.log(mccMnc.mcc(238))
// {
//   area: 'denmark',
//   networks: [{
//     name: 'Onomondo ApS',
//     mcc: 238,
//     mnc: 73
//   }, ..., {
//     name: 'Banedanmark',
//     mcc: 238,
//     mnc: 23
//   }]
// }

console.log(mccMnc.mnc('238 73'))
// { name: 'Onomondo ApS', mcc: 238, mnc: 73 }
```

## API

### .allAreas()

Returns a list of all areas. It's mostly a list of countries.

`['Afghanistan', ..., 'Zimbabwe']`

### .allMccs()

Returns a list of all MCC's.

`['202', ..., '750']`

### .allMncs()

Returns a list of all MCC+MNC's

`['412 1', ..., '648 4']`

### .area(name)

Retuns all the networks in that area. The casing of `name` is not important.

``` js

mccMnc.area('united states')
// [
//   {
//     name: 'Verizon Wireless',
//     mcc: 310,
//     mnc: 10
//   },
//   ...,
//   {
//     name: 'Southern Communications Services Inc.',
//     mcc: 316,
//     mnc: 11
//   }
// ]
```

### .mcc(id)

Returns all the networks with a given MCC

``` js
mccMnc.mcc(238)
// {
//   area: 'denmark',
//   networks: [
//     {
//       name: 'Onomondo ApS',
//       mcc: 238,
//       mnc: 73
//     },
//     ...,
//     {
//       name: 'Banedanmark',
//       mcc: 238,
//       mnc: 23
//     }
//   ]
// }
```

### .mnc(mccMnc)

Returns the network that matches a given MCC+MNC

``` js
mccMnc.mnc('238 73')
// {
//   name: 'Onomondo ApS',
//   mcc: 238,
//   mnc: 73
// }
```

### .config(path)

Loads the dataset from `path` and returns a new instance

### .update(path-to-dataset)

Fetches the dataset from ITU and stores it in `path`

### .hasUpdated([path])

Checks to see if the data set from itu.int has updated (uses the etag). If `path` to a dataset is given, then uses this dataset instead.

``` js
const mccMnc = require('mcc-mnc-itu')

mccMnc.hasUpdated().then(hasUpdated => {
  if (!hasUpdated) return
  console.log('The data set has updated. Should probably tell the module maker to update the data set')
})
```
