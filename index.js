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
    withdrawLogic(uname, pswd)
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
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
  
  const usersStatus = [];
  
  for (const user of parsedUsers) {
    console.log(`Processing withdrawal for user: ${user.name}`);
    try {
      await withdrawLogic(user.name, user.password);
      console.log(`Withdrawal completed for user: ${user.name}`);
      usersStatus.push({ name: user.name, success: true });
    } catch (error) {
      console.error(`Error processing withdrawal for user: ${user.name}`, error);
      usersStatus.push({ name: user.name, success: false });
    }
  }
  
  console.log("Withdrawal status:");
  for (const status of usersStatus) {
    console.log(`${status.name}: ${status.success ? "Success" : "Failed"}`);
  }
})();

app.listen(PORT);
