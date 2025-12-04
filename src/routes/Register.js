import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700 text-center">
            Registration form will be implemented here.
          </p>
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

