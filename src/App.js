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
import Swal from "sweetalert2";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { MdVerified } from "react-icons/md";
import Linkify from "react-linkify";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <Logo className="img" />
        <Navbar user={user} />
      </header>
      <section>{user ? <ChatHome /> : <SignIn />}</section>
    </div>
  );
}

function Preloader(props) {
  return <div id={props.load ? "preloader" : "preloader-none"}></div>;
}
function ChatHome() {
  const [user] = useAuthState(auth);
  const [load, upadateLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      upadateLoad(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <Preloader load={load} />
      <UsernameChecker user={user}>
        <SideChats />
        <PublicChat user={user} />
      </UsernameChecker>
    </>
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
        <button className="githubbtn" style={{marginRight:10}}>
          <a
            href="https://github.com/sameemul-haque/ConnectInChat/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p>
              <FaIcons.FaGithub /> Github Code
            </p>
          </a>
        </button>
        <button className="githubbtn" style={{marginLeft:10}}>
          <a
            href="https://sameemul-haque.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p>
              <FaIcons.FaGlobe /> Portfolio
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

function SideChats() {}

function PublicChat({ user }) {
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
    const messageData = {
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      readBy: [],
      id: '', // Add the 'id' field
    };
  
    const docRef = await messagesRef.add(messageData);
    
    // Update the 'id' field with the document ID
    await docRef.update({
      id: docRef.id,
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
  const getUsernameColor = (username) => {
    if (username === "ConnectInChat") {
      return {
        color: "#006acc",
        fontWeight: 750,
      };
    }
    return {
      color: "#555555",
    };
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
            const deleteMessage = async (messageId) => {
              try {
                await messagesRef.doc(messageId).delete();
              } catch (error) {
                console.error("Error deleting message:", error);
              }
            };

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
            const isUserVerified = isVerified[msg.uid] === true;
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
                        <span style={getUsernameColor(usernames[msg.uid])}>
                          {usernames[msg.uid]}
                        </span>
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
                      <div className="message-time">
                        {/* <AiIcons.AiOutlineMore className="moreicon" /> */}
                        {msg.uid === auth.currentUser.uid && (
                          <AiIcons.AiOutlineDelete
                          className="delete-button"
                          onClick={() => 
                            deleteMessage(msg.id)
                          } />
                        )}
                        {messageTime}
                      </div>
                    </div>
                    <Linkify>
                      <p>{msg.text}</p>
                    </Linkify>

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
      verified: false,
    });

    setUsernameError("");
    setUsernameSet(true);
  };

  if (usernameSet) {
    return <PublicChat user={user} />;
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
    title: "Portfolio",
    icon: <FaIcons.FaGlobe />,
    cName: "nav-text",
  },
  {
    title: "Github",
    icon: <FaIcons.FaGithub />,
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
  const reloadPage = () => window.location.reload();
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
                      }
                       else if (item.title === "Signout") {
                        SignOut();
                      }
                      else if (item.title === "Portfolio") {
                        window.location.href="https://sameemul-haque.vercel.app/"
                      }
                      else if (item.title === "Github") {
                        window.location.href="https://github.com/sameemul-haque/connectinchat"
                      }
                    }}
                  >
                    <div>
                      {item.icon}
                      <span className="navbar-span">{item.title}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </IconContext.Provider>
        {showSettings && (
          <div className="settings-popup">
            <UserSettings onClose={(toggleSettings, reloadPage)} user={user} />
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
    const usernameSnapshot = await firestore
      .collection("username")
      .where("username", "==", lowercaseUsername)
      .get();

    if (!usernameSnapshot.empty) {
      setUsernameError("Username already exists");
      return;
    }
    await firestore
      .collection("username")
      .doc(user.uid)
      .update({ username: lowercaseUsername });
    Swal.fire({
      titleText: "Your username has been updated successfully.",
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  const [toggleOn, setToggleOn] = useState(false);

  useEffect(() => {
    var verCheck = firestore.collection("username").doc(user.uid);
    verCheck.get().then((doc) => {
      var verValue = doc.data()["verified"];
      console.log("Verification:", verValue);
      setToggleOn(verValue);
    });
  }, [user.uid]);

  const handleToggleChange = () => {
    setToggleOn(!toggleOn);
  };
  const verificationUpdate = () => {
    firestore
      .collection("username")
      .doc(user.uid)
      .update({
        verified: toggleOn,
      })
      .then(() => {
        if (toggleOn === true) {
          Swal.fire({
            titleText:
              "Congratulations! Your verification process was successful.",
            icon: "success",
            confirmButtonText: "OK",
          });
        }
        if (toggleOn === false) {
          Swal.fire({
            titleText: "Verification mark removed.",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        console.log("Error updating toggle value:", error);
      });
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
      <div className="settings-box">
        <input
          type="text"
          id="username"
          value={newUsername}
          onChange={handleUsernameChange}
          placeholder="Username"
        />
        {usernameError && <p className="error">{usernameError}</p>}{" "}
        <button className="savebtn" onClick={handleUpdateUsername}>
          <span>Update</span>
        </button>
      </div>
      <div className="settings-box">
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="ver-mark-span">Verification</span>
          <div class="toggler">
            <input
              id="toggler-1"
              name="toggler-1"
              type="checkbox"
              value="1"
              checked={toggleOn}
              onChange={handleToggleChange}
            />
            <label for="toggler-1">
              <svg
                class="toggler-on"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 130.2 130.2"
              >
                <polyline
                  class="path check"
                  points="100.2,40.2 51.5,88.8 29.8,67.5"
                ></polyline>
              </svg>
              <svg
                class="toggler-off"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 130.2 130.2"
              >
                <line
                  class="path line"
                  x1="34.4"
                  y1="34.4"
                  x2="95.8"
                  y2="95.8"
                ></line>
                <line
                  class="path line"
                  x1="95.8"
                  y1="34.4"
                  x2="34.4"
                  y2="95.8"
                ></line>
              </svg>
            </label>
          </div>
        </div>
        <button className="savebtn" onClick={verificationUpdate}>
          <span>Update</span>
        </button>
      </div>
    </div>
  );
}

export default App;
