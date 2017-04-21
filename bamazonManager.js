var mysql = require("mysql");
var inquirer = require("inquirer");

function addNewProduct() {

    inquirer.prompt([

        // Here we create a basic text prompt.
        {
            type: "input",
            message: "What is your product name?",
            name: "name"
        },

        // Here we create a basic password-protected text prompt.
        {
            type: "input",
            message: "What department is your product in?",
            name: "department"
        },

        // Here we give the user a list to choose from.
        {
            type: "input",
            message: "How much does one unit of the product cost?",
            name: "price"
        },

        // Here we ask the user to confirm.
        {
            type: "input",
            message: "How much stock do you have of this product?",
            name: "stock"

        }

        // Once we are done with all the questions... "then" we do stuff with the answers
        // In this case, we store all of the answers into a "user" object that inquirer makes for us.
    ]).then(function(answer) {

        connection.query("INSERT INTO products SET ?", {
            product_name: answer.name,
            department_name: answer.department,
            price: answer.price,
            stock_quantity: answer.stock

        }, function(err, res) {

            if (err) throw err;
            console.log("");
            console.log("");
            console.log("Product successfully added.");
            console.log("");
            console.log("");
            start();
        });


    });

};

function addInventory() {

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        inquirer.prompt([{
            name: "choice",
            type: "rawlist",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].product_name);
                }
                return choiceArray;
            },
            message: "What item would you like to add to inventory?"
        }, {
            name: "amount",
            type: "input",
            message: "How many units of this item would you like to add?"
        }]).then(function(answer) {
            // get the information of the chosen item
            var chosenItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].product_name === answer.choice) {
                    chosenItem = results[i];
                }
            }
            // console.log(chosenItem);

            var newQuantity = chosenItem.stock_quantity + parseInt(answer.amount);
            // console.log(newQuantity);

            connection.query('UPDATE products SET ? WHERE ?', [{
                stock_quantity: newQuantity
            }, {
                item_id: chosenItem.item_id
            }], function(error) {
                if (error) throw err;
                console.log("");
                console.log("");
                console.log("Successfully added!");
                console.log("");
                console.log("");
                console.log("");
                start();
            })

        });


    })


};

function view() {

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        console.log("Here is a list of all the items for sale:");
        for (var i = 0; i < results.length; i++) {

            console.log("----------------------------------");
            console.log("Item " + results[i].item_id + ": " + results[i].product_name);
            console.log("Price: $" + results[i].price);
            console.log("Inventory: " + results[i].stock_quantity);

        }
        console.log("");
        console.log("");

    });
    console.log("");
    start();
};

function lowInventory() {

    var query = "SELECT * FROM products";
    connection.query(query, function(err, res) {
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 5) {

                console.log("-----------------------");
                console.log("Product: " + res[i].product_name);
                console.log("Quantity remaining: " + res[i].stock_quantity);

            }

        }
        console.log("");
        console.log("");
    });
    console.log("");
    start();
};

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "Bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
});

function start() {
    console.log("");
    console.log("");
    inquirer.prompt([{
        name: "choice",
        type: "rawlist",
        choices: function() {
            var choiceArray = [];
            choiceArray.push("View Products for Sale");
            choiceArray.push("View Low Inventory");
            choiceArray.push("Add to Inventory");
            choiceArray.push("Add New Product");

            return choiceArray;
        },
        message: "Mr. Manager, what would you like to do?"
    }]).then(function(answer) {
        // get the information of the chosen item
        if (answer.choice === "View Products for Sale") {

            view();

        } else if (answer.choice === "View Low Inventory") {

            lowInventory();

        } else if (answer.choice === "Add to Inventory") {

            addInventory();

        } else if (answer.choice === "Add New Product") {

            addNewProduct();

        } else {

            console.log("Sorry, that is not an available feature.");

        }

    });

};

start();
