import { useState, useEffect } from "react";
import { GraphQLClient, gql } from "graphql-request";
import { useForm } from "react-hook-form";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

let getQuery = gql`
{
  books {
    name
    genre
    author {
      name
    }
  }

  authors {
    name
    id
    book {
      name
      genre
    }
  }
}
`;

const client = new GraphQLClient("http://localhost:4000/graphql", {
  headers: { authorization: "THIS_IS_SOME_TOKEN" },
});

function App() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const addBookSubmitHandler = (data) => {
    console.log(data);

    let addBookQuery = gql`
    mutation {
      addBook (name:"${data.book_name}", genre:"${data.book_genre}", authorId:"${data.book_author}") {
        author {
          id
          name
        }
        name
        genre
      }
    }`

    client.request(addBookQuery)
      .then((data) => {
        console.log('Book added:',data);
        setBooks(prevState => prevState.concat(data.addBook));
        setAuthors((prevState) => {
          let newAuthorList = prevState.slice();
          let foundIdx = prevState.findIndex(x => x.id === data.addBook.author.id);
          
          newAuthorList[foundIdx].book.push({
            name: data.addBook.name,
            genre: data.addBook.genre
          });
          console.log(newAuthorList)
          return newAuthorList
        })
      })
      .catch(err => console.log('Error: ', err.message))
  }

  useEffect(() => {
    // We can use GraphQLClient or extract the request function directly.
    // GraphQL Client allow us to setup our header, for authorization I guess.
    client.request(getQuery)
      .then((data) => {
        setBooks(data.books);
        setAuthors(data.authors);
      })
      .catch((err) => {
        console.log("Error: ", err.message);
      });
  }, []);

  return (
    <div className="container">
      <h1 className="h1">GraphQL Book Store App</h1>
      <form onSubmit={handleSubmit(addBookSubmitHandler)}>
        <h4 className="text-center underline">Add Your Book!</h4>
        <div className="form-group">
          <label htmlFor="book_name">Book Title</label>
          <input
            className="form-control"
            defaultValue="The Witcher"
            {...register("book_name", { required: "This field is required." })}
          />
          {errors.book_name && <span className='text-danger'>{errors.book_name.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="book_genre">Genre</label>
          <input
            className="form-control"
            defaultValue="Fantasy"
            {...register("book_genre", { required: "This field is required." })}
          />
          {errors.book_genre && <span className='text-danger'>{errors.book_genre.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="book_author">Author ID</label>
          <input
            className="form-control"
            defaultValue='6146ab6fbfe5d6160e305a86'
            {...register("book_author", {
              required: "This field is required.",
            })}
          />
          {errors.book_author && <span className='text-danger'>{errors.book_author.message}</span>}
        </div>

        <div className="form-group">
          <input type="checkbox" id="not-a-robot" />
          <label htmlFor="not-a-robot">I am not a robot</label>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Book
        </button>
      </form>

      <ul className="list-group">
        <h3>Books</h3>
        {books.map((x, idx) => (
          <li key={idx} className="list-group-item">
            Title: {x.name} | Genre: {x.genre} | Author: {x.author.name}
          </li>
        ))}
      </ul>

      <ul className="list-group">
        <h3>Authors</h3>
        {authors.map((x, idx) => (
          <li key={idx} className="list-group-item">
            Name: {x.name} | ID: {x.id}
            <p>Published Books</p>  

            <ul style={{marginTop: '3px'}}>
              {x.book.map((b, idx) => (
                <li key={idx}>
                  {b.name} ({b.genre})
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
