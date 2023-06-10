import { auth } from "../firebase-config.js";

function SignOut() {
  return auth.signOut();
}

export default SignOut;
