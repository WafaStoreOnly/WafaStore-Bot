const fs = require('fs');
let data = { transactions: {} };
try { if(fs.existsSync('/tmp/database.json')) data = JSON.parse(fs.readFileSync('/tmp/database.json')); } catch(e){}
module.exports = {
  data,
  write: async () => {
    try{ fs.writeFileSync('/tmp/database.json', JSON.stringify(data, null, 2)); }catch(e){}
    try{ fs.writeFileSync('./database.json', JSON.stringify(data, null, 2)); }catch(e){}
  }
};
