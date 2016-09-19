'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/material-dev',
	app: {
		title: 'Cytopathology Challenge Editor - Development Environment'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '141394759618805',
		clientSecret: process.env.FACEBOOK_SECRET || '7330c2a8cbca1e91a6d78d6453a98685',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'ChixF9mwNggIXdTCwcOd5E9xg',
		clientSecret: process.env.TWITTER_SECRET || '8hygxojZymO0wNQoWQZqXjAHlBi64fa8W5HcyQ2aI0hpWmK2xd',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '459803909132-6i1remlhqo4pavlol8cit4gnmi4gaq65.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'WojzOoblIKpFrQXBZFLK77f7',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || '77zg1azp6i4a9d',
		clientSecret: process.env.LINKEDIN_SECRET || '65d8Ej5kyl08psPJ',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'd2c8f03e640be18d9f2f',
		clientSecret: process.env.GITHUB_SECRET || '1e4dd36ad46afb99bbe055cda96fc867524deb7b',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
