# Pdnode Account Backend
> Pdnode assumes no responsibility for any data loss, when you use unstable version
The Pdnode Account is primarily used for Pdnode products, but it can still be applied to other products after modifications.

## Install
>  Since the version is not yet v0.1.0, the installation tutorial may contain errors! If you encounter any installation errors, please contact us through the [Discord server](https://discord.com/invite/7AabPTt2dX)!

### Prerequisites
**Symbol Explanation**
- `* = Source code installation only`
- `** = Docker installation only`

**Requisites**

- `*`Node.js >=22
- `*`pnpm >=10.13.x
- `**`Debian-based Distributions
  - > Other systems are not officially tested or supported, but you can still try using them.
- `*`Macos / Linux
  - > Other systems are not officially tested or supported, but you can still try using them.
- 2 RAM least
- Debian >= 12
- Ubuntu >= 22
- Postgresql

### Setup Database
> We only support PostgreSQL. Other databases may work, but MySQL/MariaDB are strictly prohibited!

1. Create database
2. Create user
3. Delete public and create account schema
4. Permissions to create/read (usage) tables based on this user's account schema.
5. Finish

### Source code execution
> For Mac and Linux

First clone the repository
```bash
git clone https://github.com/pdnode-team/account-backend
```

Then, Enter the directory: 
```bash
cd account-backend
```

Install dependencies
```bash
pnpm i
```

Build
```bash
pnpm build
```


Install production item dependencies
```bash
cd build
pnpm i --prod
node ace migration:run
```

Running API server
```bash
node ./bin/server.js
```

### use Docker
> We now support Docker!

Prerequisites: Docker Engine

edit .env
```
nano .env
```
> Please check the docker-compose.yml file to ensure all variables are set correctly.

start
```
docker compose up -d
```
> The docker-compose .yml file may contain inaccuracies; please review it carefully.
