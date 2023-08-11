const express = require("express");
const knex = require("knex");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const app = express();
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
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

let limit = 10;
let newData = [];
let newRecords = [];
app.get("/", async (req, res) => {
  try {
    for (let skip = 0; skip <= 150; skip += 10) {
      await fetch(`https://dummyjson.com/todos?limit=${limit}&skip=${skip}`)
        .then(async (response) => {
          let data = await response.json();
          newData.push(data.todos);
        })
        .catch((error) => {
          res.send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            data: error,
          });
        });
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

    Promise.all(insertPromises)
      .then(async (response) => {
        await db.from("todolist").then((data) => {
          res.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: data,
          });
        });
      })
      .catch((error) => {
        console.log("API response error", error);
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          data: error,
        });
      });
  } catch (error) {
    console.log("Catch error", error);
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: [],
    });
  }
});
