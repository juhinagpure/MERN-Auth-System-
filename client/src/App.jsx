import { Route, Routes } from "react-router-dom";
import EmailVerify from "./pages/EmailVerify";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/Reset-Password" element={<ResetPassword />} />
      </Routes>
    </div>
  );
};

export default App;
