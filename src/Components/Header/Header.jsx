import React from "react";
import Profile from "../Profile/Profile";
import "./Header.css";
import icon from "../../img/laseniat.png";
import Nav from "../Nav/Nav";

const Header = () => {

  return (
    <React.Fragment>    
        <div className="homeTitle">
        <div className="profileIcon">
          <img alt="" className="iconTitle" src={icon} />
        </div>
        <div className="profileTitle">FCT Project Manager : Beta</div>
        <div className="profileHome">
          <Profile />
        </div>
      </div>
      <Nav />
    </React.Fragment>
 
  );
};

export default Header;