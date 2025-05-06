
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';

type FormType = 'login' | 'signup';

const Auth: React.FC = () => {
  const [formType, setFormType] = useState<FormType>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: ''
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      name: ''
    };
    let isValid = true;

    // Email validation
    if (!formValues.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Email address is invalid';
      isValid = false;
    }

    // Password validation
    if (!formValues.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Name validation (only for signup)
    if (formType === 'signup' && !formValues.name) {
      newErrors.name = 'Name is required';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Mock authentication - in a real app, this would connect to a backend
      console.log('Form submitted:', formValues);
      
      // Show success message
      alert(formType === 'login' 
        ? 'Login successful! (This is a demo)' 
        : 'Account created! (This is a demo)');
      
      // Redirect to home page
      navigate('/');
    }
  };

  const toggleFormType = () => {
    setFormType(prev => prev === 'login' ? 'signup' : 'login');
    setErrors({
      email: '',
      password: '',
      name: ''
    });
  };

  return (
    <div className="min-h-screen py-24 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-700">
            {formType === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {formType === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Sign up to start analyzing real estate investments'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {formType === 'signup' && (
            <div>
              <div className="relative">
                <User className="absolute top-3 left-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formValues.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-error-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-error-500">{errors.name}</p>}
            </div>
          )}
          
          <div>
            <div className="relative">
              <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formValues.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-error-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-error-500">{errors.email}</p>}
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
                className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-error-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
            {errors.password && <p className="mt-1 text-sm text-error-500">{errors.password}</p>}
          </div>

          {formType === 'login' && (
            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary-600 hover:text-primary-800">
                Forgot your password?
              </a>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg shadow-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span>{formType === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {formType === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleFormType}
              className="ml-2 font-medium text-primary-600 hover:text-primary-800 focus:outline-none"
            >
              {formType === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
