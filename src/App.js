import "./App.css";
import { ReactComponent as Logo } from "./logo.svg";
import { auth } from "./firebase-config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "./components/SignIn";
import Navbar from "./components/Navbar";
import PublicChat from "./pages/PublicChat";

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

export default App;
