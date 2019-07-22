//jshint esversion:6
const express= require("express");

const bodyparser= require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app= express();

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));

app.set('view engine','ejs');

mongoose.connect("mongodb+srv://abhishek-admin:Test123@cluster0-v2pto.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome to your todolist"
});
const item2=new Item({
  name:"hit the + button to add a new item"
});
const item3=new Item({
  name:"<--- hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema= {
  name: String,
  items: [itemsSchema]
};

const List= mongoose.model("List",listSchema);


app.get("/",function(req,res){

Item.find({},function(err, founditems){
  if(founditems.length === 0){

    Item.insertMany(defaultItems,function(err){
    if(err){
    console.log(err);
    }
    else{
      console.log("Successfully saved default items");
    }
    });
res.redirect("/");
  }
  else{
res.render("list",{ kindofday: "Today", newListitems:founditems});
}

});


});

app.post("/",function(req,res){

 let itemName=req.body.newItem;
const listName= req.body.list;


let item = new Item({

name:itemName
});

if(listName ==="Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name: listName}, function(err, foundlist){

foundlist.items.push(item);
foundlist.save();
res.redirect("/" + listName);
  });
}


});

app.post("/delete",function(req,res){

const checkId= req.body.checkbox;
const listName= req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkId,function(err){

  if(!err){
    console.log("successfully deleted");
  }
    res.redirect("/");
});
}
else{
List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkId}}},function(err, foundlist){

if(!err){
  res.redirect("/"+ listName);
}

});
}
});


app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err, foundlist){

if(!err){
  if(!foundlist){
    // create a new list
    const list= new List({

  name: customListName,
  items: defaultItems

    });
    list.save();
    res.redirect("/" + customListName)
  }
  else{
    // show new list
    res.render("list",{kindofday: foundlist.name, newListitems: foundlist.items});
  }
}

  });


});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port,function(){
console.log("server started successfully");

});

// app.listen(3000,function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("successfully started");
//   }
// });
// app.listen(3000,function(){
//   console.log("started");
// });
