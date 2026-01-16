import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Smart Garbage Management System Backend is running.');
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});