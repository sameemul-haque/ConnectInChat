import "./App.css";
import firebase from "firebase/compat/app";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ReactComponent as Logo } from "./logo.svg";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FcGoogle } from "react-icons/fc";
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
        <FcGoogle />
        &nbsp;Sign in with Google
      </button>
      <footer style={{ marginTop: "50vh", textAlign: "center" }}>
        <a
          href="https://sameemul-haque.web.app"
          target="_blank"
          rel="noopener noreferrer"
          className="portfolio-button"
        >
          My Portfolio
        </a>
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

    if (username.length < 5) {
      setUsernameError("Username must be at least 5 characters");
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

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => {
            const messageClass =
              msg.uid === auth.currentUser.uid ? "sent" : "received";
            const messageTime =
              msg.createdAt && msg.createdAt.toDate().toLocaleTimeString();
            return (
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
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="username">{usernames[msg.uid]}</div>
                  <p>{msg.text}</p>
                  <p className="message-time">{messageTime}</p>
                </div>
              </div>
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
