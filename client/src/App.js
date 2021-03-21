import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/layouts/navbar";
import Landing from "./components/layouts/landing";
import Register from "./components/auth/register";
import Login from "./components/auth/login";
import "./App.css";
import Dashboard from "./components/dashboard/dashboard";
import PrivateRoute from "./components/routing/privateRoutes";
import createProfile from "./components/profile-forms/createProfile";
import AddExperience from "./components/profile-forms/addExperience";
import AddEducation from "./components/profile-forms/addEducation";
//Redux
import { Provider } from "react-redux";
import store from "./store";
import Alert from "./components/layouts/alert";
import { loadUser } from "./actions/auth";
import setAuthToken from "./utils/setAuthToken";
import EditProfile from "./components/profile-forms/editProfile";

if (localStorage.token) setAuthToken(localStorage.token);

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path="/" component={Landing} />
          <section className="container">
            <Alert />
            <Switch>
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <PrivateRoute path="/create-profile" component={createProfile} />
              <PrivateRoute path="/edit-profile" component={EditProfile} />
              <PrivateRoute path="/add-experience" component={AddExperience} />
              <PrivateRoute path="/add-education" component={AddEducation} />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;
