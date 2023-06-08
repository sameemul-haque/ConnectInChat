import "./App.css";
import SignIn from "./components/SignIn";
import SignOut from "./components/SignOut";
import UsernameChecker from "./components/UsernameChecker";
import ChatPage from "./components/ChatPage";
import { ReactComponent as Logo } from "./logo.svg";
import { auth } from "./firebase-config.js";
import { useAuthState } from "react-firebase-hooks/auth";

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

export default App;
