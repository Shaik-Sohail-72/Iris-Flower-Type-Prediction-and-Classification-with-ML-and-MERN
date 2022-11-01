//jshint esversion:6
require('dotenv').config();
const {parse, stringify} = require('flatted');
let {PythonShell} = require('python-shell')
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(process.env.DB_LINK, {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId:String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user,done)
{
    done(null,user.id);
});
passport.deserializeUser(function(id,done)
{
    User.findById(id,function(err,user)
    {
        done(err,user);
    });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALL_BACK_URL,
  userProfileUrl:   process.env.URL
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id,username:profile.id}, function (err, user) {
    return cb(err, user);
  });
}
));

app.get("/", function(req, res){
  res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
      ['profile' ] }
));
app.get("/auth/google/irisflower",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/submit");
  });
app.get("/login", function(req, res){
  res.render("login");
});
app.get("/secrets", function(req, res){
  res.render("secrets");
});
app.get("/register", function(req, res){
  res.render("register");
});
app.get("/submit",function(req,res)
{
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});
final_type=""
final_accuracy=""
final_matrix1=""
final_matrix2=""
final_matrix3=""
app.post("/submit",function(req,res)
{
  const submitted_sepal_length=req.body.sepal_length;
  const submitted_sepal_width=req.body.sepal_width;
  const submitted_petal_length=req.body.petal_length;
  const submitted_petal_width=req.body.petal_width;
  let options={
    args:[submitted_sepal_length,submitted_sepal_width,submitted_petal_length,submitted_petal_width]
  };
  PythonShell.run('algo.py',options, (err,response)=>{
    if (err)
    console.log(err);
    if(response){
      a=stringify(response[0].slice(2,-2));
      final_type=a.slice(2,-2);
      b=stringify(response[1]);
      final_accuracy=b.slice(2,-2);
      c=stringify(response[2]);
      d=stringify(response[3]);
      e=stringify(response[4]);
      final_matrix1=c.slice(4,-3);
      final_matrix2=d.slice(4,-3);
      final_matrix3=e.slice(4,-4);
    }
  });
  res.redirect("/secrets")
  app.get("/secrets", function(req, res){
    res.redirect(req.get('referer'));
  });
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){
  User.register({username: req.body.username},req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/submit");
      });
    }
  });
});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/submit");
      });
    }
  });
});

let port = process.env.PORT;
	if (port == null || port == "") {
  	port = 3000;
	}
app.listen(port, function() {
  console.log("Server started on port 3000.");
});
