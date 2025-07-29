import { Dashboard } from "./pages/dashboard";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { SharedBrain } from "./pages/SharedBrain";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SigninWrapper />} />
        <Route path="/signup" element={<SignupWrapper />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<SigninWrapper />} />
        <Route path="/shared/:shareLink" element={<SharedBrain />} />


      </Routes>
    </Router>
  );
}

function SigninWrapper() {
  const navigate = useNavigate();
  return <Signin onSwitchToSignup={() => navigate("/signup")} />;
}

function SignupWrapper() {
  const navigate = useNavigate();
  return <Signup onSwitchToSignin={() => navigate("/signin")} />;
}

export default App;
