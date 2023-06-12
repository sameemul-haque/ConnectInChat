import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./Sidebar";
import "../css/Navbar.css";
import { auth } from "../firebase-config.js";
import { IconContext } from "react-icons";
import UserSettings from "../pages/UserSettings";
import SignOut from "../components/SignOut";

function Navbar({ user }) {
  const [sidebar, setSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);
  const toggleSettings = () => setShowSettings(!showSettings);

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
              {SidebarData.map((item, index) => {
                return (
                  <li
                    key={index}
                    className={item.cName}
                    onClick={() => {
                      if (item.title === "Settings") {
                        toggleSettings();
                      } else if (item.title === "Signout") {
                        SignOut();
                      }
                    }}
                  >
                    <div>
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </IconContext.Provider>
        {showSettings && (
          <div className="settings-popup">
            <UserSettings onClose={toggleSettings} user={user} />
          </div>
        )}
      </>
    )
  );
}

export default Navbar;
