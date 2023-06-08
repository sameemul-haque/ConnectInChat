import ChatPage from "./ChatPage";
import { useState } from "react";
import { firestore } from "../firebase-config";

function UsernamePage({ user }) {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSet, setUsernameSet] = useState(false);
  const updateUsername = async () => {
    if (!username) {
      setUsernameError("Please enter your username");
      return;
    }

    if (username.length < 5 || username.length > 11) {
      setUsernameError("Username must be between 5 and 11 characters long");
      return;
    }

    if (!/^[a-zA-Z0-9][a-zA-Z0-9._]*$/.test(username)) {
      if (/^[._]/.test(username)) {
        setUsernameError("Username cannot start with a dot or an underscore");
      } else {
        setUsernameError(
          "Username can only contain letters, numbers, dot, and underscore"
        );
      }
      return;
    }

    const lowercaseUsername = username.toLowerCase();

    const usernameSnapshot = await firestore
      .collection("username")
      .where("username", "==", lowercaseUsername)
      .get();

    if (!usernameSnapshot.empty) {
      setUsernameError("Username already exists");
      return;
    }

    await firestore.collection("username").doc().set({
      uid: user.uid,
      username: lowercaseUsername,
    });

    setUsernameError("");
    setUsernameSet(true);
  };

  if (usernameSet) {
    return <ChatPage user={user} />;
  }

  return (
    <div className="username-page">
      {usernameError ? (
        <div className="username-popup">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ textTransform: "lowercase" }}
          />
          <button className="savebtn" onClick={updateUsername}>
            Save
          </button>
          <p style={{ color: "#ffffff" }}>{usernameError}</p>
        </div>
      ) : (
        <div className="username-popup">
          <p style={{ color: "#ffffff" }}>Welcome, {user.displayName}!</p>
          <p style={{ color: "#ffffff" }}>
            Please enter your username to continue:
          </p>
          <input
            type="text"
            value={username}
            style={{ textTransform: "lowercase" }}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="savebtn" onClick={updateUsername}>
            <span>Save</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UsernamePage;
