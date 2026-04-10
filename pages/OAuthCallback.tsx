import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/auth';

interface OAuthCallbackProps {
  onLoginSuccess: () => void;
}

/**
 * OAuth Callback Handler Page
 * Handles the OAuth redirect from Google/GitHub
 * Processes the token and completes login
 */
export const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onLoginSuccess }) => {
  const [status, setStatus] = useState('Processing OAuth login...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider');
        const errorParam = urlParams.get('error');

        // Check for errors first
        if (errorParam) {
          const errorMsg = errorParam === 'google_auth_failed' 
            ? 'Google authentication failed'
            : errorParam === 'github_auth_failed'
              ? 'GitHub authentication failed'
              : decodeURIComponent(errorParam);
          setError(`OAuth Error: ${errorMsg}`);
          setStatus('');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        // Validate we have required parameters
        if (!token) {
          setError('No authentication token received. Please try logging in again.');
          setStatus('');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        if (!provider) {
          setError('No provider information. Please try logging in again.');
          setStatus('');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        setStatus(`Authenticating with ${provider}...`);

        // Call the OAuth callback handler
        const result = await authService.handleOAuthCallback(
          token,
          provider,
          urlParams.get('state') || undefined
        );

        if (result.success && result.user) {
          setStatus('Login successful! Redirecting...');
          
          // Clear URL and trigger login success
          window.history.replaceState({}, '', '/');
          
          // Small delay to show success message
          setTimeout(() => {
            onLoginSuccess();
          }, 500);
        } else {
          setError(result.error || 'Authentication failed. Please try again.');
          setStatus('');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'An unexpected error occurred during OAuth login');
        setStatus('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Error Display */}
      {error && (
        <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center mb-6">
          <h2 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
            Authentication Failed
          </h2>
          <p className="text-red-700 dark:text-red-300 text-sm mb-4">
            {error}
          </p>
          <p className="text-red-600 dark:text-red-400 text-xs">
            Redirecting to login in 3 seconds...
          </p>
        </div>
      )}

      {/* Loading Display */}
      {status && (
        <div className="text-center">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 text-violet-400 animate-spin mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {status}
          </h2>
          <p className="text-slate-400">
            Please wait while we complete your login...
          </p>
        </div>
      )}
    </div>
  );
};
