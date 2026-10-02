const express = require("express");
const app = express();

app.use(express.static(__dirname));

// Backend API
// We use async because we are calling an external API and need to wait for its response.
app.get("/joke", async function(req, res){
    // await:- Wait until the API gives us a response
    // Calling the external API
    const response = await fetch("https://official-joke-api.appspot.com/random_joke");
    // The API response needs to be converted into JavaScript/JSON data.
    const data = await response.json();
    // This sends the quote data from our Express backend to our HTML/JavaScript frontend.
    res.json(data);
});

app.listen(3000, function(){
    console.log("Server is running on PORT 3000");
})