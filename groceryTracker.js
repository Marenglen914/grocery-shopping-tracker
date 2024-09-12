const http = require('http');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Set up logging with Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'server.log' }),
  ],
});

// Path to the JSON file for persistence
const groceryFilePath = path.join(__dirname, 'groceryList.json');

// Load grocery data from file
function loadGroceryList() {
  if (fs.existsSync(groceryFilePath)) {
    const data = fs.readFileSync(groceryFilePath);
    return JSON.parse(data);
  } else {
    return [];
  }
}

// Save grocery data to file
function saveGroceryList(data) {
  fs.writeFileSync(groceryFilePath, JSON.stringify(data, null, 2));
}

// Initialize the grocery list from file
let groceryList = loadGroceryList();

// Create the server
const server = http.createServer((req, res) => {
  const { method, url } = req;

  // GET - View grocery list
  if (method === 'GET' && url === '/groceries') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(groceryList));
    logger.info('Grocery list viewed');
  
  // POST - Add an item
  } else if (method === 'POST' && url === '/groceries') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { name, price, quantity, bought } = JSON.parse(body);
      const newItem = { name, price: parseFloat(price), quantity: parseInt(quantity), bought: bought || false };
      groceryList.push(newItem);
      saveGroceryList(groceryList);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newItem));
      logger.info(`Item added: ${name}`);
    });
  
  // PUT - Edit an item
  } else if (method === 'PUT' && url.startsWith('/groceries/')) {
    const index = parseInt(url.split('/')[2]);
    if (index >= 0 && index < groceryList.length) {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const updatedItem = JSON.parse(body);
        groceryList[index] = { ...groceryList[index], ...updatedItem };
        saveGroceryList(groceryList);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(groceryList[index]));
        logger.info(`Item edited: ${groceryList[index].name}`);
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Item not found' }));
    }

  // DELETE - Remove an item
  } else if (method === 'DELETE' && url.startsWith('/groceries/')) {
    const index = parseInt(url.split('/')[2]);
    if (index >= 0 && index < groceryList.length) {
      const removedItem = groceryList.splice(index, 1);
      saveGroceryList(groceryList);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Item removed: ${removedItem[0].name}` }));
      logger.info(`Item removed: ${removedItem[0].name}`);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Item not found' }));
    }

  // Handle unknown routes
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
    logger.warn(`Route not found: ${method} ${url}`);
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  logger.info(`Server started on port ${PORT}`);
});
