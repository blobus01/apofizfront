# Apofiz Frontend project

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

For running this application you need to have [NodeJs](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/).
We recommend to use [NVM](https://github.com/creationix/nvm) for managing NodeJs versions
For NVM installation please refer to [manual](https://github.com/creationix/nvm#install--update-script)

- NodeJS 14.17.1
- NPM 7.18.1

### Installing

```
npm install
```

### Run application

```
npm run start
```

If you need to compile application for deployment

```
npm run build
```

## Running the tests

```
npm run test
```

## Environment variables (.env)

Create `.env` file and locate on the root folder of project with below variables:

| NAME                  | DEFAULT              | DESCRIPTION                                        |
| --------------------- | ---------            | -------------------------------------------------- |
| REACT_APP_ENV         | development          | Build mode can be `development` or `production`    |
| REACT_APP_DOMAIN      | localhost            | Base domain URL                                    |
| REACT_APP_API_URL     | localhost            | Production API URL                                 |
| REACT_APP_DEV_API_URL | localhost            | Development API URL                                |
| REACT_APP_GOOGLE_PLAY_URL         | *        | Google Play Download App Link                      |
| REACT_APP_APPLE_STORE_URL         | *        | Apple Store download App Link                      |
| REACT_APP_GOOGLE_PLAY_APP_ID      | *        | Unique Google APP ID                               |
| REACT_APP_APPLE_STORE_APP_ID      | *        | Unique Apple Store APP ID                          |
| REACT_APP_LOCALIZATION_VERSION    | dev      | Localization files version (Any string value). Once you update localization files, please update this value too.                        |
| REACT_APP_FCM_API_KEY             | *        | Firebase FCM API Key                               |
| REACT_APP_FCM_AUTH_DOMAIN         | *        | Firebase FCM Auth Domain                           |
| REACT_APP_FCM_DB_URL              | *        | Firebase FCM Database URL                          |
| REACT_APP_FCM_PROJECT_ID          | *        | Firebase FCM Project ID                            |
| REACT_APP_FCM_STORAGE_BUCKET      | *        | Firebase FCM Storage bucket                        |
| REACT_APP_FCM_SENDER_ID           | *        | Firebase FCM Sender ID                             |
| REACT_APP_FCM_APP_ID              | *        | Firebase FCM Application ID                        |
| REACT_APP_FCM_MEASUREMENT_ID      | *        | Firebase FCM Measurement ID                        |

## Built With

* [React.js](https://github.com/facebook/react/) - Component Library
* [JavaScript](https://www.javascript.com/) - Primary language
* [SCSS](https://sass-lang.com/) - CSS extension language
* [Redux](https://github.com/reduxjs/redux/) - State management library

## License

This project is licensed under the MIT License