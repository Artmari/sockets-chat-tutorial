const users = [];

const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: 'username and room are required',
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use!',
    };
  }

  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

addUser({
  id: 22,
  username: 'SomeName ',
  room: ' room1',
});

console.log(users);

const res = addUser({
  id: 33,
  username: '',
  room: '',
});

console.log(res);

