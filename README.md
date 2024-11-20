## Project Details

This project is built for testing TURN or STUN servers. You can add TURN server credentials, and it will output the connection results in a table. The table will display:

- **ICE Gathered Candidates**: Successful candidates gathered during the ICE process.
- **ICE Errors**: If there are any failed candidates, they will be displayed in a separate table for easier debugging.

## Features

- **React**: A modern JavaScript library for building user interfaces.
- **TypeScript**: For type safety and enhanced developer experience.
- **Vite**: A fast build tool and development server.
- **ESLint**: Configured with rules for React and TypeScript.
- **TURN/STUN Testing**: Allows testing and validation of TURN/STUN server connectivity.

## Setup and Development

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:usama-liaqat/ice-server-test.git
   cd ice-server-test
   ```
2. Install dependencies:
    ```bash
   yarn install
   ```
### Scripts
- Start the development server:
```bash
yarn dev
```

- Build for production:
```bash
yarn build
```
This will generate a production build in the dist directory.

### TURN/STUN Server Testing
1. Add TURN/STUN server credentials in the appropriate input fields on the UI.
2. The app will test the connectivity and display:
   - **Successful candidates:** ICE gathered candidates in a table.
   - **Failed candidates:** Errors or issues during ICE gathering in a separate table.
