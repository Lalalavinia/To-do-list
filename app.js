
const express = require("express");
// const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = ({
    name: String
});

const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
    name: "Apply for jobs."
})
const item2 = new Item({
    name: "Eat breakfast."
})
const item3 = new Item({
    name: "Study a new module."
})
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("list", listSchema);
// const currentDay = "Today";

app.get("/", (req, res) => {
    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved all items to the DB.");
                }
            })
            res.redirect("/");
        } else {
            res.render('list', { listTitle: "Today", listedItems: foundItems });
        }
    })
})

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}, (err,foundList)=>{
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            } else {
                res.render('list',{listTitle: foundList.name, listedItems: foundList.items})
            }
        }
    })
})

app.post("/",(req,res)=>{
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName},(err,foundList) =>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
})

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, err => {
            if (!err) {
                console.log("Successfully remove the item.")
                res.redirect("/")
            }
        });
    } else{
        List.findOneAndUpdate(
            {name:listName},
            {$pull: {items:{_id:checkedItemId}}},
            (err,foundList)=>{
                if (!err) {
                    res.redirect("/"+listName);
                }
            }
        )
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000.");
})