/* This script allows you to get a session token for you Last.FM app
 * Create an app at https://www.last.fm/api/account/create
 */
const LastFM = require('./lastfm');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const { spawn } = require('child_process');

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readline.question(questionText, (input) => resolve(input) );
  });
}

async function promptForKeys() {
  console.info('Hello! To scrobble to Last.FM you\'ll need a session for your account, to provide some Last.FM API keys!');
  console.info('If needed, create a new application over here: https://www.last.fm/api/account/create');
  console.log('');
  try {
    const key = await ask('Having done that, enter your API Key: ');
    const secret = await ask('And now, the API Secret: ');

    if (key && secret) {
      const last = new LastFM(key, secret);
      const token = await last.authToken();

      if (!token) {
        throw new Error('Couldn\'t get an authorization token. Keys may be invalid?');
      }

      return {
        "lastFmApiKey": key,
        "lastFmApiSecret": secret
      };
    } else {
      throw new Error('API Key and Secret can\'t be empty strings.');
    }
  } catch (err) {
    console.error('Those keys were invalid. Check you pasted them correctly.');

    // Try again?
    return this.promptForKeys();
  }
}

async function run() {
  const keys = await promptForKeys();

  const last = new LastFM(keys.lastFmApiKey, keys.lastFmApiSecret);
  const authToken = await last.authToken();
  const authUrl = last.authUrl(authToken);

  console.log(`Authorize the app by visiting ${authUrl}`);
  spawn(`open`, [authUrl]);

  await ask("Press any key when you've completed authorisation…");

  try {
    let session = await last.getSigned('auth.getSession', { token: authToken });
    sessionKey = session.session.key;
    console.info('Here\'s your Session Key. Set this as LASTFM_SESSION in your logstash keystore.', sessionKey);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
