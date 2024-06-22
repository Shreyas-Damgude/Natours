const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = require(`${__dirname}/app`);

dotenv.config({ path: `${__dirname}/config.env` });

// Mongoose connection
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("Database Connection Successful"));

// Server listening
const port = process.env.PORT;
const server = app.listen(port, () =>
  console.log(`App is running on port ${port}...`)
);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
