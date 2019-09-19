# logstash-scrobbler

Since BFF.fm plays music all day long, we figured it would be fun to scrobble those tracks to Last.FM. Since we're also feeding the tracks into our elasticsearch instance, this logstash pipeline handles both.

We're consuming [Creek](https://creek.fm)'s tracks API into the events, and them using some ruby filters to wrangle the Last.FM API signing for a simple `http` POST output all in Logstash.

## Setup

* Create a Last.FM app here: https://www.last.fm/api/account/create
* Run `npm install` and `node scripts/session.js` to get a session token for your account
* Add `LASTFM_KEY`, `LASTFM_SECRET` and `LASTFM_SESSION` to your Logstash keystore.
