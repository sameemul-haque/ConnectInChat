import firebase from "firebase/compat/app";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { MdVerified } from "react-icons/md";
import { auth } from "../firebase-config.js";
import { firestore } from "../firebase-config";

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

export default ChatPage;
