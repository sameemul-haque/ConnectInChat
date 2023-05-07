import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useRef } from 'react';
import { useState } from 'react';
import { ReactComponent as Logo } from './logo.svg';
import {useAuthState, useSignInWithGoogle} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { FcGoogle } from "react-icons/fc";

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


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      <Logo className='img'/>
        
        <SignOut />
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
    <button className="sign-in" style={{position:"relative",margin: "0 auto"}} onClick={signInWithGoogle}><FcGoogle/>&nbsp;Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className="sign-out" onClick={()=>auth.signOut()}>Sign Out</button>
  )
}

function ChatPage(){

  const dummy = useRef() 

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {console.log('HELLO WORDL')
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue(''); 

    dummy.current.scrollIntoView({ behavior: 'smooth'});
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='Enter your message' />
        <button type="submit" disabled={!formValue}>➤</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent': 'received';

  return(
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="Profile" />
      <p>{text}</p>
    </div>
  )
}


export default App;
