document.addEventListener('DOMContentLoaded', function() {
    // Enhanced fallback markdown parser
    function createMarkdownParser() {
        return {
            parse: function(text) {
                if (!text) return '';
                
                return text
                    // Headers
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h4>$1</h4>')
                    .replace(/^# (.*$)/gim, '<h4>$1</h4>')
                    
                    // Bold and italic
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    
                    // Lists
                    .replace(/^- (.*$)/gim, '<li>$1</li>')
                    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
                    
                    // Line breaks and paragraphs
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                    
                    // Wrap in paragraph tags
                    .replace(/^(.*)$/gm, '<p>$1</p>')
                    .replace(/<p><\/p>/g, '')
                    .replace(/<p><p>/g, '<p>')
                    .replace(/<\/p><\/p>/g, '</p>');
            }
        };
    }
    
    // Set up the markdown parser
    window.marked = createMarkdownParser();
    console.log('Using built-in markdown parser');
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Authentication elements
    const signinContainer = document.getElementById('signin-container');
    const signedinContainer = document.getElementById('signedin-container');
    const signinBtn = document.getElementById('signin-btn');
    const signoutBtn = document.getElementById('signout-btn');
    const userEmail = document.getElementById('user-email');
    const userInitial = document.getElementById('user-initial');
    const authOverlay = document.getElementById('auth-overlay');
    
    // Development elements
    const redirectUriField = document.getElementById('redirect-uri');
    const copyUriBtn = document.getElementById('copy-uri-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    
    // Range selector elements
    const summarizeRange = document.getElementById('summarize-range');
    const briefsRange = document.getElementById('briefs-range');
    const summarizeCustomDate = document.getElementById('summarize-custom-date');
    const briefsCustomDate = document.getElementById('briefs-custom-date');
    const summarizeDateFrom = document.getElementById('summarize-date-from');
    const summarizeDateTo = document.getElementById('summarize-date-to');
    const briefsDateFrom = document.getElementById('briefs-date-from');
    const briefsDateTo = document.getElementById('briefs-date-to');
    
    // Time window displays
    const summarizeTimeWindow = document.getElementById('summarize-time-window');
    const briefsTimeWindow = document.getElementById('briefs-time-window');
    
    // Generate buttons
    const summarizeGenerateBtn = document.getElementById('summarize-generate');
    const briefsGenerateBtn = document.getElementById('briefs-generate');
    
    // Progress indicators
    const summarizeProgress = document.getElementById('summarize-progress');
    const briefsProgress = document.getElementById('briefs-progress');
    
    // Event containers
    const summarizeEvents = document.getElementById('summarize-events');
    const briefsEvents = document.getElementById('briefs-events');
    
    // Empty states
    const summarizeEmpty = document.getElementById('summarize-empty');
    const briefsEmpty = document.getElementById('briefs-empty');
    
    // Tab switching functionality with persistence
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Persist tab selection
            chrome.storage.local.set({ lastActiveTab: targetTab });
            
            updateTimeWindow(targetTab);
        });
    });
    
    // Authentication functionality
    signinBtn.addEventListener('click', handleSignIn);
    signoutBtn.addEventListener('click', handleSignOut);
    
    // Development functionality
    if (copyUriBtn) {
        copyUriBtn.addEventListener('click', handleCopyUri);
    }
    clearDataBtn.addEventListener('click', handleClearData);
    
    // Range selector functionality
    summarizeRange.addEventListener('change', () => updateTimeWindow('summarize'));
    briefsRange.addEventListener('change', () => updateTimeWindow('briefs'));
    
    // Date input change listeners
    if (summarizeDateFrom) {
        summarizeDateFrom.addEventListener('change', () => updateTimeWindow('summarize'));
    }
    if (summarizeDateTo) {
        summarizeDateTo.addEventListener('change', () => updateTimeWindow('summarize'));
    }
    if (briefsDateFrom) {
        briefsDateFrom.addEventListener('change', () => updateTimeWindow('briefs'));
    }
    if (briefsDateTo) {
        briefsDateTo.addEventListener('change', () => updateTimeWindow('briefs'));
    }
    
    // Generate button functionality
    summarizeGenerateBtn.addEventListener('click', () => handleGenerate('summarize'));
    briefsGenerateBtn.addEventListener('click', () => handleGenerate('briefs'));
    
    // Initialize
    initializeDevelopmentFields();
    restoreLastActiveTab();
    checkAuthStatus();
    
    // Ensure time windows are displayed for both tabs
    setTimeout(() => {
        updateTimeWindow('summarize');
        updateTimeWindow('briefs');
    }, 100);
    
    function initializeDevelopmentFields() {
        if (redirectUriField) {
            const redirectUri = chrome.identity.getRedirectURL();
            redirectUriField.value = redirectUri;
        }
    }
    
    async function restoreLastActiveTab() {
        try {
            const result = await chrome.storage.local.get(['lastActiveTab']);
            const lastTab = result.lastActiveTab || 'summarize';
            
            const targetTab = document.querySelector(`[data-tab="${lastTab}"]`);
            if (targetTab) {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                targetTab.classList.add('active');
                document.getElementById(lastTab).classList.add('active');
                
                updateTimeWindow(lastTab);
            }
        } catch (error) {
            console.error('Error restoring last active tab:', error);
            // Fallback to summarize tab
            const summarizeTab = document.querySelector('[data-tab="summarize"]');
            if (summarizeTab) {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                summarizeTab.classList.add('active');
                document.getElementById('summarize').classList.add('active');
                
                updateTimeWindow('summarize');
            }
        }
    }
    
    async function handleCopyUri() {
        try {
            await navigator.clipboard.writeText(redirectUriField.value);
            
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
            redirectUriField.select();
            document.execCommand('copy');
            
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
    
    async function handleClearData() {
        if (confirm('This will clear all cached briefs and data. Continue?')) {
            try {
                await chrome.storage.local.clear();
                summarizeEvents.innerHTML = '';
                briefsEvents.innerHTML = '';
                showToast('All cached briefs cleared - new format will be used');
            } catch (error) {
                console.error('Error clearing data:', error);
                showToast('Error clearing data');
            }
        }
    }
    
    function updateTimeWindow(tab) {
        const range = tab === 'summarize' ? summarizeRange.value : briefsRange.value;
        const timeWindow = tab === 'summarize' ? summarizeTimeWindow : briefsTimeWindow;
        const customDateDiv = tab === 'summarize' ? summarizeCustomDate : briefsCustomDate;
        
        if (range === 'custom') {
            customDateDiv.style.display = 'block';
            
            if (tab === 'summarize') {
                if (summarizeDateFrom && summarizeDateTo) {
                    const fromDate = summarizeDateFrom.value;
                    const toDate = summarizeDateTo.value;
                    if (fromDate && toDate) {
                        const start = new Date(fromDate);
                        const end = new Date(toDate);
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                        
                        timeWindow.textContent = `From ${formatDateTime(start)} to ${formatDateTime(end)}`;
                    }
                }
            } else if (tab === 'briefs') {
                if (briefsDateFrom && briefsDateTo) {
                    const fromDate = briefsDateFrom.value;
                    const toDate = briefsDateTo.value;
                    if (fromDate && toDate) {
                        const start = new Date(fromDate);
                        const end = new Date(toDate);
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                        
                        timeWindow.textContent = `From ${formatDateTime(start)} to ${formatDateTime(end)}`;
                    }
                }
            }
        } else {
            customDateDiv.style.display = 'none';
            const { start, end } = getTimeRange(range);
            timeWindow.textContent = `From ${formatDateTime(start)} to ${formatDateTime(end)}`;
        }
    }
    
    function getTimeRange(range) {
        const now = new Date();
        let start, end;
        
        switch (range) {
            case 'today':
                start = new Date(now);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'tomorrow':
                start = new Date(now);
                start.setDate(start.getDate() + 1);
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setHours(23, 59, 59, 999);
                break;
            case 'thisweek':
                start = getMondayOfWeek(now);
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case 'nextweek':
                const nextMonday = getMondayOfWeek(now);
                nextMonday.setDate(nextMonday.getDate() + 7);
                start = new Date(nextMonday);
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case 'lastweek':
                const monday = getMondayOfWeek(now);
                monday.setDate(monday.getDate() - 7);
                start = new Date(monday);
                start.setHours(0, 0, 0, 0);
                end = new Date(monday);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                start = getMondayOfWeek(now);
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
        }
        
        return { start, end };
    }
    
    function getMondayOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }
    
    function formatDateTime(date) {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    
    async function handleGenerate(tab) {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
            await handleSignInInline(tab);
            return;
        }
        
        const range = tab === 'summarize' ? summarizeRange.value : briefsRange.value;
        
        if (range === 'custom') {
            let fromDate, toDate;
            if (tab === 'summarize') {
                if (summarizeDateFrom && summarizeDateTo) {
                    fromDate = summarizeDateFrom.value;
                    toDate = summarizeDateTo.value;
                }
            } else if (tab === 'briefs') {
                if (briefsDateFrom && briefsDateTo) {
                    fromDate = briefsDateFrom.value;
                    toDate = briefsDateTo.value;
                }
            }
            
            if (!fromDate || !toDate) {
                showToast('Please select a custom date range');
                return;
            }
        }
        
        const { start, end } = getTimeRange(range);
        if (range === 'custom') {
            let fromDate, toDate;
            if (tab === 'summarize') {
                if (summarizeDateFrom && summarizeDateTo) {
                    fromDate = summarizeDateFrom.value;
                    toDate = summarizeDateTo.value;
                }
            } else if (tab === 'briefs') {
                if (briefsDateFrom && briefsDateTo) {
                    fromDate = briefsDateFrom.value;
                    toDate = briefsDateTo.value;
                }
            }
            
            if (fromDate && toDate) {
                const startDate = new Date(fromDate);
                const endDate = new Date(toDate);
                start.setTime(startDate.getTime());
                end.setTime(endDate.getTime());
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
            }
        }
        
        await generateContent(tab, start, end);
    }
    
    async function handleSignInInline(tab) {
        try {
            authOverlay.style.display = 'flex';
            
            const redirectUrl = chrome.identity.getRedirectURL();
            const clientId = config.google.clientId;
            const scope = 'https://www.googleapis.com/auth/calendar.readonly';
            
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
                `scope=${encodeURIComponent(scope + ' openid email profile')}&` +
                `response_type=code&` +
                `access_type=offline`;
            
            const authResult = await chrome.identity.launchWebAuthFlow({
                url: authUrl,
                interactive: true
            });
            
            if (chrome.runtime.lastError) {
                throw new Error(chrome.runtime.lastError.message);
            }
            
            const url = new URL(authResult);
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');
            
            if (error) {
                const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
                throw new Error(`OAuth Error: ${error} - ${errorDescription}`);
            }
            
            if (!code) {
                throw new Error('No authorization code received');
            }
            
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code: code,
                    client_id: clientId,
                    client_secret: config.google.clientSecret,
                    redirect_uri: redirectUrl,
                    grant_type: 'authorization_code'
                })
            });
            
            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                throw new Error(`Failed to exchange code for tokens: ${tokenResponse.status} ${tokenResponse.statusText}`);
            }
            
            const tokenData = await tokenResponse.json();
            
            let email;
            if (tokenData.id_token) {
                try {
                    const idTokenPayload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
                    email = idTokenPayload.email;
                } catch (error) {
                    console.log('Failed to decode ID token, fetching user info instead');
                }
            }
            
            if (!email) {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`
                    }
                });
                
                if (userInfoResponse.ok) {
                    const userInfo = await userInfoResponse.json();
                    email = userInfo.email;
                } else {
                    throw new Error('Failed to fetch user info');
                }
            }
            
            if (!email) {
                throw new Error('Could not retrieve user email');
            }
            
            await chrome.storage.local.set({
                access_token: tokenData.access_token,
                expires_at: Date.now() + (tokenData.expires_in * 1000),
                email: email
            });
            
            showSignedInState(email, true); // Stay on current tab
            authOverlay.style.display = 'none';
            
            // Continue with generation
            const range = tab === 'summarize' ? summarizeRange.value : briefsRange.value;
            
            const { start, end } = getTimeRange(range);
            if (range === 'custom') {
                let fromDate, toDate;
                if (tab === 'summarize') {
                    if (summarizeDateFrom && summarizeDateTo) {
                        fromDate = summarizeDateFrom.value;
                        toDate = summarizeDateTo.value;
                    }
                } else if (tab === 'briefs') {
                    if (briefsDateFrom && briefsDateTo) {
                        fromDate = briefsDateFrom.value;
                        toDate = briefsDateTo.value;
                    }
                }
                
                if (fromDate && toDate) {
                    const startDate = new Date(fromDate);
                    const endDate = new Date(toDate);
                    start.setTime(startDate.getTime());
                    end.setTime(endDate.getTime());
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                }
            }
            
            await generateContent(tab, start, end);
            
        } catch (error) {
            console.error('Sign in error:', error);
            authOverlay.style.display = 'none';
            showToast('Sign in failed: ' + error.message);
        }
    }
    
    async function generateContent(tab, start, end) {
        const progress = tab === 'summarize' ? summarizeProgress : briefsProgress;
        const eventsContainer = tab === 'summarize' ? summarizeEvents : briefsEvents;
        const emptyState = tab === 'summarize' ? summarizeEmpty : briefsEmpty;
        const generateBtn = tab === 'summarize' ? summarizeGenerateBtn : briefsGenerateBtn;
        
        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            progress.style.display = 'block';
            eventsContainer.innerHTML = '';
            emptyState.style.display = 'none';
            
            const events = await fetchCalendarEvents(start, end);
            
            if (events.length === 0) {
                emptyState.style.display = 'block';
                progress.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.textContent = 'GENERATE';
                return;
            }
            
            if (tab === 'briefs') {
                // For Briefs tab, only generate weekly retrospective
                await generateWeeklyRetrospective(events, eventsContainer);
            } else {
                // For Summarize tab, generate individual meeting briefs
                const groupedEvents = groupEventsByDate(events);
                renderEvents(tab, groupedEvents, eventsContainer);
                await generateAllContent(tab, groupedEvents, progress);
            }
            
        } catch (error) {
            console.error('Error generating content:', error);
            showToast('Error generating content: ' + error.message);
        } finally {
            progress.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.textContent = 'GENERATE';
        }
    }
    
    async function fetchCalendarEvents(start, end) {
        const result = await chrome.storage.local.get(['access_token']);
        const accessToken = result.access_token;
        
        if (!accessToken) {
            throw new Error('No access token available');
        }
        
        const timeMin = start.toISOString();
        const timeMax = end.toISOString();
        
        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `singleEvents=true&orderBy=startTime&timeMin=${timeMin}&timeMax=${timeMax}&maxResults=100`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Calendar API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.items || [];
    }
    
    function groupEventsByDate(events) {
        const grouped = {};
        
        events.forEach(event => {
            const start = new Date(event.start.dateTime || event.start.date);
            const dateKey = start.toDateString();
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push(event);
        });
        
        Object.keys(grouped).forEach(dateKey => {
            grouped[dateKey].sort((a, b) => {
                const startA = new Date(a.start.dateTime || a.start.date);
                const startB = new Date(b.start.dateTime || b.start.date);
                return startA - startB;
            });
        });
        
        return grouped;
    }
    
    function renderEvents(tab, groupedEvents, container) {
        container.innerHTML = '';
        
        Object.entries(groupedEvents).forEach(([dateKey, events]) => {
            const date = new Date(dateKey);
            const dateTitle = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            
            const dateGroup = document.createElement('div');
            dateGroup.className = 'event-date-group';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'event-date-header';
            
            const dateTitleEl = document.createElement('div');
            dateTitleEl.className = 'event-date-title';
            dateTitleEl.textContent = dateTitle;
            
            const dateActions = document.createElement('div');
            dateActions.className = 'event-date-actions';
            
            const copyDayBtn = document.createElement('button');
            copyDayBtn.className = 'btn btn-small btn-copy';
            copyDayBtn.textContent = 'Copy Day';
            copyDayBtn.onclick = () => copyDayContent(events, tab);
            
            dateActions.appendChild(copyDayBtn);
            dateHeader.appendChild(dateTitleEl);
            dateHeader.appendChild(dateActions);
            dateGroup.appendChild(dateHeader);
            
            events.forEach(event => {
                const eventItem = createEventItem(event, tab);
                dateGroup.appendChild(eventItem);
            });
            
            container.appendChild(dateGroup);
        });
        
        if (Object.keys(groupedEvents).length > 0) {
            const copyAllBtn = document.createElement('button');
            copyAllBtn.className = 'btn btn-small btn-copy';
            copyAllBtn.textContent = 'Copy All';
            copyAllBtn.style.marginBottom = '16px';
            copyAllBtn.onclick = () => copyAllContent(groupedEvents, tab);
            container.insertBefore(copyAllBtn, container.firstChild);
        }
    }
    
    function createEventItem(event, tab) {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        const start = new Date(event.start.dateTime || event.start.date);
        const time = start.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        const eventTimeTitle = document.createElement('div');
        eventTimeTitle.className = 'event-time-title';
        
        const eventTime = document.createElement('div');
        eventTime.className = 'event-time';
        eventTime.textContent = time;
        
        const eventTitle = document.createElement('div');
        eventTitle.className = 'event-title';
        eventTitle.textContent = event.summary || 'Untitled Event';
        
        eventTimeTitle.appendChild(eventTime);
        eventTimeTitle.appendChild(eventTitle);
        
        const eventContent = document.createElement('div');
        eventContent.className = 'event-content';
        eventContent.id = `content-${event.id}`;
        eventContent.innerHTML = '<p>Content will be generated...</p>';
        
        const eventActions = document.createElement('div');
        eventActions.className = 'event-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-copy';
        copyBtn.textContent = 'Copy Brief';
        copyBtn.onclick = () => copyContent(event.id, tab);
        
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn-refresh';
        refreshBtn.textContent = 'Refresh';
        refreshBtn.onclick = () => refreshContent(event, tab);
        
        eventActions.appendChild(copyBtn);
        eventActions.appendChild(refreshBtn);
        
        eventItem.appendChild(eventTimeTitle);
        eventItem.appendChild(eventContent);
        eventItem.appendChild(eventActions);
        
        return eventItem;
    }
    
    async function generateAllContent(tab, groupedEvents, progress) {
        const allEvents = Object.values(groupedEvents).flat();
        const totalEvents = allEvents.length;
        let completedEvents = 0;
        
        const progressFill = progress.querySelector('.progress-fill');
        const progressText = progress.querySelector('.progress-text');
        
        for (let i = 0; i < allEvents.length; i += 3) {
            const batch = allEvents.slice(i, i + 3);
            const promises = batch.map(event => generateSingleContent(event, tab));
            
            try {
                await Promise.all(promises);
                completedEvents += batch.length;
                
                const percentage = (completedEvents / totalEvents) * 100;
                progressFill.style.width = `${percentage}%`;
                progressText.textContent = `Generating ... (${completedEvents} of ${totalEvents})`;
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error('Error in batch:', error);
                showToast(`Error generating some content: ${error.message}`);
            }
        }
    }
    
    async function generateSingleContent(event, tab) {
        const cacheKey = `content_${event.id}`;
        
        // Always regenerate content to ensure new format is used
        try {
            const content = await callLLM(event, tab);
            
            await chrome.storage.local.set({
                [cacheKey]: {
                    updated: event.updated,
                    contentMarkdown: content,
                    generatedAt: Date.now()
                }
            });
            
            renderContent(event.id, content);
            
        } catch (error) {
            console.error('Error generating content for event:', event.id, error);
            renderContent(event.id, `Error generating content: ${error.message}`);
        }
    }
    
    async function generateWeeklyRetrospective(events, container) {
        try {
            const retrospectiveHeader = document.createElement('div');
            retrospectiveHeader.className = 'retrospective-header';
            retrospectiveHeader.innerHTML = '<h3>Weekly Overview</h3><div id="retrospective-content">Generating...</div>';
            container.appendChild(retrospectiveHeader);
            
            const retrospectiveContent = document.getElementById('retrospective-content');
            if (!retrospectiveContent) return;
            
            const eventSummaries = events.map(event => {
                const start = new Date(event.start.dateTime || event.start.date);
                const date = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const time = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                const title = event.summary || 'Untitled Event';
                const description = event.description || '';
                const gist = description.substring(0, 100) + (description.length > 100 ? '...' : '');
                
                return `- ${date} ${time} — ${title} — ${gist}`;
            }).join('\n');
            
            const retrospective = await callLLMRetrospective(eventSummaries);
            retrospectiveContent.innerHTML = marked.parse(retrospective);
            
            const copyRetrospectiveBtn = document.createElement('button');
            copyRetrospectiveBtn.className = 'btn btn-small btn-copy';
            copyRetrospectiveBtn.textContent = 'Copy Overview';
            copyRetrospectiveBtn.onclick = () => copyRetrospective(retrospective);
            retrospectiveContent.appendChild(copyRetrospectiveBtn);
            
        } catch (error) {
            console.error('Error generating retrospective:', error);
            const retrospectiveContent = document.getElementById('retrospective-content');
            if (retrospectiveContent) {
                retrospectiveContent.innerHTML = 'Error generating overview';
            }
        }
    }
    
    async function callLLM(event, tab) {
        const eventData = preprocessEvent(event);
        
        if (tab === 'summarize') {
            return await callLLMSummarize(eventData);
        } else {
            return await callLLMBriefs(eventData);
        }
    }
    
    async function callLLMSummarize(eventData) {
        const prompt = `Event:
- Title: ${eventData.EVENT_TITLE}
- Date/Time (local): ${eventData.START_LOCAL} – ${eventData.TIMEZONE}
- Attendees: ${eventData.ATTENDEES_LIST}
- Location/Link: ${eventData.LOCATION_OR_MEET_URL}
- Description (raw, first 800 chars): ${eventData.DESCRIPTION_800}
- Likely company (from title or email domain): ${eventData.COMPANY_GUESS || "Unknown"}
- Likely website (only if from domain): ${eventData.WEBSITE || "Not provided"}
- Meeting type: ${eventData.TYPE_GUESS}

Output EXACTLY (Markdown):
Meeting Prep

**Purpose:** [1 line]

**Company:** [Company or "Unknown"] — [Website or "Not provided"] — [optional 1 short descriptor if clearly indicated; otherwise omit]

**Preparation:**
- [Concrete point 1]
- [Concrete point 2]
- [Optional point 3 only if clearly useful]

**Questions to Ask:**
- [Targeted Q1]
- [Targeted Q2]
- [Optional Q3 if clearly useful]

Minimal mode if vague:
- **Purpose:** [copy title or 1-line paraphrase]
- **Company:** Unknown — Not provided
- **Preparation:** No special prep found.
- **Questions to Ask:** None suggested.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openai.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Briefly. Produce very short, actionable prep/focus guidance for meetings. Be accurate; don\'t invent facts or websites. Prefer specifics over generic advice. If the agenda is vague, output minimal prep.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async function callLLMBriefs(eventData) {
        const prompt = `Event:
- Title: ${eventData.EVENT_TITLE}
- Date/Time (local): ${eventData.START_LOCAL} – ${eventData.TIMEZONE}
- Attendees: ${eventData.ATTENDEES_LIST}
- Location/Link: ${eventData.LOCATION_OR_MEET_URL}
- Description (raw, first 800 chars): ${eventData.DESCRIPTION_800}
- Likely company (from title or email domain): ${eventData.COMPANY_GUESS || "Unknown"}
- Likely website (only if from domain): ${eventData.WEBSITE || "Not provided"}
- Meeting type: ${eventData.TYPE_GUESS}

Output EXACTLY (Markdown):
Meeting Prep

**Purpose:** [1 line]

**Company:** [Company or "Unknown"] — [Website or "Not provided"] — [optional 1 short descriptor if clearly indicated; otherwise omit]

**Preparation:**
- [Concrete point 1]
- [Concrete point 2]
- [Optional point 3 only if clearly useful]

**Questions to Ask:**
- [Targeted Q1]
- [Targeted Q2]
- [Optional Q3 if clearly useful]

Minimal mode if vague:
- **Purpose:** [copy title or 1-line paraphrase]
- **Company:** Unknown — Not provided
- **Preparation:** No special prep found.
- **Questions to Ask:** None suggested.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openai.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Briefly. Produce very short, actionable prep/focus guidance for meetings. Be accurate; don\'t invent facts or websites. Prefer specifics over generic advice. If the agenda is vague, output minimal prep.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async function callLLMRetrospective(eventSummaries) {
        const prompt = `You are Briefly. Create a short retrospective for the past week based on these meetings (list provided).
Meetings (one per line):
${eventSummaries}

Output EXACTLY (Markdown):
Weekly Retrospective

**Themes:** [2–3 bullets; concrete patterns]

**Wins:** [2 bullets]

**Blockers/Risks:** [1–2 bullets]

**Improvements for Next Week:** 
- [Suggestion 1, specific and actionable]
- [Suggestion 2, specific and actionable]`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openai.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Briefly. Create concise, actionable weekly retrospectives based on meeting data.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 400
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    function preprocessEvent(event) {
        const start = new Date(event.start.dateTime || event.start.date);
        const attendees = (event.attendees || []).map(a => {
            if (a.displayName) {
                return `${a.displayName} <${a.email}>`;
            }
            return a.email;
        }).join(', ');
        
        const location = event.location || '';
        const conferenceData = event.conferenceData?.entryPoints?.[0]?.uri || '';
        const locationOrUrl = location || conferenceData;
        
        const description = event.description || '';
        const descriptionFirst800 = description.substring(0, 800);
        
        const attendeeDomains = (event.attendees || [])
            .map(a => a.email.split('@')[1])
            .filter(Boolean);
        
        const companyGuess = attendeeDomains.length > 0 ? 
            attendeeDomains[0].split('.')[0].charAt(0).toUpperCase() + 
            attendeeDomains[0].split('.')[0].slice(1) : 'Unknown';
        
        const websiteFromDomain = attendeeDomains.length > 0 ? 
            `https://${attendeeDomains[0]}` : 'Not provided';
        
        const title = event.summary || '';
        const typeGuess = inferMeetingType(title);
        
        return {
            EVENT_TITLE: title,
            START_LOCAL: start.toLocaleString(),
            TIMEZONE: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ATTENDEES_LIST: attendees || 'No attendees',
            LOCATION_OR_MEET_URL: locationOrUrl || 'Not provided',
            DESCRIPTION_800: descriptionFirst800 || 'No description',
            COMPANY_GUESS: companyGuess,
            WEBSITE: websiteFromDomain,
            TYPE_GUESS: typeGuess
        };
    }
    
    function inferMeetingType(title) {
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('screen') || lowerTitle.includes('interview')) return 'interview';
        if (lowerTitle.includes('intro') || lowerTitle.includes('introduction')) return 'intro';
        if (lowerTitle.includes('demo') || lowerTitle.includes('demonstration')) return 'demo';
        if (lowerTitle.includes('sales') || lowerTitle.includes('pitch')) return 'sales';
        if (lowerTitle.includes('sync') || lowerTitle.includes('synchronization')) return 'sync';
        if (lowerTitle.includes('standup') || lowerTitle.includes('stand-up')) return 'standup';
        if (lowerTitle.includes('retro') || lowerTitle.includes('retrospective')) return 'retro';
        if (lowerTitle.includes('1:1') || lowerTitle.includes('one on one')) return '1:1';
        
        return 'other';
    }
    
    function renderContent(eventId, markdown) {
        const contentElement = document.getElementById(`content-${eventId}`);
        if (contentElement) {
            contentElement.innerHTML = marked.parse(markdown);
        }
    }
    
    async function refreshContent(event, tab) {
        const cacheKey = `content_${event.id}`;
        await chrome.storage.local.remove(cacheKey);
        
        try {
            const content = await callLLM(event, tab);
            
            await chrome.storage.local.set({
                [cacheKey]: {
                    updated: event.updated,
                    contentMarkdown: content,
                    generatedAt: Date.now()
                }
            });
            
            renderContent(event.id, content);
            showToast('Content refreshed');
            
        } catch (error) {
            console.error('Error refreshing content:', error);
            showToast('Error refreshing content: ' + error.message);
        }
    }
    
    async function copyContent(eventId, tab) {
        const cacheKey = `content_${eventId}`;
        const result = await chrome.storage.local.get([cacheKey]);
        
        if (result[cacheKey]) {
            try {
                await navigator.clipboard.writeText(result[cacheKey].contentMarkdown);
                showToast('Brief copied to clipboard');
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                showToast('Error copying to clipboard');
            }
        }
    }
    
    async function copyRetrospective(retrospective) {
        try {
            await navigator.clipboard.writeText(retrospective);
            showToast('Retrospective copied to clipboard');
        } catch (error) {
            console.error('Error copying retrospective:', error);
            showToast('Error copying retrospective');
        }
    }
    
    async function copyDayContent(events, tab) {
        const contents = [];
        
        for (const event of events) {
            const cacheKey = `content_${event.id}`;
            const result = await chrome.storage.local.get([cacheKey]);
            
            if (result[cacheKey]) {
                const start = new Date(event.start.dateTime || event.start.date);
                const time = start.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                
                contents.push(`## ${time} — ${event.summary || 'Untitled Event'}\n\n${result[cacheKey].contentMarkdown}\n\n---\n`);
            }
        }
        
        if (contents.length > 0) {
            try {
                await navigator.clipboard.writeText(contents.join('\n'));
                showToast(`${contents.length} briefs copied to clipboard`);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                showToast('Error copying to clipboard');
            }
        } else {
            showToast(`No briefs available to copy`);
        }
    }
    
    async function copyAllContent(groupedEvents, tab) {
        const allContents = [];
        
        for (const [dateKey, events] of Object.entries(groupedEvents)) {
            const date = new Date(dateKey);
            const dateTitle = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            
            allContents.push(`# ${dateTitle}\n\n`);
            
            for (const event of events) {
                const cacheKey = `content_${event.id}`;
                const result = await chrome.storage.local.get([cacheKey]);
                
                if (result[cacheKey]) {
                    const start = new Date(event.start.dateTime || event.start.date);
                    const time = start.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    
                    allContents.push(`## ${time} — ${event.summary || 'Untitled Event'}\n\n${result[cacheKey].contentMarkdown}\n\n---\n`);
                }
            }
        }
        
        if (allContents.length > 0) {
            try {
                await navigator.clipboard.writeText(allContents.join('\n'));
                showToast(`All briefs copied to clipboard`);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                showToast('Error copying to clipboard');
            }
        } else {
            showToast(`No briefs available to copy`);
        }
    }
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
    
    async function checkAuthStatus() {
        try {
            const result = await chrome.storage.local.get(['access_token', 'expires_at', 'email']);
            
            if (result.access_token && result.expires_at && result.email) {
                const now = Date.now();
                
                if (now < result.expires_at) {
                    // Don't switch tabs, just update the auth UI
                    signinContainer.style.display = 'none';
                    signedinContainer.style.display = 'block';
                    userEmail.textContent = result.email;
                    userInitial.textContent = result.email.charAt(0).toUpperCase();
                    return true;
                } else {
                    await chrome.storage.local.clear();
                    showSignInState();
                    return false;
                }
            } else {
                showSignInState();
                return false;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            showSignInState();
            return false;
        }
    }
    
    async function handleSignIn() {
        try {
            signinBtn.disabled = true;
            signinBtn.textContent = 'Signing in...';
            
            const redirectUrl = chrome.identity.getRedirectURL();
            const clientId = config.google.clientId;
            const scope = 'https://www.googleapis.com/auth/calendar.readonly';
            
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
                `scope=${encodeURIComponent(scope + ' openid email profile')}&` +
                `response_type=code&` +
                `access_type=offline`;
            
            const authResult = await chrome.identity.launchWebAuthFlow({
                url: authUrl,
                interactive: true
            });
            
            if (chrome.runtime.lastError) {
                throw new Error(chrome.runtime.lastError.message);
            }
            
            const url = new URL(authResult);
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');
            
            if (error) {
                const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
                throw new Error(`OAuth Error: ${error} - ${errorDescription}`);
            }
            
            if (!code) {
                throw new Error('No authorization code received');
            }
            
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code: code,
                    client_id: clientId,
                    client_secret: config.google.clientSecret,
                    redirect_uri: redirectUrl,
                    grant_type: 'authorization_code'
                })
            });
            
            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                throw new Error(`Failed to exchange code for tokens: ${tokenResponse.status} ${tokenResponse.statusText}`);
            }
            
            const tokenData = await tokenResponse.json();
            
            let email;
            if (tokenData.id_token) {
                try {
                    const idTokenPayload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
                    email = idTokenPayload.email;
                } catch (error) {
                    console.log('Failed to decode ID token, fetching user info instead');
                }
            }
            
            if (!email) {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`
                    }
                });
                
                if (userInfoResponse.ok) {
                    const userInfo = await userInfoResponse.json();
                    email = userInfo.email;
                } else {
                    throw new Error('Failed to fetch user info');
                }
            }
            
            if (!email) {
                throw new Error('Could not retrieve user email');
            }
            
            await chrome.storage.local.set({
                access_token: tokenData.access_token,
                expires_at: Date.now() + (tokenData.expires_in * 1000),
                email: email
            });
            
            showSignedInState(email);
            
        } catch (error) {
            console.error('Sign in error:', error);
            let errorMessage = 'Sign in failed: ' + error.message;
            
            if (error.message.includes('Access blocked')) {
                errorMessage = 'Access blocked: Check your Google Cloud Console OAuth2 configuration.';
            }
            
            showToast(errorMessage);
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
            await chrome.storage.local.clear();
            showSignInState();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }
    
    function showSignedInState(email, stayOnCurrentTab = false) {
        signinContainer.style.display = 'none';
        signedinContainer.style.display = 'block';
        userEmail.textContent = email;
        userInitial.textContent = email.charAt(0).toUpperCase();
        
        // Only switch to Settings tab if not staying on current tab
        if (!stayOnCurrentTab) {
            const settingsTab = document.querySelector('[data-tab="settings"]');
            const settingsPane = document.getElementById('settings');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            settingsTab.classList.add('active');
            settingsPane.classList.add('active');
        }
    }
    
    function showSignInState() {
        signinContainer.style.display = 'block';
        signedinContainer.style.display = 'none';
    }
}); 