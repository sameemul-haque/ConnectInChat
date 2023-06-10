import firebase from "firebase/compat/app";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
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
        <FcGoogle />
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
              <FaGithub /> Github Code
            </p>
          </a>
        </button>
      </footer>
    </>
  );
}

export default SignIn;
