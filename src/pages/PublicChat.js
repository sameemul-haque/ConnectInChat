import { auth } from "../firebase-config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import UsernameChecker from "../components/UsernameChecker";
import ChatPage from "../components/ChatPage";

function PublicChat() {
  const [user] = useAuthState(auth);

  return (
    <UsernameChecker user={user}>
      <ChatPage user={user} />
    </UsernameChecker>
  );
}

export default PublicChat;
