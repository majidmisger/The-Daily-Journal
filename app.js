const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/journalDB', { useNewUrlParser: true, useUnifiedTopology: true });

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        require: true,
    },
    create: {
        type: Date,
        default: Date.now,
    }
});

const Post = mongoose.model("Post", postSchema);
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: true,
    },

});

const User = mongoose.model("User", userSchema);

//index Route
app.get("/", function (req, res) {
    Post.find({}, function (err, posts) {
        res.render("home", { posts: posts });
    })
});

//contact Route
app.get("/contact", function (req, res) {
    res.render("contact");
});

//addBlog Route
app.get("/addBlog", function (req, res) {
    res.render("addBlog");
});

//specific post route
app.get("/post/:id", function (req, res) {
    const postId = req.params.id;
    Post.findById(postId, function (err, post) {
        res.render("post", { post: post });
    })
});

//Post route
app.post("/addBlog", function (req, res) {
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content
    });
    post.save(function (err) {
        if (!err) {

            res.redirect("/");
        }
    })

})
//delete post Route

app.get("/delete/:id", function(req, res){
    const postId = req.params.id;
    Post.findByIdAndRemove(postId, function(err, deletedPost){
        if(!err){
            console.log("deleted post successfully");
            res.redirect("/")
        }
    })
})



//edit blog

app.get("/edit/:id",function(req,res){
   const postId = req.params.id;
    Post.findById(postId, function(err, post){
        res.render("update", {post:post});
    })

});

//update route
app.post("/update/:id", function(req,res){
const postId = req.params.id;

Post.findByIdAndUpdate(postId,req.body,{new: true}, function(err,updatedPost){
    console.log(updatedPost);
    res.redirect("/post/"+req.params.id);
})


});

//login Route
app.get("/login", function(req, res){
    res.render("login")
});

//registr route

app.get("/Register", function(req, res){
    res.render("register")
})

//error Route
app.get("*", function (req, res) {
    res.render("error")
})

app.listen(3000, function () {
    console.log("server Started on Port 3000");
});