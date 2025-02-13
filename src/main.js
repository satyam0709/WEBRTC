// import './style.css'


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import firebase from 'firebase/app';
// import 'firebase/firestore';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCfctX0JWFdQL6xF-5UnJxTdT5GnWgQ8sk",
//   authDomain: "webrtc-57fb4.firebaseapp.com",
//   projectId: "webrtc-57fb4",
//   storageBucket: "webrtc-57fb4.firebasestorage.app",
//   messagingSenderId: "287303706502",
//   appId: "1:287303706502:web:f2918e428129dd89bb6e07",
//   measurementId: "G-P5ZK8CKBZ6"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }
// const firestore = firebase.firestore();

// const servers = {
//   iceServers: [
//     {
//       urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
//     },
//   ],
//   iceCandidatePoolSize: 10,
// };

// // Global State
// const pc = new RTCPeerConnection(servers);
// let localStream = null;
// let remoteStream = null;

// // HTML elements
// const webcamButton = document.getElementById('webcamButton');
// const webcamVideo = document.getElementById('webcamVideo');
// const callButton = document.getElementById('callButton');
// const callInput = document.getElementById('callInput');
// const answerButton = document.getElementById('answerButton');
// const remoteVideo = document.getElementById('remoteVideo');
// const hangupButton = document.getElementById('hangupButton');

// // 1. Setup media sources

// webcamButton.onclick = async () => {
//   localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//   remoteStream = new MediaStream();

//   // Push tracks from local stream to peer connection
//   localStream.getTracks().forEach((track) => {
//     pc.addTrack(track, localStream);
//   });

//   // Pull tracks from remote stream, add to video stream
//   pc.ontrack = (event) => {
//     event.streams[0].getTracks().forEach((track) => {
//       remoteStream.addTrack(track);
//     });
//   };

//   webcamVideo.srcObject = localStream;
//   remoteVideo.srcObject = remoteStream;

//   callButton.disabled = false;
//   answerButton.disabled = false;
//   webcamButton.disabled = true;
// };

// // 2. Create an offer
// callButton.onclick = async () => {
//   // Reference Firestore collections for signaling
//   const callDoc = firestore.collection('calls').doc();
//   const offerCandidates = callDoc.collection('offerCandidates');
//   const answerCandidates = callDoc.collection('answerCandidates');

//   callInput.value = callDoc.id;

//   // Get candidates for caller, save to db
//   pc.onicecandidate = (event) => {
//     event.candidate && offerCandidates.add(event.candidate.toJSON());
//   };

//   // Create offer
//   const offerDescription = await pc.createOffer();
//   await pc.setLocalDescription(offerDescription);

//   const offer = {
//     sdp: offerDescription.sdp,
//     type: offerDescription.type,
//   };

//   await callDoc.set({ offer });

//   // Listen for remote answer
//   callDoc.onSnapshot((snapshot) => {
//     const data = snapshot.data();
//     if (!pc.currentRemoteDescription && data?.answer) {
//       const answerDescription = new RTCSessionDescription(data.answer);
//       pc.setRemoteDescription(answerDescription);
//     }
//   });

//   // When answered, add candidate to peer connection
//   answerCandidates.onSnapshot((snapshot) => {
//     snapshot.docChanges().forEach((change) => {
//       if (change.type === 'added') {
//         const candidate = new RTCIceCandidate(change.doc.data());
//         pc.addIceCandidate(candidate);
//       }
//     });
//   });

//   hangupButton.disabled = false;
// };

// // 3. Answer the call with the unique ID
// answerButton.onclick = async () => {
//   const callId = callInput.value;
//   const callDoc = firestore.collection('calls').doc(callId);
//   const answerCandidates = callDoc.collection('answerCandidates');
//   const offerCandidates = callDoc.collection('offerCandidates');

//   pc.onicecandidate = (event) => {
//     event.candidate && answerCandidates.add(event.candidate.toJSON());
//   };

//   const callData = (await callDoc.get()).data();

//   const offerDescription = callData.offer;
//   await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

//   const answerDescription = await pc.createAnswer();
//   await pc.setLocalDescription(answerDescription);

//   const answer = {
//     type: answerDescription.type,
//     sdp: answerDescription.sdp,
//   };

//   await callDoc.update({ answer });

//   offerCandidates.onSnapshot((snapshot) => {
//     snapshot.docChanges().forEach((change) => {
//       console.log(change);
//       if (change.type === 'added') {
//         let data = change.doc.data();
//         pc.addIceCandidate(new RTCIceCandidate(data));
//       }
//     });
//   });
// };




import './style.css';

// Import Firebase modules (v9+ syntax)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, onSnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfctX0JWFdQL6xF-5UnJxTdT5GnWgQ8sk",
  authDomain: "webrtc-57fb4.firebaseapp.com",
  projectId: "webrtc-57fb4",
  storageBucket: "webrtc-57fb4.firebasestorage.app",
  messagingSenderId: "287303706502",
  appId: "1:287303706502:web:f2918e428129dd89bb6e07",
  measurementId: "G-P5ZK8CKBZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

const servers = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
  iceCandidatePoolSize: 10,
};

// Global state
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = new MediaStream();

// HTML elements
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

// 1. Setup media sources
webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
  };

  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};

// 2. Create an offer
callButton.onclick = async () => {
  const callDoc = doc(collection(firestore, "calls"));
  await setDoc(callDoc, {});
  
  const offerCandidates = collection(callDoc, "offerCandidates");
  const answerCandidates = collection(callDoc, "answerCandidates");
  callInput.value = callDoc.id;

  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(offerCandidates, event.candidate.toJSON());
    }
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  await setDoc(callDoc, { offer: { sdp: offerDescription.sdp, type: offerDescription.type } });

  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    if (data?.answer && !pc.currentRemoteDescription) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });

  hangupButton.disabled = false;
};

// 3. Answer the call
answerButton.onclick = async () => {
  const callId = callInput.value;
  const callDoc = doc(firestore, "calls", callId);
  const answerCandidates = collection(callDoc, "answerCandidates");
  const offerCandidates = collection(callDoc, "offerCandidates");

  const callData = (await getDoc(callDoc)).data();
  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  await setDoc(callDoc, { answer: { sdp: answerDescription.sdp, type: answerDescription.type } }, { merge: true });

  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(answerCandidates, event.candidate.toJSON());
    }
  };

  onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
};
