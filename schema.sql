DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (item_id)
);

USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Kraft Mac n' Cheese", "Groceries", 5.99, 54);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Women's T-Shirt", "Women's Clothing", 24.50, 12);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Men's T-Shirt", "Men's Clothing", 23.99, 20);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Women's Skirt", "Women's Clothing", 30.00, 15);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Men's Denim Jeans", "Men's Clothing", 59.99, 10);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Women's Denim Jeans", "Women's Clothing", 55.50, 8);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Frozen Pizza", "Groceries", 12.50, 34);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("2% Milk - 1 Gallon", "Groceries", 3.49, 13);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Blue Yarn", "Arts and Crafts", 6.99, 27);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("1 lb of Scrap Leather", "Arts and Crafts", 25.00, 10);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Leather Stamp", "Arts and Crafts", 12.45, 6);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Wool Blanket", "Home Goods", 75.50, 5);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Standing Lamp", "Home Goods", 24.99, 3);
    
SELECT * FROM products;