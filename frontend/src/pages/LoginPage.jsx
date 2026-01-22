
import React, {useState} from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';


export default function LoginPage() {
    const { admin, loginAdmin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await loginAdmin(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    // Redirect if already logged in
    if (admin) {
        return <Navigate to="/dashboard" replace />;
    }

    /*return (
       <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <div className="text-right mt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div> 
    );
    */
   return (
     <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-800 via-green-600 to-emerald-500">
       {/* Background Image */}
       <div
         className="absolute inset-0 bg-cover bg-center bg-no-repeat"
         style={{
           backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920')`,
         }}
       >
         {/* Dark overlay for better readability */}
         <div className="absolute inset-0 bg-green-900/70"></div>
       </div>
       {/* Background decoration */}
       <div className="absolute inset-0 overflow-hidden">
         <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full opacity-20 blur-3xl"></div>
         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full opacity-20 blur-3xl"></div>
       </div>

       <div className="relative z-10 w-full max-w-md px-6">
         {/* Logo/Brand Section */}
         <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
             {/* Recycle/Garbage Icon */}
             <svg
               className="w-12 h-12 text-green-600"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={2}
                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
               />
             </svg>
           </div>
           <h1 className="text-3xl font-bold text-white">Smart Garbage</h1>
           <p className="text-green-100 mt-1">Management System</p>
         </div>

         {/* Login Card */}
         <form
           onSubmit={handleSubmit}
           className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl"
         >
           <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
             Admin Login
           </h2>

           {error && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                 <path
                   fillRule="evenodd"
                   d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                   clipRule="evenodd"
                 />
               </svg>
               {error}
             </div>
           )}

           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Email Address
               </label>
               <div className="relative">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                   <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                     />
                   </svg>
                 </span>
                 <input
                   type="email"
                   placeholder="admin@example.com"
                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Password
               </label>
               <div className="relative">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                   <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                     />
                   </svg>
                 </span>
                 <input
                   type={showPassword ? "text" : "password"}
                   placeholder="••••••••"
                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                 />
                 {/* Toggle Password Visibility */}
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                 >
                   {showPassword ? (
                     // Eye-off icon (hide)
                     <svg
                       className="w-5 h-5"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                       />
                     </svg>
                   ) : (
                     // Eye icon (show)
                     <svg
                       className="w-5 h-5"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                       />
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                       />
                     </svg>
                   )}
                 </button>
               </div>
             </div>
           </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full mt-6 bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {loading ? (
               <>
                 <svg
                   className="animate-spin h-5 w-5"
                   fill="none"
                   viewBox="0 0 24 24"
                 >
                   <circle
                     className="opacity-25"
                     cx="12"
                     cy="12"
                     r="10"
                     stroke="currentColor"
                     strokeWidth="4"
                   ></circle>
                   <path
                     className="opacity-75"
                     fill="currentColor"
                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                   ></path>
                 </svg>
                 Logging in...
               </>
             ) : (
               "Sign In"
             )}
           </button>

           <div className="text-center mt-4">
             <Link
               to="/forgot-password"
               className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors"
             >
               Forgot your password?
             </Link>
           </div>
         </form>

         {/* Footer */}
         <p className="text-center text-green-100 text-sm mt-6">
           © 2026 Smart Garbage Management System
         </p>
       </div>
     </div>
   );
}