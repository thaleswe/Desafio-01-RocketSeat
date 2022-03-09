const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const req = require('express/lib/request');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => {return user.username === username});

  if(!user) {
    return response.status(400).json({error: "User not found."})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => {return user.username === username});

  if(userAlreadyExists) {
    return response.status(400).json({"error": "User already exists"})
  };

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
  const { user } = request;
  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline + " 00:00"),
    create_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, function(request, response) {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => {return todo.id === id});

  if(!todo) {
    return response.status(404).json({error: "To do not found."})
  }

  todo.title = title;
  todo.deadline = new Date(deadline + " 00:00");

  return response.status(200).send();
});


app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => {return todo.id === id});

  if(!todo) {
    return response.status(404).json({error: "To do not found"});
  };

  todo.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoPos = user.todos.findIndex((todo) => {return todo.id === id});


  if(todoPos === -1) {
    return response.status(404).json({error: "To do not found"});
  };


  user.todos.splice(todoPos, 1);

  return response.status(204).send();
});

module.exports = app;