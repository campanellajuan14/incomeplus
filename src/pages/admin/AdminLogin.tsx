import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Alert from '../../components/Alert';

const AdminLogin: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
    form: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, adminUser, loading } = useAdmin();

  useEffect(() => {
    if (!loading && adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, loading, navigate]);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      name: '',
      form: ''
    };
    let isValid = true;

    if (!formValues.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Email address is invalid';
      isValid = false;
    }

    if (!formValues.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (isSignUp && formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (isSignUp && !formValues.name.trim()) {
      newErrors.name = 'Name is required for signup';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({ email: '', password: '', name: '', form: '' });
    
    try {
      let result;
      if (isSignUp) {
        result = await signUp(formValues.email, formValues.password, formValues.name);
      } else {
        result = await signIn(formValues.email, formValues.password);
      }
      
      if (result.error) {
        setErrors({
          email: '',
          password: '',
          name: '',
          form: result.error.message
        });
      }
    } catch (error: unknown) {
      console.error('Admin auth error:', error);
      const errorMessage = error instanceof Error ? error.message : `An error occurred during ${isSignUp ? 'signup' : 'login'}`;
      setErrors({
        email: '',
        password: '',
        name: '',
        form: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl animate-fade-in">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Admin Panel
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignUp 
              ? 'Create your admin account to access the control panel'
              : 'Enter your admin credentials to access the control panel'
            }
          </p>
          
          <div className="flex justify-center mt-6">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${
                  !isSignUp 
                    ? 'text-primary-600 border-primary-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${
                  isSignUp 
                    ? 'text-primary-600 border-primary-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {errors.form && (
          <Alert variant="error">
            {errors.form}
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {isSignUp && (
            <div>
              <div className="relative">
                <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formValues.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
          )}
          
          <div>
            <div className="relative">
              <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formValues.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formValues.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Admin Account' : 'Sign In to Admin Panel'}</span>
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;