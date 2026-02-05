/// <reference types="vite/client" />
declare const gapi: any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient: any;
let isInitialized = false;

const loadGapiScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if ((window as any).gapi) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => console.error('Failed to load gapi script');
    document.body.appendChild(script);
  });
};

const loadGisScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if ((window as any).google) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => console.error('Failed to load GIS script');
    document.body.appendChild(script);
  });
};

export const initGoogleCalendar = async (): Promise<void> => {
  if (isInitialized) return;

  if (!CLIENT_ID) {
    console.warn('Google Client ID not found in environment variables.');
    return;
  }

  if (!API_KEY) {
    console.warn('Google API Key not found in environment variables.');
    return;
  }

  await Promise.all([loadGapiScript(), loadGisScript()]);

  return new Promise((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });

        // Initialize Identity Services Client
        tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined at request time
        });

        isInitialized = true;
        resolve();
      } catch (error) {
        // Reject the promise so App.tsx can catch it
        reject(error);
      }
    });
  });
};

export const signInToGoogle = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject('Google Calendar API not initialized');
      return;
    }

    tokenClient.callback = (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const createCalendarEvent = async (eventDetails: { summary: string; description: string; start: string; end: string }) => {
  if (!isInitialized) await initGoogleCalendar();

  try {
    const event = {
      'summary': eventDetails.summary,
      'description': eventDetails.description,
      'start': {
        'dateTime': eventDetails.start,
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      'end': {
        'dateTime': eventDetails.end,
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const request = gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event,
    });

    const response = await request;
    return response.result;
  } catch (error) {
    console.error('Error creating calendar event', error);
    throw error;
  }
};
