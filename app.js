const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//index Route
app.get("/",function(req,res){
res.render("home");

});

//contact Route
app.get("/contact", function(req, res){
    res.render("contact");
});

//addBlog Route
app.get("/addBlog", function(req, res){
    res.render("addBlog");
});

//specific post route
app.get("/post",function(req,res){

    res.render("post");
});

//error Route
app.get("*", function(req, res){
    res.render("error")
})

app.listen(3000,function(){
    console.log("server Started on Port 3000");
});