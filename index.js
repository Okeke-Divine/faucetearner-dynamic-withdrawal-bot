const express = require("express")
const { withdrawLogic } = require("./withdrawLogic")

const app = express()

const PORT = process.env.PORT || 4000

app.get("/", (req, res) => {
  const { uname, pswd } = req.query;
  if (uname == undefined || pswd == undefined) {
    res.send('Params error! Kill the script');
    console.log('Params error! Kill the script');
  } else {
    withdrawLogic(res, uname, pswd);
  }
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
