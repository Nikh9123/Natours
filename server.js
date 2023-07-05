const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION ❌❌❌. SHUTTING DOWN....');
  console.log(err.name , err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Db connection successful !!!');
  });

const port = process.env.port || 3000;

const server = app.listen(port, () => {
  console.log(`app running on prt no ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED ERROR ❌❌❌. SHUTTING DOWN....');
  console.log(err.name , err.message);
  server.close(() => {
    process.exit(1);
  });
});

