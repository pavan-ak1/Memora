import { useRef, useState } from "react";
import { Button } from "../components/Buttons";
import { Input } from "../components/Input";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { NavBar } from "../components/NavBar";
import { useNavigate } from "react-router-dom";

interface SignupProps {
  onSwitchToSignin: () => void;
}

export function Signup({ onSwitchToSignin }: SignupProps) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function signup() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;
    
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
        username,
        password,
      });
      navigate("/signin");
    } catch (err: any) {
      console.error("Signup Error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "An error occurred during signup";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <NavBar />
      <div className="pt-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-purple-100 transform transition-all duration-300 card-hover">
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Start building your Memora</p>
          </div>

          <form onSubmit={e => e.preventDefault()} className="space-y-6">
            <div className="space-y-4">
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <Input 
                  placeholder="Choose a username" 
                  ref={usernameRef}
                  className="input-focus"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Input 
                  placeholder="Create a password" 
                  type="password" 
                  ref={passwordRef}
                  className="input-focus"
                  onKeyDown={(e) => e.key === 'Enter' && signup()}
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
                text={isLoading ? 'Creating Account...' : 'Sign Up'}
                onClick={signup}
                startIcon={<></>}
                fullWidth
                className="btn-hover-scale shadow-lg"
                disabled={isLoading}
              />
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="inline">Already have an account? </p>
            <button
              type="button"
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-1.5 py-0.5 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToSignin();
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
