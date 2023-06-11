import React from "react";
import * as AiIcons from "react-icons/ai";
import "../css/UserSettings.css";

function UserSettings({ onClose }) {
  // Add your UserSettings component code here
  return (
    <div className="UserSettings">
      <h1 style={{ textAlign: "center", marginTop: "3rem" }}>User Settings</h1>
      {/* Add the content of your UserSettings popup */}
      <AiIcons.AiOutlineClose
        className="close-button-settings"
        onClick={onClose}
      />
    </div>
  );
}

export default UserSettings;
