const graphql = require('graphql');

const { 
    GraphQLObjectType,
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const Book = require('../models/book');
const Author = require('../models/author');

// Array data before mongoDB integration.
const books = [
    {name: 'Name of the wind', genre: 'Fantasy', id: '1', authorId: '1'},
    {name: 'Name of the wind -- The sequel', genre: 'Fantasy', id: '2', authorId: '1'},
    {name: 'Rick and Two Crows', genre: 'Fantasy', id: '3', authorId: '3'},
]

const authors = [
    {name: 'Bill Windmill', age: 52, id: '1'},
    {name: 'John Wick', age: 30, id: '2'},
    {name: 'Garbage Goober', age: 300, id: '3'},
]

// This defines the book field query
const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: GraphQLID },
        genre: { type: GraphQLString },
        name: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args) {
                // return authors.filter(x => x.id === parent.authorId)[0]
                return Author.findById(parent.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        book: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                // return books.filter(x => x.authorId === parent.id)
                return Book.find({ authorId: parent.id}); 
            }
        }
    })
})

// This defines our query
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        book: {
            type: BookType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                // return books.filter(x => x.id === args.id)[0];
                return Book.findById(args.id);
            }
        },

        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                // return authors.filter(x => x.id === args.id)[0];
                return Author.findById(args.id);
            }
        },

        books: {
            // GraphQLList records a type and expected to return an array
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                // return books;
                return Book.find({}); // implies return everything
            }
        },

        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                // return authors;
                return Author.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
            },
            resolve(parent, args) {
                // create new data with our imported mongoDB model
                let author = new Author({
                    name: args.name,
                    age: args.age
                });

                // save to DB by invoking save() of the model
                // return it so GraphQL can also return the added data to us
                return author.save();
            }
        },

        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                })

                return book.save();
            }
        }
    }
})

// Schema of the query, which will be exported
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})