const http = require('http');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'server.log' }),
  ],
});

// File path for storing grocery data
const groceryFilePath = path.join(__dirname, 'data.json');

// Utility to read the shopping list from the JSON file
function readShoppingList() {
  if (fs.existsSync(groceryFilePath)) {
    const data = fs.readFileSync(groceryFilePath, 'utf8');
    return JSON.parse(data);
  } 
  return [];
}

// Utility to write the shopping list to the JSON file
function writeShoppingList(data) {
  fs.writeFileSync(groceryFilePath, JSON.stringify(data, null, 2));
}

// Initialize grocery list on server start
let groceryList = readShoppingList();

// Handlers for each REST method
function handleGetGroceries(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(groceryList));
  logger.info('Grocery list viewed');
}

function handlePostGroceries(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const { name, price, quantity, bought } = JSON.parse(body);
      if (!name || isNaN(price) || isNaN(quantity)) {
        throw new Error('Invalid input');
      }
      const newItem = { name, price: parseFloat(price), quantity: parseInt(quantity), bought: !!bought };
      groceryList.push(newItem);
      writeShoppingList(groceryList);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newItem));
      logger.info(`Item added: ${name}`);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid input data' }));
      logger.error(`Invalid input data: ${error.message}`);
    }
  });
}

function handlePutGroceries(req, res, index) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      if (index >= 0 && index < groceryList.length) {
        const updatedItem = JSON.parse(body);
        groceryList[index] = { ...groceryList[index], ...updatedItem };
        writeShoppingList(groceryList);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(groceryList[index]));
        logger.info(`Item updated: ${groceryList[index].name}`);
      } else {
        throw new Error('Item not found');
      }
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: error.message }));
      logger.error(`Error updating item: ${error.message}`);
    }
  });
}

function handleDeleteGroceries(req, res, index) {
  if (index >= 0 && index < groceryList.length) {
    const removedItem = groceryList.splice(index, 1);
    writeShoppingList(groceryList);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Item removed: ${removedItem[0].name}` }));
    logger.info(`Item removed: ${removedItem[0].name}`);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Item not found' }));
    logger.error('Item not found');
  }
}

// Main server logic
const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'GET' && url === '/groceries') {
    handleGetGroceries(req, res);
  } else if (method === 'POST' && url === '/groceries') {
    handlePostGroceries(req, res);
  } else if (method === 'PUT' && url.startsWith('/groceries/')) {
    const index = parseInt(url.split('/')[2], 10);
    handlePutGroceries(req, res, index);
  } else if (method === 'DELETE' && url.startsWith('/groceries/')) {
    const index = parseInt(url.split('/')[2], 10);
    handleDeleteGroceries(req, res, index);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
    logger.warn(`Route not found: ${method} ${url}`);
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  logger.info(`Server started on port ${PORT}`);
});

module.exports = { server, readShoppingList, writeShoppingList };
