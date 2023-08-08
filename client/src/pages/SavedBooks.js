import React from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
//import 'auth' setup
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";
// needed to refractor GraphQL API
import { useQuery, useMutation } from "@apollo/client";
import { REMOVE_BOOK } from "../utils/mutations";
import { GET_ME } from "../utils/queries";

//updated
const SavedBooks = () => {
  //get user's data
  const { loading, data } = useQuery(GET_ME);
  //setup mutation
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const userData = data?.me || {};

  // function to delete book from database
  const handleDeleteBook = async (bookId) => {
    //check for token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    // if no token
    if (!token) {
      return false;
    }

    // Code updated

    try {
      //try to remove book
      const { data } = await removeBook({
        variables: {
          bookId,
        },
      });

      // remove book from localstorage
      removeBookId(bookId);
    } catch (err) {
      // show errors here
      console.error(err);
    }
  };

  //if we are still waiting for data
  //Show:
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  //return with user's saved books
  return (
    <>
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <div>
          <Row>
            {userData.savedBooks?.map((book) => {
              return (
                <Col md="4">
                  <Card key={book.bookId} border="dark">
                    {book.image ? (
                      <Card.Img
                        src={book.image}
                        alt={`The cover for ${book.title}`}
                        variant="top"
                      />
                    ) : null}
                    <Card.Body>
                      <Card.Title>{book.title}</Card.Title>
                      <p className="small">
                        Authors: {book.authors.join(", ")}
                      </p>
                      <Card.Text>{book.description}</Card.Text>
                      <Button
                        className="btn-block btn-danger"
                        onClick={() => handleDeleteBook(book.bookId)}
                      >
                        Delete this Book!
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </Container>
    </>
  );
};

export default SavedBooks;