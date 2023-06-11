import React from "react";
import * as FaIcons from "react-icons/fa";
import SignOut from "../components/SignOut";
import UserSettings from "../pages/UserSettings";

export const SidebarData = [
  {
    title: "Messages",
    icon: <FaIcons.FaEnvelopeOpenText />,
    cName: "nav-text",
  },
  {
    title: "Settings",
    icon: <FaIcons.FaUserCog />,
    cName: "nav-text",
  },
  {
    title: "Signout",
    icon: <FaIcons.FaSignOutAlt />,
    cName: "nav-text",
    cFunction: SignOut,
  },
];
