import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";

import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";

import Auth from "../utils/auth";

const LoginForm = () => {
  // State to manage user form data, validation, and alerts
  const [userFormData, setUserFormData] = useState({ email: "", password: "" });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Use LOGIN_USER mutation from Apollo Client
  const [login, { error }] = useMutation(LOGIN_USER);

  // Effect to show alert if there's an error during login
  useEffect(() => {
    if (error) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [error]);

  // Function to handle changes in input fields
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // Function to handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      // Perform login mutation with userFormData
      const { data } = await login({
        variables: { ...userFormData },
      });

      console.log(data);
      
      // Login successful, set token in Auth and save to local storage
      Auth.login(data.login.token);
    } catch (err) {
      console.error(err);
      
    }

    // Clear form input fields after submission
    setUserFormData({
      email: "",
      password: "",
    });
  };

  return (
    <>
      {/* Login form using react-bootstrap components */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* Show alert for login errors */}
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant="danger"
        >
          Something went wrong with your login credentials!
        </Alert>
        {/* Email input */}
        <Form.Group className="mb-3"> 
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your email"
            name="email"
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type="invalid">
            Email is required!
          </Form.Control.Feedback>
        </Form.Group>
        {/* Password input */}
        <Form.Group className= "mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type="invalid">
            Password is required!
          </Form.Control.Feedback>
        </Form.Group>
        {/* Submit button */}
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
