import "./App.css";
import firebase from "firebase/compat/app";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ReactComponent as Logo } from "./logo.svg";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Icon } from "@iconify/react";
import { auth } from "./firebase-config.js";
import { firestore } from "./firebase-config";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <Logo className="img" />
        <SignOut />
      </header>
      <section>
        {user ? (
          <UsernameChecker user={user}>
            <ChatPage user={user} />
          </UsernameChecker>
        ) : (
          <SignIn />
        )}
      </section>
    </div>
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
        <Icon icon="devicon:google" />
        &nbsp;Sign in with Google
      </button>
      <footer style={{ marginTop: "50vh", textAlign: "center" }}>
        <button className="githubbtn">
          {" "}
          <a
            href="https://github.com/sameemul-haque/ConnectInChat/commits/master"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="githubtext">Github</span>{" "}
          </a>
        </button>
      </footer>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
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

function ChatPage({ user }) {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt");

  const [messages] = useCollectionData(query, { idField: "id" });
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const usernamesSnapshot = await firestore.collection("username").get();
      const usernamesData = {};
      usernamesSnapshot.forEach((doc) => {
        const usernameData = doc.data();
        usernamesData[usernameData.uid] = usernameData.username;
      });
      setUsernames(usernamesData);
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
                        <Icon
                          style={{
                            color: "#007bff",
                            fontSize: "small",
                            paddingTop: 1,
                          }}
                          icon="material-symbols:verified"
                        />
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

export default App;
