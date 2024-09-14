const request = require('supertest');
const { server } = require('../src/shoppingListDAO');

describe('GET /groceries', () => {
  test('should return the grocery list', async () => {
    const response = await request(server).get('/groceries');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
  });
});

describe('POST /groceries', () => {
  test('should add a new item to the grocery list', async () => {
    const newItem = { name: 'Apples', price: 1.99, quantity: 5, bought: false };
    const response = await request(server)
      .post('/groceries')
      .send(newItem);
      
    expect(response.status).toBe(201);
    expect(response.body).toEqual(newItem);
  });
});

describe('PUT /groceries/:index', () => {
  test('should update an existing item', async () => {
    const updatedItem = { price: 2.49 };
    const response = await request(server)
      .put('/groceries/0')
      .send(updatedItem);

    expect(response.status).toBe(200);
    expect(response.body.price).toBe(2.49);
  });
});

describe('DELETE /groceries/:index', () => {
  test('should delete an item from the grocery list', async () => {
    const response = await request(server).delete('/groceries/0');
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Item removed:/);
  });
});
