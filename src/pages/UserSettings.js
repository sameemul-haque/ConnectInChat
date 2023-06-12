import React, { useState } from "react";
import * as AiIcons from "react-icons/ai";
import "../css/UserSettings.css";
import { firestore } from "../firebase-config";

function UserSettings({ onClose, user }) {
  // const [newUsername, setNewUsername] = useState("");
  // const [usernameError, setUsernameError] = useState("");

  // const handleUsernameChange = (e) => {
  //   setNewUsername(e.target.value.toLowerCase());
  // };

  // const handleUpdateUsername = async () => {
  //   if (!newUsername) {
  //     setUsernameError("Please enter a username");
  //     return;
  //   }

  //   if (newUsername.length < 5 || newUsername.length > 11) {
  //     setUsernameError("Username must be between 5 and 11 characters long");
  //     return;
  //   }

  //   if (!/^[a-zA-Z0-9][a-zA-Z0-9._]*$/.test(newUsername)) {
  //     if (/^[._]/.test(newUsername)) {
  //       setUsernameError("Username cannot start with a dot or an underscore");
  //     } else {
  //       setUsernameError(
  //         "Username can only contain letters, numbers, dot, and underscore"
  //       );
  //     }
  //     return;
  //   }

  //   const lowercaseUsername = newUsername.toLowerCase();

  //   const usernameSnapshot = await firestore
  //     .collection("username")
  //     .where("username", "==", lowercaseUsername)
  //     .get();

  //   if (!usernameSnapshot.empty) {
  //     setUsernameError("Username already exists");
  //     return;
  //   }

  //   await firestore
  //     .collection("username")
  //     .doc(user.uid)
  //     .update({ username: lowercaseUsername });
  //   onClose();
  // };

  return (
    <div className="UserSettings">
      <h1
        style={{
          textTransform: "uppercase",
          textAlign: "center",
          marginTop: "3rem",
        }}
      >
        User Settings
      </h1>
      {/* <div className="username-input">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={newUsername}
          onChange={handleUsernameChange}
        />
        {usernameError && <p className="error">{usernameError}</p>}{" "}
        <button className="savebtn" onClick={handleUpdateUsername}>
          <span>Update</span>
        </button>
      </div> */}
      <h2 style={{ textAlign: "center" }}>COMING SOON</h2>
      <AiIcons.AiOutlineClose
        className="close-button-settings"
        onClick={onClose}
      />
    </div>
  );
}

export default UserSettings;
