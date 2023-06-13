import "./App.css";
import { ReactComponent as Logo } from "./logo.svg";
import { auth, firestore } from "./firebase-config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState, useEffect, useRef } from "react";
import firebase from "firebase/compat/app";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as FcIcons from "react-icons/fc";
import { IconContext } from "react-icons";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { MdVerified } from "react-icons/md";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <Logo className="img" />
        <Navbar user={user} />
      </header>
      <section>{user ? <PublicChat /> : <SignIn />}</section>
    </div>
  );
}
function PublicChat() {
  const [user] = useAuthState(auth);

  return (
    <UsernameChecker user={user}>
      <ChatPage user={user} />
    </UsernameChecker>
  );
}
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button
        className="sign-in"
        style={{ position: "relative", margin: "0 auto" }}
        onClick={signInWithGoogle}
      >
        <FcIcons.FcGoogle />
        &nbsp;Sign in with Google
      </button>
      <footer style={{ marginTop: "50vh", textAlign: "center" }}>
        <button className="githubbtn">
          <a
            href="https://github.com/sameemul-haque/ConnectInChat/commits/master"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p>
              <FaIcons.FaGithub /> Github Code
            </p>
          </a>
        </button>
      </footer>
    </>
  );
}
function SignOut() {
  return auth.signOut();
}
function ChatPage({ user }) {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt");

  const [messages] = useCollectionData(query, { idField: "id" });
  const [usernames, setUsernames] = useState({});
  const [isVerified, setIsVerified] = useState([]);

  useEffect(() => {
    const fetchUsernames = async () => {
      const usernamesSnapshot = await firestore.collection("username").get();
      const usernamesData = {};
      const isVerifiedData = {};
      usernamesSnapshot.forEach((doc) => {
        const usernameData = doc.data();
        usernamesData[usernameData.uid] = usernameData.username;
        isVerifiedData[usernameData.uid] = usernameData.verified;
      });
      setUsernames(usernamesData);
      setIsVerified(isVerifiedData);
    };

    fetchUsernames();
  }, []);

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      readBy: [],
    });
    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (createdAt) => {
    if (!createdAt) return "";
    const messageTime = createdAt.toDate().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    return messageTime;
  };

  const formatMessageDate = (createdAt) => {
    if (!createdAt) return "";
    const currentDate = new Date().toLocaleDateString();
    const messageDate = createdAt.toDate().toLocaleDateString();

    if (currentDate === messageDate) {
      return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toLocaleDateString();

    if (yesterdayDate === messageDate) {
      return "Yesterday";
    }

    const options = { day: "numeric", month: "long", year: "numeric" };
    return createdAt.toDate().toLocaleDateString([], options);
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index) => {
            const messageClass =
              msg.uid === auth.currentUser.uid ? "sent" : "received";
            const messageTime = formatMessageTime(msg.createdAt);
            const messageDate = formatMessageDate(msg.createdAt);

            let showDate = false;
            if (index === 0) {
              showDate = true;
            } else {
              const previousMessage = messages[index - 1];
              const previousMessageDate = formatMessageDate(
                previousMessage.createdAt
              );
              if (messageDate !== previousMessageDate) {
                showDate = true;
              }
            }
            const isUserVerified = isVerified[msg.uid] === "true";
            return (
              <>
                {showDate && (
                  <div className="message-date">
                    <span>{messageDate}</span>
                  </div>
                )}
                <div
                  key={msg.id}
                  className={`message ${messageClass} ${
                    msg.readBy && msg.readBy.includes(auth.currentUser.uid)
                      ? "read"
                      : "unread"
                  }`}
                  onClick={() => {
                    if (
                      msg.readBy &&
                      !msg.readBy.includes(auth.currentUser.uid)
                    ) {
                      messagesRef.doc(msg.id).update({
                        readBy: firebase.firestore.FieldValue.arrayUnion(
                          auth.currentUser.uid
                        ),
                      });
                    }
                  }}
                >
                  <img src={msg.photoURL} alt="Profile" />
                  <div
                    className="msgbox"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div className="usernameandtime">
                      <div className="username">
                        {usernames[msg.uid]}{" "}
                        {isUserVerified && (
                          <MdVerified
                            style={{
                              color: "#007bff",
                              fontSize: "small",
                              paddingTop: 1,
                            }}
                            icon="material-symbols:verified"
                          />
                        )}
                      </div>
                      <div className="message-time">{messageTime}</div>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              </>
            );
          })}
        <div ref={dummy}></div>
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit" disabled={!formValue}>
          ➤
        </button>
      </form>
    </>
  );
}

function UsernameChecker({ user, children }) {
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    const checkUsername = async () => {
      const usernameSnapshot = await firestore
        .collection("username")
        .where("uid", "==", user.uid)
        .get();
      setHasUsername(!usernameSnapshot.empty);
    };

    checkUsername();
  }, [user.uid]);

  return hasUsername ? children : <UsernamePage user={user} />;
}

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
    await firestore.collection("username").doc(user.uid).set({
      uid: user.uid,
      username: lowercaseUsername,
      verified: "false",
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
const SidebarData = [
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
  },
];

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

function UserSettings({ onClose, user }) {
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value.toLowerCase());
  };

  const handleUpdateUsername = async () => {
    if (!newUsername) {
      setUsernameError("Please enter a username");
      return;
    }

    if (newUsername.length < 5 || newUsername.length > 11) {
      setUsernameError("Username must be between 5 and 11 characters long");
      return;
    }

    if (!/^[a-zA-Z0-9][a-zA-Z0-9._]*$/.test(newUsername)) {
      if (/^[._]/.test(newUsername)) {
        setUsernameError("Username cannot start with a dot or an underscore");
      } else {
        setUsernameError(
          "Username can only contain letters, numbers, dot, and underscore"
        );
      }
      return;
    }

    const lowercaseUsername = newUsername.toLowerCase();

    await firestore
      .collection("username")
      .doc(user.uid)
      .update({ username: lowercaseUsername });
    onClose();
    window.location.reload();
  };

  return (
    <div className="UserSettings">
      <p className="close-button-settings">
        <AiIcons.AiOutlineClose
          className="close-button-btn"
          onClick={onClose}
        />
      </p>
      <h1
        style={{
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        <span style={{ verticalAlign: "middle" }}>User Settings </span>
        <AiIcons.AiOutlineSetting style={{ verticalAlign: "middle" }} />
      </h1>
      <div className="username-input">
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
      </div>
      {/* <h2 style={{ textAlign: "center" }}>COMING SOON</h2> */}
    </div>
  );
}

export default App;
