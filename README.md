# LO31 Walentynki

A (slightly) rushed project to display Valentine's Day messages publicly.

**THIS IS AN ARCHIVE OF THE FULL VERSION.**
The version here closely resembles the setup during Valentine's Day, the main branch only contains a simplified, static frontend.

The frontend (`/front`) is made using create-react-app with the intention of being deployed to Vercel.
The backend (`/back`) is targeting the Cloudflare Workers platform. Due to time constraints, the entire backend is a single file, as splitting it up would require setting up a build system.

To run the frontend, use `yarn install` in `/front` to install all dependencies and `yarn start` to start a development server. There are three main parts: `/` (`MessageForm.tsx`) which displays all public messages, `/new` (`MessageForm.tsx`) which is used to submit new messages, and `/admin` (`AdminDashboard.tsx`) which is used to moderate new and reported messages.

To run the backend, use `yarn install` in `/back` to install all dependencies and [`wrangler dev`](https://developers.cloudflare.com/workers/cli-wrangler) to run a development build. The backend worker expects a KV binding with the name `MESSAGES` containing all Valentine's Day messages. An example is provided in `/back/example-messages.json`, which can be uploaded using `wrangler kv:bulk put --binding MESSAGES messages.json`. Note that these messages will be non-public by default. Additionally, the worker expects a secret value (as a string) as a `secret` named `TOKEN_SECRET`, which is used to generate API tokens. If the secret is set to `abc`, a valid admin token is `example.ADMIN.vrmEhJi8X+0n/ZCf6s5HuodjKULqh1WPKM0TbdShtplFjrUSD9T6CW68RQD2UG7lyfG1fkWuifXIKET62wfkNw==` and a valid moderator token is `example.MODERATOR.QUJm5ESXfu9CmO9ynHumDIJCSEQiH572+XbMggA8/VDaZMT5gTpfVKTfAwaWYnCkVqtChCkUOy4lNZljuNMi6w==`. These are used in the admin dashboard on `/admin`. Two more secrets exist to support Pushover notifications: `PUSHOVER_KEY` and `PUSHOVER_USER`. These can be considered optional, but are used to send push notifications using [Pushover](https://pushover.net/) when a message is submitted or reported.

## Attribution

See the Readme in `/front`.

## Copyright and License

If this is important to you, please [submit an issue](https://github.com/ReptilianEye/Walentynki-31LO/issues/new) and assign @ReptilianEye.
