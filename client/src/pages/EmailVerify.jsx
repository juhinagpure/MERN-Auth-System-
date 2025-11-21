import axios from "axios";
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ FIXED
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const navigate = useNavigate(); // ✅ FIXED
  const { backendUrl, getUserData, isLoggedin, userData } =
    useContext(AppContext);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value.length === 0 && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    paste.split("").forEach((char, idx) => {
      if (inputRefs.current[idx]) {
        inputRefs.current[idx].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const otp = inputRefs.current.map((el) => el.value).join("");

      console.log("OTP Sent:", otp); // 🔍 Debug line

      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/"); // ✅ FIXED
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    isLoggedin && userData.isAccountVerified && navigate("/"); // ✅ FIXED
  }, [isLoggedin, userData]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400 relative">
      <img
        onClick={() => navigate("/")} // ✅ FIXED
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>

        <p className="text-center mb-6 text-indigo-500">
          Enter the 6-digit code sent to your email id.
        </p>

        <div className="flex justify-between mb-8">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
              />
            ))}
        </div>

        <button className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
          Submit
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
