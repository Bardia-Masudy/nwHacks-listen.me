import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            console.error("Login failed", err);
            // Friendly error message for missing config
            if (err.code === 'auth/invalid-api-key') {
                setError("Firebase setup incomplete. Please add your API keys.");
            } else if (err.code === 'auth/operation-not-allowed') {
                setError("Google Sign-In is disabled. Enable it in Firebase Console > Authentication > Sign-in method.");
            } else {
                setError(`Failed to sign in: ${err.message} (${err.code})`);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">

            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Anomia Aid</h2>
            <p className="text-slate-500 mb-8 max-w-sm">
                Sign in to save your history and track your progress across all your devices.
            </p>

            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-full transition-all shadow-sm hover:shadow-md"
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                />
                Continue with Google
            </button>
        </div>
    );
};

export default Login;
