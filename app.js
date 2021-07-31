const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const Authenticate = require("./middleware/auth");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/journalDB', { useNewUrlParser: true, useUnifiedTopology: true });



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
    },
    author:{
      id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      },
      email: String  
    }
});

const Post = mongoose.model("Post", postSchema);

var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/journalDB',
    collection: 'sessions'
  });

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: store
  
  }));

// middleware
 app.use(function(req, res, next){
    if(!req.session.user){
        next();
    } else{
        User.findById(req.session.user._id, function(err, user){
            if(user){
                req.user = user;
                next();
            }
        })
    }
 })
     
 

app.use(function(req, res, next){
    
    
    res.locals.user = req.session.user;
    
    res.locals.isAuthenticated = req.session.isAuthenticated;
    next();

});

const getAuthorize = function(req, res, next){
    if(req.session.isAuthenticated){
        Post.findById(req.params.id, function(err, postfound){
            if(err){
                res.redirect("/")
            } else{
                if(postfound.author.id.equals(req.session.user._id)){
                   next(); 
                } else{
                    res.redirect("/")
                }
            }
        })

    }
}


     
 

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
app.get("/addBlog",Authenticate.getAuth, function (req, res) {
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
app.post("/addBlog",Authenticate.getAuth, function (req, res) {
    const title = req.body.title;
    const content = req.body.content;
    const post = {
        title: title,
        content: content
        
    }
    Post.create(post, function(err, newPost){
        newPost.author.id = req.session.user._id;
        newPost.author.email = req.session.user.email;
        newPost.save(function(err){
            if(!err){
                console.log(newPost);
                res.redirect("/");
            }
        })
    })
  

})
//delete post Route
app.get("/delete/:id",Authenticate.getAuth,getAuthorize, function(req, res){
    const postId = req.params.id;
    Post.findByIdAndRemove(postId, function(err, deletedPost){
        if(!err){
            console.log("deleted post successfully");
            res.redirect("/")
        }
    })
})



//edit blog

app.get("/edit/:id",Authenticate.getAuth,getAuthorize,function(req,res){
   const postId = req.params.id;
    Post.findById(postId, function(err, post){
        res.render("update", {post:post});
    })

});

//update route
app.post("/update/:id",Authenticate.getAuth, function(req,res){
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
});

//login post route
app.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email}, function(err, user){
        if(!user){
            console.log("email not matched");
            res.redirect("/login");
        }else if(user.password === password){
              req.session.user = user;
              req.session.isAuthenticated = true;
              console.log("user logged in");
              res.redirect("/")
        }else{
            console.log("password not matched");
            res.redirect("/login");
        }
    })
})

//register Post route
app.post("/register", function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    const user = new User({
        email:email,
        password: password,
    });
    user.save(function(err){
        if(!err){
            console.log("user added successfully");
            res.redirect("/login");
        }
    })
});

app.get("/logout", function(req, res){
    req.session.destroy(function(err){
        if(!err){
            res.redirect("/");
        }
    })
})


//error Route
app.get("*", function (req, res) {
    res.render("error")
})

app.listen(3000, function () {
    console.log("server Started on Port 3000");
});