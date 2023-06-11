import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { auth } from "../firebase-config.js";
import { IconContext } from "react-icons";

function UserSettings() {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    auth.currentUser && (
      <>
        <IconContext.Provider value={{ color: "#fff" }}>
          <div className="navbar" onClick={showSidebar}>
            <div className="menu-bars">
              <FaIcons.FaBars />
            </div>
          </div>
          <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
            <ul className="nav-menu-items" onClick={showSidebar}>
              <li className="navbar-toggle">
                <div className="menu-bars">
                  <AiIcons.AiOutlineClose />
                </div>
              </li>
              return (
              <li>
                <div>
                  <AiIcons.AiOutlineClose />
                  <span>sample title</span>
                </div>
              </li>
              );
            </ul>
          </nav>
        </IconContext.Provider>
      </>
    )
  );
}

export default UserSettings;
