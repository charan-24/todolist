//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require('mongoose');
const _ = require('lodash');

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model('Item',itemsSchema);

const item1= new Item({
  name:"Buy"
});

const item2= new Item({
  name:"Cook"
});

const item3= new Item({
  name:"Eat"
});

const defItems=[item1,item2,item3];

const listsSchema= new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List = mongoose.model('List',listsSchema);

app.get("/", function(req, res) {
  Item.find({})
      .catch((err)=>{console.log(err)})
      .then((foundItem)=>{
        if(foundItem.length!=0){
          res.render("list", {listTitle: "Today", newListItems: foundItem});
        }
        else{
          Item.insertMany(defItems)
          .then(()=>{console.log("Inserted")})
          .catch((err)=>{console.log(err)});
          res.redirect('/');
        }        
      });
});

app.post("/", function(req, res){

  const listName=req.body.list;
  const itemx = new Item({
    name:req.body.newItem
  });
  
  if (listName !== "Today") {
    List.findOne({name:listName})
        .then((foundList)=>{
          foundList.items.push(itemx);
          foundList.save();
          res.redirect('/'+listName);
          //console.log(foundList.items);
          //console.log(itemx);
        })
        .catch((err)=>{console.log(err)});
  } else {
    itemx.save()
    res.redirect("/");
  }
});

app.post('/delete',(req,res)=>{
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.deleteOne({_id:req.body.checkbox})
    .then(()=>{
      console.log("deleted");
    })
    .catch((err)=>{console.log(err)});
    res.redirect('/');
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:req.body.checkbox}}})
        .catch((err)=>{console.log(err)})
        .then(()=>{
          res.redirect('/'+listName);
        })
  }
  
});

app.get('/:customListName',(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  const list = new List({
    name:customListName,
    items:defItems
  });
  List.findOne({name:customListName})
      .then((item)=>{
        if(!item){
          //console.log("Doesn't exist");
          list.save();
          res.redirect('/'+customListName);
        }
        else{
          //console.log("exist");
          res.render('list',{listTitle:item.name,newListItems:item.items})
        }
      })
      .catch((err)=>{console.log(err)});
  //list.save();
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
