export const Constant = {
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  google: process.env.NEXT_PUBLIC_SERVER_ENDPOINT || '',
  googleOAuthRedirectUri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL || '',
};

export const getGoogleOAuthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: Constant.googleOAuthRedirectUri,
    client_id: Constant.googleClientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' '),
  } as const;

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
};
