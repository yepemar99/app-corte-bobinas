# ⚙️ Coil Cutting Management Desktop App

<div align="center">

<!-- TODO: Add project logo -->
<!-- ![Logo](path-to-logo) -->

[![GitHub stars](https://img.shields.io/github/stars/yepemar99/app-corte-bobinas?style=for-the-badge)](https://github.com/yepemar99/app-corte-bobinas/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yepemar99/app-corte-bobinas?style=for-the-badge)](https://github.com/yepemar99/app-corte-bobinas/network)
[![GitHub issues](https://img.shields.io/github/issues/yepemar99/app-corte-bobinas?style=for-the-badge)](https://github.com/yepemar99/app-corte-bobinas/issues)
[![GitHub license](https://img.shields.io/github/license/yepemar99/app-corte-bobinas?style=for-the-badge)](LICENSE) <!-- TODO: Add actual license file if available -->

**An intuitive cross-platform desktop application for optimizing coil cutting processes and managing inventory with robust local data persistence.**

</div>

## 📖 Overview

The Coil Cutting Management Desktop App is designed to streamline and optimize the complex process of cutting large material coils into smaller, specific dimensions. Targeting industries such as manufacturing, fabrication, and material supply, this application helps reduce material waste, improve operational efficiency, and provide clear insights into inventory. By leveraging a local SQLite database, it ensures data integrity and availability without requiring external server infrastructure. The user-friendly interface, built with React and styled with Tailwind CSS, makes managing coils, performing cut calculations, and visualizing data straightforward and efficient.

## ✨ Features

-   **Coil Cutting Optimization**: Calculate optimal cuts from master coils to minimize waste and maximize material utilization.
-   **Inventory Management**: Track and manage available coils, remnants, and cut pieces within a local database.
-   **Data Visualization**: Interactive charts powered by Chart.js to display cutting patterns, material usage, and inventory trends.
-   **Excel Integration**: Import and export data to and from Excel files (XLSX format) for seamless integration with existing workflows.
-   **Local Data Persistence**: Utilizes a SQLite database with Sequelize ORM for reliable and fast local data storage.
-   **Customizable Settings**: Configure application-specific preferences and database paths via a dedicated `settings.json` file.
-   **Modern User Interface**: A clean, responsive, and intuitive interface built with React, styled with Tailwind CSS, and enhanced with Heroicons.
-   **Cross-Platform Desktop Application**: Delivered as a standalone application compatible with various operating systems, powered by Electron.
-   **Centralized State Management**: Efficient and predictable data flow across the application using Redux Toolkit.
-   **Real-time Notifications**: Provides user feedback and updates through toast notifications.

## 🖥️ Screenshots

<!-- TODO: Add actual screenshots of the application in action -->
<!-- ![Screenshot 1](path-to-screenshot-1.png) -->
<!-- ![Screenshot 2](path-to-screenshot-2.png) -->
<!-- ![Screenshot 3](path-to-screenshot-3.png) -->

## 🛠️ Tech Stack

**Desktop Framework:**
![Electron](https://img.shields.io/badge/Electron-19.0.8-blue?style=for-the-badge&logo=electron&logoColor=white)

**Frontend:**
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.2.5-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.23.1-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.3-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

**Database:**
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.37.3-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)

**Build & Development Tools:**
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-10.x-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-5.x-1C78C0?style=for-the-badge&logo=webpack&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-8.x-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E?style=for-the-badge&logo=prettier&logoColor=white)

## 🚀 Quick Start

### Prerequisites
Before you begin, ensure you have the following installed:
-   **Node.js**: [v18.x](https://nodejs.org/en/) or later (LTS recommended)
-   **npm**: Comes bundled with Node.js.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yepemar99/app-corte-bobinas.git
    cd app-corte-bobinas
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment and Database setup**
    The application uses `settings.json` for configuration, including the database path. The default is an SQLite database located at `./data/database.sqlite`.

    ```json
    // settings.json
    {
      "sql_dialect": "sqlite",
      "storage_path": "./data/database.sqlite"
    }
    ```
    If you need to change the database location or dialect, modify this file.

    This project uses Sequelize for ORM. If there are database migrations, you might need to run them.
    <!-- TODO: Add actual Sequelize CLI commands if migration scripts are available in package.json or a designated folder -->
    ```bash
    # Example: If migration scripts are set up with sequelize-cli
    # npm run db:migrate
    ```

4.  **Start development server**
    This will launch the Electron application in development mode.
    ```bash
    npm run start
    ```

## 📁 Project Structure

```
app-corte-bobinas/
├── .gitignore
├── .prettierrc
├── package.json
├── package-lock.json
├── settings.json             # Application-specific configuration
├── src/                      # Source code directory
│   ├── main/                 # Electron main process source
│   │   ├── index.ts          # Main process entry point
│   │   └── preload.ts        # Preload script for context bridge
│   ├── renderer/             # Electron renderer process (React app) source
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Application pages/views
│   │   ├── store/            # Redux store, slices, and reducers
│   │   ├── services/         # Data interactions, IPC communication
│   │   ├── utils/            # Utility functions
│   │   ├── assets/           # Static assets (images, icons)
│   │   ├── styles/           # Tailwind CSS directives and global styles
│   │   └── index.tsx         # Main React application entry point
│   └── types/                # TypeScript declaration files
├── webpack.main.config.js    # Webpack configuration for Electron's main process
├── webpack.renderer.config.js# Webpack configuration for Electron's renderer process
├── webpack.rules.js          # Shared Webpack rules for various file types
├── tsconfig.json             # TypeScript configuration for the project
└── tsconfig.node.json        # TypeScript configuration specific to Node.js environments
```

## ⚙️ Configuration

### Application Settings (`settings.json`)
The `settings.json` file is used to configure application-specific parameters, particularly related to the database.

| Variable      | Description                               | Default               | Required |
|---------------|-------------------------------------------|-----------------------|----------|
| `sql_dialect` | Specifies the SQL dialect to use (e.g., `sqlite`). | `sqlite`              | Yes      |
| `storage_path`| Path to the SQLite database file.         | `./data/database.sqlite`| Yes      |

### Environment Variables
This project does not explicitly use `.env` files for environment variables in the provided structure. All primary configurations are managed through `settings.json`.

## 🔧 Development

### Available Scripts
The `package.json` includes several scripts to assist with development, building, and linting:

| Command           | Description                                                 |
|-------------------|-------------------------------------------------------------|
| `npm run start`   | Starts the Electron application in development mode.        |
| `npm run package` | Bundles the application for distribution without making installers. |
| `npm run make`    | Creates distributable installers for various platforms (e.g., Windows, macOS, Linux). |
| `npm run lint`    | Runs ESLint to check for code quality and style issues.     |
| `npm run rebuild` | Rebuilds native Node.js modules for Electron.               |

### Development Workflow
1.  Run `npm install` to set up all dependencies.
2.  Modify source code in the `src/` directory. Changes in the `renderer/` process (React app) will typically hot-reload. Changes in the `main/` process require restarting the `npm run start` command.
3.  Use `npm run lint` to check for code style and errors.
4.  Consider running `prettier --write .` (though not in a script, inferred from `.prettierrc`) to automatically format your code.

## 🧪 Testing

There are no explicit testing frameworks (e.g., Jest, React Testing Library, Playwright, Cypress) or test scripts currently configured in this repository based on the provided `package.json` and file structure.

## 🚀 Deployment

To create production-ready installers for the application, use Electron Forge's `make` command:

### Production Build
```bash
npm run make
```
This command will generate platform-specific installers (e.g., `.exe` for Windows, `.deb` for Debian-based Linux, `.dmg` for macOS) in the `out/` directory.

### Deployment Options
The `npm run make` command handles the bundling and packaging. The generated artifacts can then be distributed manually or via a CI/CD pipeline.

## 🤝 Contributing

We welcome contributions to the Coil Cutting Management Desktop App! To contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to your branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding style (enforced by ESLint and Prettier).

### Development Setup for Contributors
The development setup is the same as the Quick Start guide. Ensure you can run `npm run start` successfully.

## 📄 License

This project currently does not have an explicit license file. Please refer to the repository owner for licensing information.

## 🙏 Acknowledgments

-   **Electron Forge**: For simplifying the Electron development and build process.
-   **React**: For the declarative and efficient UI library.
-   **Redux Toolkit**: For robust state management.
-   **Tailwind CSS**: For the utility-first CSS framework.
-   **Sequelize**: For the powerful ORM to interact with SQLite.
-   **Chart.js**: For beautiful and interactive data visualizations.
-   **XLSX**: For Excel file parsing and writing capabilities.
-   **Heroicons**: For accessible and beautiful SVG icons.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [yepemar99](https://github.com/yepemar99)

</div>
