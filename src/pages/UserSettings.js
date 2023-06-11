import React from "react";

function UserSettings({ onClose }) {
  // Add your UserSettings component code here
  return (
    <div>
      <h1>User Settings</h1>
      {/* Add the content of your UserSettings popup */}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default UserSettings;
