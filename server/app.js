const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*'
}))

// bind express with graphql
mongoose.connect('mongodb+srv://admin:admin123@cluster0.q0vmj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
mongoose.connection.once('open', () => {
    console.log('connected to mongoDB database.')
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

app.use('/', (req, res) => {
    res.status(200).redirect(301, '/graphql')
})

app.listen(4000, () => {
    console.log('now listening for requests on port 4000');
});
