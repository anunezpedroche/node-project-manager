// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React, { useState } from "react";
import { logIn, whoAmI, imLogged } from "../../Helpers/auth-helpers";
import { Redirect, Route } from "react-router-dom";

import { connect } from "react-redux";

import { readUser } from "../../Redux/Reducers/UserReducer";
import { logOutUser } from "../../Redux/Actions/UserActions";
import { logout as deleteCookie } from "../../Helpers/auth-helpers";
import { useEffect } from "react";

const PrivateRoute = ({ component: Component, user, logOutUser,...rest }) => {
  // Add your own authentication on the below line.

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log(Component);
    (async () => {
      const authUser = await imLogged();
      
      console.log(authUser);
      if (!authUser.auth) {
        deleteCookie();
        logOutUser();
        console.log("user",user);
        console.log("patata");
      }
      setIsLoggedIn(Boolean(authUser.auth));
      console.log(isLoggedIn);
      setLoading(false);
      
    })();
    /*return () => { 
      setIsLoggedIn(false);
      //setLoading(true);
    } */  
  },[Component]);

  return (
    <Route
      {...rest}
      render={(props) =>
        loading ? "": 
        isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const mapStateToProps = (state) => {
  return { user: readUser(state) };
};

export default connect(mapStateToProps, { logOutUser })(PrivateRoute);