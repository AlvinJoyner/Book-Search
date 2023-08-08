// Import necessary modules and components from React and react-router-dom
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// Import necessary modules from Apollo Client
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Import components for different pages
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';

// Create a HTTP link for GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql',
});

// Create an auth link to include the authorization token in the request headers
const authLink = setContext((_, { headers }) => {
  // Get the token from the local storage
  const token = localStorage.getItem('id_token');

  // Add the token to the request headers if it exists
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create an Apollo Client instance with the authLink and httpLink
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Define the main App component
function App() {
  return (
    // Wrap the entire app with ApolloProvider to connect to the Apollo Client
    <ApolloProvider client={client}>
      {/* Define the main router using react-router-dom */}
      <Router>
        {/* Use React fragments to group multiple elements without adding an extra node to the DOM */}
        <>
          {/* Include the Navbar component at the top of the app */}
          <Navbar />
          {/* Define routes for different pages */}
          {/* - "/" route corresponds to the SearchBooks page */}
          {/* - "/saved" route corresponds to the SavedBooks page */}
          {/* - "*" route corresponds to a fallback page for wrong URLs */}
          <Route path="/" element={<SearchBooks />} />
          <Route path="/saved" element={<SavedBooks />} />
          <Route path="*" element={<h1 className="display-2">Wrong page!</h1>} />
        </>
      </Router>
    </ApolloProvider>
  );
}

// Export the App component as the default export
export default App;
