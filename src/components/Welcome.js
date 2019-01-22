import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

const Welcome = () => {
  return (
    <div>
      <p>Welcome</p>

      <Link to="/register">
        <Button>Register</Button>
      </Link>

      <Link to="/login">
        <Button>Login</Button>
      </Link>
    </div>
  );
};

export default Welcome;
