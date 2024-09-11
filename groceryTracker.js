// Import the readline module for handling user input in the console
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Array to hold grocery items
let groceryList = [];

// Function to display the menu
function displayMenu() {
  console.log(`
  Grocery List Tracker:
  1. View grocery list
  2. Add item to grocery list
  3. Remove item from grocery list
  4. Mark item as bought
  5. Exit
  `);
  rl.question('Select an option: ', handleMenu);
}

// Function to display the grocery list
function displayGroceryList() {
  if (groceryList.length === 0) {
    console.log("Your grocery list is empty.");
  } else {
    console.log("\nYour Grocery List:");
    groceryList.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.name} - Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)}, Bought: ${item.bought ? 'Yes' : 'No'}`
      );
    });
  }
  displayMenu();
}

// Function to add an item to the grocery list
function addItem() {
  rl.question('Enter item name: ', (name) => {
    rl.question('Enter quantity: ', (quantity) => {
      rl.question('Enter price: ', (price) => {
        const item = {
          name,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          bought: false,
        };
        groceryList.push(item);
        console.log(`${name} has been added to your grocery list.`);
        displayMenu();
      });
    });
  });
}

// Function to remove an item from the grocery list
function removeItem() {
  displayGroceryList();
  rl.question('Enter the number of the item to remove: ', (index) => {
    const itemIndex = parseInt(index) - 1;
    if (itemIndex >= 0 && itemIndex < groceryList.length) {
      const removedItem = groceryList.splice(itemIndex, 1);
      console.log(`${removedItem[0].name} has been removed from your list.`);
    } else {
      console.log("Invalid item number.");
    }
    displayMenu();
  });
}

// Function to mark an item as bought
function markItemAsBought() {
  displayGroceryList();
  rl.question('Enter the number of the item to mark as bought: ', (index) => {
    const itemIndex = parseInt(index) - 1;
    if (itemIndex >= 0 && itemIndex < groceryList.length) {
      groceryList[itemIndex].bought = true;
      console.log(`${groceryList[itemIndex].name} has been marked as bought.`);
    } else {
      console.log("Invalid item number.");
    }
    displayMenu();
  });
}

// Function to handle the menu selection
function handleMenu(option) {
  switch (option) {
    case '1':
      displayGroceryList();
      break;
    case '2':
      addItem();
      break;
    case '3':
      removeItem();
      break;
    case '4':
      markItemAsBought();
      break;
    case '5':
      console.log("Goodbye!");
      rl.close();
      break;
    default:
      console.log("Invalid option. Please try again.");
      displayMenu();
      break;
  }
}

// Start the application
displayMenu();
