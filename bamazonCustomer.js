var mysql = require("mysql");
var inquirer = require("inquirer");

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

connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;

    console.log("Here is a list of all the items for sale:");
    for (var i = 0; i < results.length; i++) {

        console.log("----------------------------------");
        console.log("Item " + results[i].item_id + ": " + results[i].product_name);
        console.log("Price: $" + results[i].price);

    }

    console.log("");
    console.log("");
});

function start() {

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
            message: "What item would you like to purchase?"
        }, {
            name: "purchase",
            type: "input",
            message: "How many units of this item would you like to buy?"
        }]).then(function(answer) {
            // get the information of the chosen item
            var chosenItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].product_name === answer.choice) {
                    chosenItem = results[i];
                }
            }
            // console.log(chosenItem);

            if (chosenItem.stock_quantity >= parseInt(answer.purchase)) {

                var newQuantity = chosenItem.stock_quantity - answer.purchase;
                // console.log(newQuantity);

                connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: newQuantity
                    }, {
                        item_id: chosenItem.item_id
                    }], function(error) {
                        if (error) throw err;
                        console.log("");
                        console.log("");
                        console.log("Order successful!");
                        console.log("Total cost: " + (answer.purchase * chosenItem.price));
                        console.log("");
                        console.log("");
                        start();
                    }


                )
            } else if (chosenItem.stock_quantity <= 0) {

                connection.query("DELETE FROM products WHERE ?", {
                    item_id: chosenItem.item_id
                }, function(err, res) {

                    console.log("");
                    console.log("");
                    console.log("Sorry, item is SOLD OUT!");
                    console.log("");
                    console.log("");
                    start();
                });

            } else {

                console.log("");
                console.log("");
                console.log("Insufficient quantity. Try again...");
                console.log("");
                console.log("");
                start();

            };
        });
    });

};

start();
