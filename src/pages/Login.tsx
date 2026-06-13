import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [input, setInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setOtpSent(true);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Default mock OTP is 1234
    if (otp === '1234' || otp.length === 4) {
      localStorage.setItem('user_token', input);
      localStorage.setItem('user_name', input.split('@')[0]);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('userLogin'));
      navigate('/');
    } else {
      alert("Please enter a valid 4-digit OTP (e.g. 1234)");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await login();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] pt-[100px] flex justify-center px-4">
      <div className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] rounded-[2px] flex flex-col md:flex-row w-full max-w-[850px] overflow-hidden min-h-[500px]">
        {/* Left Side */}
        <div className="bg-[#2874f0] w-full md:w-[40%] p-[40px] text-white flex flex-col justify-between">
          <div>
            <h1 className="text-[28px] font-semibold mb-4">{otpSent ? 'Enter OTP' : 'Login'}</h1>
            <p className="text-[18px] text-[#dbe8f9] leading-relaxed">
              {otpSent ? 'Please enter the OTP sent to your mobile number or email.' : 'Get access to your Orders, Wishlist and Recommendations'}
            </p>
          </div>
          <div className="mt-10 self-center hidden md:block">
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" alt="login" />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-[60%] p-[40px] pt-[50px] relative">
          {!otpSent ? (
             <form onSubmit={handleContinue} className="flex flex-col h-full">
                <div className="relative mb-6">
                  <input
                    type="text"
                    required
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full border-b border-[#e0e0e0] pb-2 text-[15px] outline-none focus:border-[#2874f0] transition-colors peer bg-transparent"
                    placeholder=" "
                  />
                  <label className={`absolute left-0 text-[#878787] pointer-events-none transition-all duration-200 ${input ? '-top-4 text-[12px]' : 'top-0 text-[15px] peer-focus:-top-4 peer-focus:text-[12px]'}`}>
                    Enter Email/Mobile number
                  </label>
                </div>
                
                <p className="text-[#878787] text-[12px] mt-4 mb-4 text-left">
                  By continuing, you agree to Flipkart's <span className="text-[#2874f0] cursor-pointer font-medium hover:underline">Terms of Use</span> and <span className="text-[#2874f0] cursor-pointer font-medium hover:underline">Privacy Policy</span>.
                </p>

                <button type="submit" className="w-full bg-[#fb641b] text-white font-semibold py-3.5 shadow-sm rounded-[2px] text-[15px] hover:bg-[#f35b13] cursor-pointer mt-4">
                  Request OTP
                </button>

                <div className="flex items-center my-6">
                  <div className="flex-1 h-[1px] bg-[#e0e0e0]"></div>
                  <div className="px-4 text-[13px] text-[#878787] font-semibold">OR</div>
                  <div className="flex-1 h-[1px] bg-[#e0e0e0]"></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white text-[#212121] font-semibold py-3.5 shadow-sm rounded-[2px] text-[15px] border border-[#e0e0e0] hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
                  {loading ? 'Logging in...' : 'Sign in with Google'}
                </button>
             </form>
          ) : (
             <form onSubmit={handleVerify} className="flex flex-col h-full">
                 <p className="text-[13px] text-[#878787] mb-6">
                   Please enter the OTP sent to <span className="text-black font-semibold">{input}</span>. <span className="text-[#2874f0] font-semibold cursor-pointer" onClick={() => setOtpSent(false)}>Change</span>
                 </p>

                 <div className="flex gap-4 justify-center mb-8">
                   <input 
                     type="text" 
                     maxLength={4}
                     value={otp}
                     onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                     placeholder="Enter 4-digit OTP"
                     className="w-full text-center border-b-2 border-[#e0e0e0] focus:border-[#2874f0] outline-none text-xl tracking-widest pb-2 font-mono bg-transparent"
                     autoFocus
                     required
                   />
                 </div>

                 <button type="submit" className="w-full bg-[#fb641b] text-white font-semibold py-3.5 shadow-sm rounded-[2px] text-[15px] hover:bg-[#f35b13] cursor-pointer mt-4">
                   Verify
                 </button>
             </form>
          )}
        </div>
      </div>
    </div>
  );
}
