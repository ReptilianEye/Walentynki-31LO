# Walentynki Frontend

Życzenia Walentynkowe uczniów i nauczycieli Liceum Ogólnokształcącego nr 31 w Krakowie.

## Running locally

0. Make sure [Node.js](https://nodejs.org/) (`v14.17.0` or later), [npm](https://www.npmjs.com/), and [yarn](https://yarnpkg.com/) are installed. [Clone this repository](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository).
1. In the root directory of this project, run `yarn install` to install all dependencies.
2. In the root directory of this project, add a file named `.env.local` with the contents `REACT_APP_QNA_WS_URL=wss://ws.janm.dev/ws/qna-local/`
3. Run `yarn start` to start a development webserver. This will automatically refresh the site when you change any file. This is recommended for development.
4. Optionally, to see debug information in the browser console, add the `?debug=true` search parameter to the URL.
5. Optionally, run `yarn build` and `npx serve -s build` to create and view an optimized production version. This is recommended for final tests before committing. Note: if you have run this project locally using this method before, you may need to close and reopen all the tabs of the site to see the most recent version.

## Attribution

- This project uses the [Inter](https://github.com/rsms/inter/) font, licensed under the [Open Font License](https://scripts.sil.org/OFL). For more info, check the `public/fonts/inter.LICENSE` file.
- This project uses the [Roboto](https://github.com/google/roboto/) font, licensed under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0). For more info, check the `public/fonts/roboto.LICENSE` file.
- This project uses the [Roboto Mono](https://github.com/google/roboto/) font, licensed under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0). For more info, check the `public/fonts/roboto-mono.LICENSE` file.
- This project uses icons (some edited by us) from the [Material Icons Library](https://fonts.google.com/icons), licensed under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
