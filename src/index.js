const express = require('express');
const cors = require('cors');

const {
  v4: uuidv4
} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  if (users.length === 0) {
    return response.status(404).json({
      error: 'No users registered'
    });
  }

  const userAlreadyExists = users.find(user => user.username === request.headers.username);

  if (!userAlreadyExists) {
    return response.status(404).json({
      error: 'User not found.'
    });
  }

  return next();
}

app.post('/users', (request, response) => {
  const {
    name,
    username
  } = request.body;

  if (!name || !username) {
    return response.status(400).json({
      error: 'name and username are required'
    });
  }

  if (users.find(user => user.username === username)) {
    return response.status(400).json({
      error: 'Username already exists.'
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {
    username
  } = request.headers;

  const todos = users.find(user => user.username === username).todos;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    username
  } = request.headers;

  if (!username) {
    return response.status(400).json({
      error: 'username is required'
    });
  }

  const {
    title,
    deadline
  } = request.body;

  const user = users.find(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
    updated_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    username
  } = request.headers;

  if (!username) {
    return response.status(400).json({
      error: 'username is required'
    });
  }

  const {
    id
  } = request.params;

  const {
    title,
    deadline,
  } = request.body;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found.'
    });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);
  todo.updated_at = new Date();

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {
    username
  } = request.headers;

  if (!username) {
    return response.status(404).json({
      error: 'username is required'
    });
  }

  const {
    id
  } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found.'
    });
  }

  todo.done = !todo.done;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    username
  } = request.headers;

  if (!username) {
    return response.status(204).json({
      error: 'username is required'
    });
  }

  const {
    id
  } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found.'
    });
  }

  user.todos = user.todos.filter(todo => todo.id !== id);

  return response.status(204).json({
    message: 'Todo deleted.'
  });
});

module.exports = app;