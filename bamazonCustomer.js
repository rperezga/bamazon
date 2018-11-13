var mysql = require("mysql");
const cTable = require('console.table');
const inquirer = require("inquirer");

var products_name = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  afterConnection();
});

function afterConnection() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    products = res;
    console.table(products);
    for (var i = 0; i < products.length; i++) {
      products_name.push(products[i].product_name)
    }

    init();
    // connection.end();
  });
}

function init() {
  console.log("Hello. Welcome to Bamazon!");
  console.log("-----------------------------");
  selectProduct()
}

function selectProduct() {
  inquirer.prompt([
    {
      type: "list",
      message: "Which product you want to buy?",
      choices: products_name,
      name: "product"
    },
    {
      type: "input",
      message: "How many products you want to buy?",
      name: "quantity"
    }
  ])
    .then(data => {
      if (!isNaN(parseInt(data.quantity))) {
        checkForProduct({ product: products_name.indexOf(data.product) + 1, quantity: parseInt(data.quantity) });
      } else {
        inquirer
          .prompt([
            {
              type: "input",
              message: "Incorrect entry. How many products you want to buy?",
              name: "quantity"
            }
          ])
          .then(function (newQuantity) {
            checkForProduct({ product: products_name.indexOf(data.product) + 1, quantity: parseInt(newQuantity.quantity) });
          })
      }
    });
}

function checkForProduct(req) {
  console.log(req)
  
  connection.query("SELECT stock_quantity, product_name, price FROM products WHERE item_id =" + req.product , function (err, res) {
    product = res;

    if(product[0].stock_quantity > req.quantity){
      var desc = "UPDATE products SET stock_quantity = " + (product[0].stock_quantity - req.quantity) + " WHERE item_id = " + req.product
      // console.log(product)
      connection.query(desc , function (err, res) {
        console.log("You bought " + req.quantity + " " + product[0].product_name + ", and your total is: $" + (req.quantity * product[0].price));
        afterConnection();
      });
    }else{
      console.log('Insufficient quantity!');
      afterConnection();
    }    
  })   
  
}

