import React from 'react';

export const AuthContext = React.createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {}
});
