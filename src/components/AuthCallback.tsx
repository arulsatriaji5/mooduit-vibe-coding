import React, { useEffect } from 'react';

interface AuthCallbackProps {
  onSuccess?: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess }) => {
  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        const code = searchParams.get('code') || hashParams.get('code');
        const token = searchParams.get('token') || hashParams.get('token');
        const oauthEmail = searchParams.get('oauth_email') || searchParams.get('email');
        const oauthName = searchParams.get('oauth_name') || searchParams.get('name');
        const oauthPicture = searchParams.get('oauth_picture') || searchParams.get('picture');
        const userId = searchParams.get('id');

        const finishAndRedirect = () => {
          if (!isMounted) return;
          localStorage.setItem('mooduit_current_page', 'dashboard');
          if (onSuccess) {
            onSuccess();
            return;
          }
          window.location.replace('/dashboard');
        };

        // Case 1: Params already extracted and passed back in query string
        if (oauthEmail || token) {
          if (token) localStorage.setItem('mooduit_session', token);
          if (oauthEmail) {
            localStorage.setItem('userEmail', oauthEmail);
            localStorage.setItem('mooduit_user', JSON.stringify({ email: oauthEmail, name: oauthName, picture: oauthPicture, id: userId }));
          }
          if (oauthName) localStorage.setItem('userName', oauthName);
          if (oauthPicture) localStorage.setItem('userAvatar', oauthPicture);
          if (userId) localStorage.setItem('userId', userId);

          localStorage.setItem('mooduit_current_page', 'dashboard');
          finishAndRedirect();
          return;
        }

        // Case 2: Authorization code present, perform backend exchange
        if (code) {
          const res = await fetch(`/api/auth/google/callback?code=${encodeURIComponent(code)}`);
          
          // Fetch automatically follows Express redirect response to /dashboard?...
          const finalUrl = res.url;
          if (finalUrl && finalUrl.includes('/dashboard')) {
            const redirectParams = new URLSearchParams(finalUrl.split('?')[1] || '');
            const newToken = redirectParams.get('token');
            const newEmail = redirectParams.get('oauth_email') || redirectParams.get('email');
            const newName = redirectParams.get('oauth_name');
            const newPic = redirectParams.get('oauth_picture');
            const newId = redirectParams.get('id');

            if (newToken) localStorage.setItem('mooduit_session', newToken);
            if (newEmail) {
              localStorage.setItem('userEmail', newEmail);
              localStorage.setItem('mooduit_user', JSON.stringify({ email: newEmail, name: newName, picture: newPic, id: newId }));
            }
            if (newName) localStorage.setItem('userName', newName);
            if (newPic) localStorage.setItem('userAvatar', newPic);
            if (newId) localStorage.setItem('userId', newId);

            localStorage.setItem('mooduit_current_page', 'dashboard');
            finishAndRedirect();
            return;
          }

          // Fallback if res returns json data directly
          const data = await res.json().catch(() => null);
          if (data && (data.email || data.user?.email)) {
            const userObj = data.user || data;
            if (userObj.email) localStorage.setItem('userEmail', userObj.email);
            if (userObj.name) localStorage.setItem('userName', userObj.name);
            if (userObj.picture) localStorage.setItem('userAvatar', userObj.picture);
            if (userObj.id) localStorage.setItem('userId', userObj.id);
            localStorage.setItem('mooduit_user', JSON.stringify(userObj));
            localStorage.setItem('mooduit_session', 'google_' + Date.now());
            localStorage.setItem('mooduit_current_page', 'dashboard');
            finishAndRedirect();
            return;
          }

          // Direct redirect fallback
          localStorage.setItem('mooduit_current_page', 'dashboard');
          finishAndRedirect();
          return;
        }

        // Case 3: Implicit token in access_token
        const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
        if (accessToken) {
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            const loginRes = await fetch('/api/google-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: profile.email, name: profile.name, picture: profile.picture })
            });
            const loginData = await loginRes.json();

            localStorage.setItem('mooduit_session', 'google_' + Date.now());
            localStorage.setItem('userEmail', profile.email);
            localStorage.setItem('userName', loginData.user?.name || profile.name || 'Sobat Cuan');
            if (profile.picture) localStorage.setItem('userAvatar', profile.picture);
            if (loginData.user?.id) localStorage.setItem('userId', loginData.user.id);
            localStorage.setItem('mooduit_user', JSON.stringify(loginData.user || profile));
            localStorage.setItem('mooduit_current_page', 'dashboard');
            finishAndRedirect();
            return;
          }
        }

        // Default fallback if no code/token matched
        localStorage.setItem('mooduit_current_page', 'dashboard');
        finishAndRedirect();
      } catch (err: any) {
        if (isMounted) {
          console.error('OAuth Callback Error:', err);
          localStorage.setItem('mooduit_current_page', 'dashboard');
          window.location.replace('/dashboard');
        }
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [onSuccess]);

  // Hapus tampilan UI dari komponen Auth Callback (jadikan invisible/null)
  return null;
};

