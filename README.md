# api-server-template

Template for a minimal but functional API server, built using nodejs and express libraries, connected to a
Mongo DB.

## How to use this template

### Initial configs

Install yarn packages

```
yarn install
```

Add your secret configs to `config.env` file. You will need to specify

- the node environment: development or production

  ```
  NODE_ENV=development
  ```

- the port for the server, usually 3000

  ```
  PORT=3000
  ```

- the mongo DB url and password

  ```
  DATABASE=yourDbUrl
  DATABASE_PASSWORD=yourPassword
  ```

- the JWT secret (suggested 32 char long) and expiration time

  ```
  JWT_EXPIRES_IN=90d
  JWT_SECRET=...
  ```

- email username, password, host and port, for nodemailer to send a password recovery token by email

  ```
  EMAIL_USERNAME=...
  EMAIL_PASSWORD=...
  EMAIL_HOST=...
  EMAIL_PORT=...
  ```

  for development purpose, you should look at [Mailtrap](https://mailtrap.io/)

### Development

Add your resources models, controllers and routers in the dedicated directories. Check if the user
model and behaviour is appropriated for your application, or modify it accordingly to your needs.

### Debugging and development environment

Launch your application in development environment by running

```
yarn start
```

or try it in production environment

```
yarn start:prod
```

If you need to use `ndb` debugger, use

```
yarn debug
```

for development environment, or

```
yarn debug:prod
```

for production environment.
