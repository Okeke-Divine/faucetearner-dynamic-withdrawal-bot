const express = require("express");
const { withdrawLogic } = require("./withdrawLogic");
const dotenv = require("dotenv");

const app = express();

const PORT = process.env.PORT || 4000;

dotenv.config();

app.get("/manual-call", (req, res) => {
  const { uname, pswd } = req.query;
  if (uname == undefined || pswd == undefined) {
    res.send('Params error! Kill the script');
    console.log('Params error! Kill the script');
  } else {
    res.send('Initializing withdrawal bot for uname:' + uname + ' pswd:' + pswd);
    withdrawLogic(res, uname, pswd);
  }
});

(async () => {
  console.log(`Listening on port ${PORT}`);
  
  const users = process.env.USERS;
  
  if (!users) {
    console.log('No users found in .env file');
    return;
  }
  
  const parsedUsers = JSON.parse(users);
  
  if (!Array.isArray(parsedUsers)) {
    console.log('Invalid format for USERS in .env file');
    return;
  }
  
  for (const user of parsedUsers) {
    const { name: uname, password: pswd } = user;
    
    if (!uname || !pswd) {
      console.log('Invalid user data found in .env file:', user);
      continue;
    }
    
    console.log(`Processing withdrawal for user: ${uname}`);
    await withdrawLogic(null, uname, pswd);
    console.log(`Withdrawal completed for user: ${uname}`);
  }
  
  console.log('All withdrawals completed');
})();

app.listen(PORT);
