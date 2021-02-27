const express = require('express');
const app = express();
const connectDb = require('./config/db');

connectDb();

app.get('/', (req, res) => {
    res.send("Main Page");
});

app.use(express.json({extended: false}));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));