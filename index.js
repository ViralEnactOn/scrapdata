const knex = require("knex");
const knexConfig = {
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "knexdb",
  },
};
const db = knex(knexConfig);

const fetchData = async (limit, skip) => {
  try {
    const response = await fetch(
      `https://dummyjson.com/todos?limit=${limit}&skip=${skip}`
    );
    const data = await response.json();
    return data.todos;
  } catch (error) {
    console.log({ error });
    return [];
  }
};

const insertData = async () => {
  try {
    let limit = 10;
    let skip = 0;
    let newData = [];
    let newRecords = [];

    while (true) {
      const data = await fetchData(limit, skip);

      if (data.length === 0) {
        break;
      }

      newData.push(data);
      skip += limit;
    }

    newRecords = newData.flat();

    const insertPromises = newRecords.map(async (item, index) => {
      await db("todolist").insert({
        id: item.id,
        todo: item.todo,
        completed: item.completed,
        userId: item.userId,
      });
    });

    await Promise.all(insertPromises);

    const insertedData = await db.from("todolist");
    console.log({ insertedData });
  } catch (error) {
    console.log("Catch error", error);
  }
};

insertData();
