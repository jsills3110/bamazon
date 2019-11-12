var mysql = require("mysql");
var inquirer = require("inquirer");

var customerCart = [];
var customerPurchases = [];

var db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Zz4862588!",
    database: "bamazon"
});

db.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    inquirer.prompt({
        name: "option",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products", "View My Cart", "View My Purchases", "Quit"]
    }).then(function (choice) {
        var action = choice.option;
        switch (action) {
            case "View Products":
                viewProducts();
                break;
            case "View My Cart":
                viewCart();
                break;
            case "View My Purchases":
                viewPurchases();
                break;
            case "Quit":
                console.log("Thank you for shopping on Bamazon!");
                db.end();
                break;
            default:
                console.log("An error occurred or your answer was invalid. Please try again.");
                db.end();
        }
    })
}

function viewProducts() {
    db.query("SELECT item_id, product_name FROM products", function (err, results) {
        if (err) return err;

        var messageString = "Which item would you like to order? Please enter its Product ID or type -1 to go back to the main menu.\n\n";
        var itemIds = [];
        for (var i = 0; i < results.length; i++) {
            messageString += results[i].item_id + ") " + results[i].product_name + "\n";
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
                viewProducts();
            } else if (choice.product === -1) {
                start();
            } else if (itemIds.indexOf(choice.product) < 0) {
                console.log("That item does not exist. Please choose an item from the available list.");
                viewProducts();
            } else {
                buyProduct(choice.product);
            }
        });
    });
}

function buyProduct(theID) {
    db.query("SELECT product_name, price, stock_quantity FROM products WHERE ?", { item_id: theID }, function (err, results) {
        if (err) return err;
        if (results[0].stock_quantity <= 0) {
            inquirer.prompt({
                name: "option",
                type: "list",
                message: "Sorry, that item is out of stock. Hit enter to go back.",
                choices: ["Go Back"]
            }).then(function (choice) {
                viewProducts();
            });
        } else {
            var messageString = "Selected item:\n" +
                "Name: " + results[0].product_name + "\n" +
                "Price per unit: " + results[0].price + "\n" +
                "Left in stock: " + results[0].stock_quantity + "\n" +
                "\nWould you like to add this item to your cart or buy now?";
            inquirer.prompt({
                name: "option",
                type: "list",
                message: messageString,
                choices: ["Add to Cart", "Buy Now", "Go Back"]
            }).then(function (choice) {
                var action = choice.option;
                switch (action) {
                    case "Add to Cart":
                        addToCart(theID, results[0].stock_quantity, results[0].product_name, results[0].price);
                        break;
                    case "Buy Now":
                        buyNow(theID, results[0].stock_quantity, results[0].product_name, results[0].price);
                        break;
                    case "Go Back":
                        viewProducts();
                        break;
                    default:
                        console.log("An error occurred or your answer was invalid. Please try again.");
                        buyProduct(theID);
                }
            });
        }
    });
}

function addToCart(theID, theStock, theName, thePrice) {
    inquirer.prompt({
        name: "quantity",
        type: "number",
        message: "How many would you like to add to your cart? Enter 0 to go back.",
    }).then(function (answer) {
        var number = answer.quantity;
        if (number > theStock) {
            console.log("Sorry, we don't have that much in stock. Please try again.");
            addToCart(theID, theStock);
        } else if (number === 0) {
            viewProducts();
        } else {
            customerCart.push({
                itemID: theID,
                itemName: theName,
                itemPrice: thePrice,
                itemQuantity: number
            });
            console.log("Added to your cart successfully!");
            start();
        }
    });
}

function buyNow(theID, theStock, theName, thePrice) {
    inquirer.prompt({
        name: "quantity",
        type: "number",
        message: "How many would you like to buy now? Enter 0 to go back.",
    }).then(function (answer) {
        var number = answer.quantity;
        if (number > theStock) {
            console.log("Sorry, we don't have that much in stock. Please try again.");
            buyNow(theID, theStock);
        } else if (number === 0) {
            viewProducts();
        } else {
            var newStock = theStock - number;
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
                    customerPurchases.push({
                        itemID: theID,
                        itemName: theName,
                        itemPrice: thePrice,
                        itemQuantity: number
                    });
                    console.log("Purchased successfully!");
                    start();
                });
        }
    });
}

function viewCart() {
    if (customerCart.length < 1) {
        console.log("Your cart is empty. Select \"View Products\" to begin shopping.");
        start();
    } else {
        var cartTotal = 0;
        console.log("\nItems currently in cart:\n");
        for (var i = 0; i < customerCart.length; i++) {
            var item = customerCart[i];
            var totalPrice = item.itemQuantity * item.itemPrice;
            cartTotal += totalPrice;
            console.log(item.itemName + ", Quantity: " + item.itemQuantity + ", Price Per Item: " + item.itemPrice + ", Total: " + totalPrice.toFixed(2));
        }
        console.log("\nCart Total: " + cartTotal.toFixed(2));

        inquirer.prompt({
            name: "option",
            type: "list",
            message: "What would you like to do with your cart?",
            choices: ["Purchase All", "Remove All", "Remove an Item", "Modify an Item", "Go Back to Main Menu"]
        }).then(function (choice) {
            var action = choice.option;
            switch (action) {
                case "Purchase All":
                    buyAll();
                    break;
                case "Remove All":
                    removeAll();
                    break;
                case "Remove an Item":
                    removeAnItem();
                    break;
                case "Modify an Item":
                    modifyAnItem();
                    break;
                case "Go Back to Main Menu":
                    start();
                    break;
                default:
                    console.log("An error occurred or your answer was invalid. Please try again.");
                    break;
            }
        });
    }
}

function buyAll() {
    db.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (err, results) {
        if (err) return err;

        for (var i = 0; i < customerCart.length; i++) {
            db.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: stock_quantity - customerCart[i].itemQuantity
                    },
                    {
                        item_id: theID
                    }
                ], function (err) {
                    if (err) throw err;
                    customerPurchases.push({
                        itemID: customerCart[i].itemID,
                        itemName: customerCart[i].itemName,
                        itemPrice: customerCart[i].itemPrice,
                        itemQuantity: customerCart[i].itemQuantity
                    });
                    console.log(customerCart[0].itemName + " purchased successfully!");
                });
        }
        customerCart = [];
        start();
    });
}

function viewPurchases() {
    if (customerPurchases.length < 1) {
        console.log("You haven't purchased anything yet. Select \"View Products\" to begin shopping.");
        start();
    } else {
        var purchasedTotal = 0;
        console.log("\nItems purchased:\n");
        for (var i = 0; i < customerPurchases.length; i++) {
            var item = customerPurchases[i];
            var totalPrice = item.itemQuantity * item.itemPrice;
            purchasedTotal += totalPrice;
            console.log(item.itemName + ", Quantity: " + item.itemQuantity + ", Price Per Item: " + item.itemPrice + ", Total: " + totalPrice.toFixed(2));
        }
        console.log("\nPurchased Total: " + purchasedTotal.toFixed(2));
        start();
    }
}