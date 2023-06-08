import firebase from "firebase/compat/app";
import { Icon } from "@iconify/react";
import { auth } from "../firebase-config.js";

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

export default SignIn;
