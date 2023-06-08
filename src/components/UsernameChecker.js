import { useState } from "react";
import { useEffect } from "react";
import { firestore } from "../firebase-config";
import UsernamePage from "./UsernamePage";

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

export default UsernameChecker;
