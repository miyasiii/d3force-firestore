# d3force-firestore
visualize stored data

# firestore stored format
- links(collection)
  - anyName1(document)
    - {source: nodeName, target: nodeName}(fields)
  - anyName2(document)
    - {source: nodeName, target: nodeName}(fields)
  - anyName3(document)
    - {source: nodeName, target: nodeName}(fields)
  - ...
- nodes(collection)
  - nodeName1(document)
    - {anyAttribute: xxx}(fields)
  - nodeName2(document)
    - {anyAttribute: xxx}(fields)
  - nodeName3(document)
    - {anyAttribute: xxx}(fields)
  - ...

# local simulator
- command `firebase serve --only hosting`

# deploy
- add file `.firebaserc`
- command `firebase deploy`
