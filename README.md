# Pdnode Account Backend
The Pdnode Account is primarily used for Pdnode products, but it can still be applied to other products after modifications.

## Install
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
```

Running API server
```bash
node ./bin/server.js
```

### use Docker
