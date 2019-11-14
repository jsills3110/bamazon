var mysql = require("mysql");
var inquirer = require("inquirer");

var db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Zz4862588!",
    database: "bamazon"
});

db.connect(function (err) {
    if (err) throw err;
    startManager();
});

function startManager() {
    inquirer.prompt({
        name: "option",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
    }).then(function (choice) {
        var action = choice.option;
        switch (action) {
            case "View Products":
                viewProducts();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                chooseFromInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Quit":
                console.log("Thank you for managing Bamazon!");
                db.end();
                break;
            default:
                console.log("An error occurred or your answer was invalid. Please try again.");
                db.end();
        }
    })
}

function viewProducts() {
    db.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (err, results) {
        if (err) return err;
        var messageString = "";
        for (var i = 0; i < results.length; i++) {
            messageString += results[i].item_id + ") " + results[i].product_name + " | Price: " + results[i].price + " | Stock: " + results[i].stock_quantity + "\n";
        }
        console.log(messageString);
        startManager();
    });
}

function viewLowInventory() {
    db.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 10", function (err, results) {
        if (err) return err;
        var messageString = "";
        for (var i = 0; i < results.length; i++) {
            messageString += results[i].item_id + ") " + results[i].product_name + " | Price: " + results[i].price + " | Stock: " + results[i].stock_quantity + "\n";
        }
        console.log(messageString);
        startManager();
    });
}

function chooseFromInventory() {
    db.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (err, results) {
        if (err) return err;

        var messageString = "Which item would you like to add inventory to? Please enter its Product ID or type -1 to go back to the main menu.\n\n";
        var itemIds = [];
        for (var i = 0; i < results.length; i++) {
            messageString += results[i].item_id + ") " + results[i].product_name + " | Price: " + results[i].price + " | Stock: " + results[i].stock_quantity + "\n";
            itemIds.push(results[i].item_id);
        }
        messageString += "-1) Go Back to Main Menu\n\n";

        inquirer.prompt({
            name: "product",
            type: "number",
            message: messageString
        }).then(function (choice) {
            if (isNaN(choice.product)) {
                console.log("Please enter a number.");
                chooseFromInventory();
            } else if (choice.product === -1) {
                startManager();
            } else if (itemIds.indexOf(choice.product) < 0) {
                console.log("That item does not exist. Please choose an item from the available list.");
                chooseFromInventory();
            } else {
                addToStock(choice.product);
            }
        });
    });
}

function addToStock(theID) {
    db.query("SELECT product_name, price, stock_quantity FROM products WHERE ?", { item_id: theID }, function (err, results) {
        if (err) return err;
        var messageString = "Selected item:\n" +
            "Name: " + results[0].product_name + "\n" +
            "Price per unit: " + results[0].price + "\n" +
            "Left in stock: " + results[0].stock_quantity + "\n" +
            "\nHow much stock would you like to add? Enter -1 to cancel.";
        inquirer.prompt({
            name: "option",
            type: "number",
            message: messageString
        }).then(function (choice) {
            if (isNaN(choice.option)) {
                console.log("Please enter a number.");
                addToStock();
            } else if (choice.option === -1) {
                chooseFromInventory();
            } else if (choice.option === 0) {
                console.log("Please enter a number higher than 0.");
                addToStock();
            } else {
                var newStock = parseInt(results[0].stock_quantity) - parseInt(choice.option);
                db.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newStock
                        },
                        {
                            item_id: theID
                        }
                    ], function (err) {
                        if (err) throw err;
                        console.log("Stock updated successfully!");
                        start();
                    });
            }
        });
    });
}