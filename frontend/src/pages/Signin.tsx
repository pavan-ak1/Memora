import { Button } from "../components/Buttons";
import { Input } from "../components/Input";
import { useRef, useState } from "react";
import { NavBar } from "../components/NavBar";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";




export function Signin({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");

 async function signin() {
  const username = usernameRef.current?.value;
  const password = passwordRef.current?.value;

  try {
    const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
      username,
      password,
    });

    const jwt = response.data.token;
    localStorage.setItem("token", jwt);

    // Redirect back to original share link (if exists), else go to dashboard
    const redirectTo = localStorage.getItem("redirectAfterLogin") || "/dashboard";
    localStorage.removeItem("redirectAfterLogin");
    navigate(redirectTo);
    
  } catch (err: any) {
    console.error("Signin Error:", err);
    const msg =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Unknown error";
    setError(msg);
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <NavBar />
      <div className="pt-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-purple-100 transform transition-all duration-300 card-hover">
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to access your Memora</p>
          </div>

          <form onSubmit={e => e.preventDefault()} className="space-y-6">
            <div className="space-y-4">
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <Input 
                  placeholder="Enter your username" 
                  ref={usernameRef}
                  className="input-focus"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Input 
                  placeholder="Enter your password" 
                  type="password" 
                  ref={passwordRef}
                  className="input-focus"
                  onKeyDown={(e) => e.key === 'Enter' && signin()}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md animate-shake">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button
                variant="primary"
                text="Sign In"
                onClick={signin}
                startIcon={<></>}
                fullWidth
                className="btn-hover-scale shadow-lg"
              />
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="inline">Don't have an account? </p>
            <button
              type="button"
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-1.5 py-0.5 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToSignup();
              }}
            >
              Sign up now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


