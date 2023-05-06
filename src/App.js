import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState, useSignInWithGoogle} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyC0EeYEz6RcXogSKMzGXNqLbN_JUWp1iYA",
  authDomain: "connectinchat.firebaseapp.com",
  projectId: "connectinchat",
  storageBucket: "connectinchat.appspot.com",
  messagingSenderId: "1001698473625",
  appId: "1:1001698473625:web:f04ffb3ba64cd8720b6a08",
  measurementId: "G-86DBDW9R4M"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

const [user] = useAuthState(auth);

function App() {
  return (
    <div className="App">
      <header className="App-header">

      </header>
      <section>
        {user ? <ChatPage />:<SignIn />}
      </section>
    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  
  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}>Sign Out</button>
  )
}

function ChatPage(){

}

export default App;
