import "./App.css";
import { ReactComponent as Logo } from "./logo.svg";
import { auth } from "./firebase-config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "./components/SignIn";
import UsernameChecker from "./components/UsernameChecker";
import ChatPage from "./components/ChatPage";
import UserMenu from "./components/UserMenu";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <Logo className="img" />
        <UserMenu user={user} />
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
