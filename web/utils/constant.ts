export const Constant = {
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  google: process.env.NEXT_PUBLIC_SERVER_ENDPOINT || '',
  googleOAuthRedirectUri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL || '',
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
  facebookAuthRedirectUri: process.env.NEXT_PUBLIC_FACEBOOK_AUTH_REDIRECT_URL || '',
  isProd: process.env.NODE_ENV === 'production',
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

export const getFacebookOAuthURL = () => {
  const rootUrl = 'https://www.facebook.com/v15.0/dialog/oauth';

  const options = {
    client_id: Constant.facebookAppId,
    redirect_uri: Constant.facebookAuthRedirectUri,
    state: 'stateabc',
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
};
