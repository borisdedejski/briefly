document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Authentication elements
    const signinContainer = document.getElementById('signin-container');
    const signedinContainer = document.getElementById('signedin-container');
    const signinBtn = document.getElementById('signin-btn');
    const signoutBtn = document.getElementById('signout-btn');
    const userEmail = document.getElementById('user-email');
    const userInitial = document.getElementById('user-initial');
    
    // Development elements
    const redirectUriField = document.getElementById('redirect-uri');
    const copyUriBtn = document.getElementById('copy-uri-btn');
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Authentication functionality
    signinBtn.addEventListener('click', handleSignIn);
    signoutBtn.addEventListener('click', handleSignOut);
    
    // Development functionality
    copyUriBtn.addEventListener('click', handleCopyUri);
    
    // Initialize development fields
    initializeDevelopmentFields();
    
    // Check authentication status on load
    checkAuthStatus();
    
    function initializeDevelopmentFields() {
        // Populate redirect URI field
        const redirectUri = chrome.identity.getRedirectURL();
        redirectUriField.value = redirectUri;
    }
    
    async function handleCopyUri() {
        try {
            await navigator.clipboard.writeText(redirectUriField.value);
            
            // Visual feedback
            const originalText = copyUriBtn.innerHTML;
            copyUriBtn.innerHTML = `
                <svg class="copy-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
            `;
            copyUriBtn.style.color = '#34A853';
            
            setTimeout(() => {
                copyUriBtn.innerHTML = originalText;
                copyUriBtn.style.color = '';
            }, 1500);
            
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            redirectUriField.select();
            document.execCommand('copy');
            
            // Visual feedback
            const originalText = copyUriBtn.innerHTML;
            copyUriBtn.innerHTML = `
                <svg class="copy-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
            `;
            copyUriBtn.style.color = '#34A853';
            
            setTimeout(() => {
                copyUriBtn.innerHTML = originalText;
                copyUriBtn.style.color = '';
            }, 1500);
        }
    }
    
    async function checkAuthStatus() {
        try {
            const result = await chrome.storage.local.get(['access_token', 'expires_at', 'email']);
            
            if (result.access_token && result.expires_at && result.email) {
                const now = Date.now();
                if (now < result.expires_at) {
                    // Token is valid, show signed in state
                    showSignedInState(result.email);
                } else {
                    // Token expired, clear storage and show sign in
                    await chrome.storage.local.clear();
                    showSignInState();
                }
            } else {
                showSignInState();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            showSignInState();
        }
    }
    
    async function handleSignIn() {
        try {
            signinBtn.disabled = true;
            signinBtn.textContent = 'Signing in...';
            
            // Launch OAuth flow
            const redirectUrl = chrome.identity.getRedirectURL();
            const clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Replace with your actual client ID
            const scope = 'https://www.googleapis.com/auth/calendar.readonly';
            
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
                `scope=${encodeURIComponent(scope)}&` +
                `response_type=code&` +
                `access_type=offline`;
            
            const authResult = await chrome.identity.launchWebAuthFlow({
                url: authUrl,
                interactive: true
            });
            
            if (chrome.runtime.lastError) {
                throw new Error(chrome.runtime.lastError.message);
            }
            
            // Extract authorization code from redirect URL
            const url = new URL(authResult);
            const code = url.searchParams.get('code');
            
            if (!code) {
                throw new Error('No authorization code received');
            }
            
            // Exchange code for tokens
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code: code,
                    client_id: clientId,
                    client_secret: 'YOUR_CLIENT_SECRET', // Replace with your actual client secret
                    redirect_uri: redirectUrl,
                    grant_type: 'authorization_code'
                })
            });
            
            if (!tokenResponse.ok) {
                throw new Error('Failed to exchange code for tokens');
            }
            
            const tokenData = await tokenResponse.json();
            
            // Decode ID token to get user info
            const idTokenPayload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
            const email = idTokenPayload.email;
            
            // Store tokens and user info
            await chrome.storage.local.set({
                access_token: tokenData.access_token,
                expires_at: Date.now() + (tokenData.expires_in * 1000),
                email: email
            });
            
            showSignedInState(email);
            
        } catch (error) {
            console.error('Sign in error:', error);
            alert('Sign in failed: ' + error.message);
            showSignInState();
        } finally {
            signinBtn.disabled = false;
            signinBtn.innerHTML = `
                <svg class="google-icon" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            `;
        }
    }
    
    async function handleSignOut() {
        try {
            // Clear stored tokens and user info
            await chrome.storage.local.clear();
            showSignInState();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }
    
    function showSignedInState(email) {
        signinContainer.style.display = 'none';
        signedinContainer.style.display = 'block';
        userEmail.textContent = email;
        userInitial.textContent = email.charAt(0).toUpperCase();
    }
    
    function showSignInState() {
        signinContainer.style.display = 'block';
        signedinContainer.style.display = 'none';
    }
}); 