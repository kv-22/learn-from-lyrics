import { auth } from "./firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return { user, error: null };
    } catch (error) {
        console.log(error);
        return { user: null, error }; 
    }
}

export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return { user, error: null };
        
    } catch (error) {
        console.log(error.code);
        console.log(error.message);
        return { user: null, error };
        
    }
}