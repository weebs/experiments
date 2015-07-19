'use strict';

const DBConfig = {
  StoreName: 'dtSkratchStore'
};

if(!localStorage.getItem(DBConfig.StoreName)) {
  localStorage.setItem(DBConfig.StoreName, JSON.stringify({}));
}

let kDB = JSON.parse(localStorage.getItem(DBConfig.StoreName));
// Convert date to actual string
kDB.LastSave = new Date(kDB.LastSave);

if(!localStorage.getItem('kounter')) {
  console.log('setting kounter');
  localStorage.setItem('kounter', 0);
}

console.log(kDB.LastSave);
// alert('Last save was at: ' + kDB.LastSave.toDateString());

let kounter = parseInt(localStorage.getItem('kounter'));
console.log('kounter at start: ' + kounter);
kounter++;
console.log('kounter at end: ' + kounter);
localStorage.setItem('kounter', kounter);

kDB.Count = kounter;
kDB.LastSave = new Date();
localStorage.setItem(DBConfig.StoreName, JSON.stringify(kDB));