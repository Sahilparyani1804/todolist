const express=require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const PORT=process.env.PORT || 3000;
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

mongoose.connect("mongodb+srv://sahilparyani313:P7RMDMt1rmo2HP5o@cluster0.m2ewegs.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema={
    name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to the ToDoList"
});
const item2=new Item({
    name:"Hit + to add a new item to the list"
});
const item3=new Item({
    name:"<-- Hit this to delete an item"
});


const defaultItems=[item1,item2,item3];
const listSchema={
    name:String,
    items:[itemsSchema] 
};
const List=mongoose.model("List",listSchema);



app.get("/",function(req,res){
    Item.find({}).then(foundItems=>{
          if(foundItems.length===0){
            Item.insertMany(defaultItems).then(function(){
                console.log("succesfully added items to db");
            }).catch(function(err){
                console.log(err);
            });
            res.redirect("/");
          }
          else{
            res.render("list",{listTitle:"Today",newListItems:foundItems}); 
          }




        })
    })
   

app.post("/",function(req,res){
 const itemName=req.body.newItem;
 const listName=req.body.list;
   const item=new Item({
    name:itemName
   });
   if(listName==="Today"){
    item.save();
    res.redirect("/");
   }else{
     List.findOne({ name:listName}).then(foundList=>{
         foundList.items.push(item);
         foundList.save();
         res.redirect("/"+listName)
     }).catch(function(err){
        console.log(err);
     })
   }
})

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newListItems:workitems});
})
app.get("/about",function(req,res){
    res.render("about");
})
app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
      if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(){
            console.log("succesfully removed");
        }).catch(function(err){
          console.log(err);  
        })
        res.redirect("/");
      }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(foundList=>{
            res.redirect("/"+listName);
        }).catch(function(err){
           console.log(err);
        })
      }

    
})
app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName}).then(foundList=>{

        if(!foundList){
            const list=new List({
                name:customListName,
                items:defaultItems
             });
             list.save();     
             res.redirect("/"+customListName);
        }else{
           res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
        }
    }).catch(function(err){
        console.log(err);
    })
})

   

   



app.listen(PORT,function(){
    console.log("server started on port");
})
