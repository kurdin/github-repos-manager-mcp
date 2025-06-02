# GitHub Repos Manager - File Structure

This project has been refactored into a modular structure for better maintainability and organization.

## File Structure

```
/
├── server.cjs                          # Main entry point (simple wrapper)
├── package.json                        # Project dependencies and scripts
├── README.md                          # Project documentation
└── src/                               # Source code directory
    ├── server.cjs                     # Main server implementation
    ├── services/                      # External service integrations
    │   └── github-api.cjs            # GitHub API service layer
    ├── handlers/                      # Feature-specific handlers
    │   ├── repository.cjs            # Repository management
    │   ├── issues.cjs                # Issue management
    │   ├── comments.cjs              # Comment management
    │   ├── pull-requests.cjs         # Pull request management
    │   ├── users.cjs                 # User information
    │   ├── labels.cjs                # Label management
    │   └── milestones.cjs            # Milestone management
    └── utils/                         # Utility modules
        └── tools-config.cjs          # Tool configuration definitions
```

## Module Responsibilities

### Core Components

- **`server.cjs`** (root): Simple entry point that imports and starts the main server
- **`src/server.cjs`**: Main server class that orchestrates all handlers
- **`src/services/github-api.cjs`**: Handles all GitHub API communication

### Handler Modules

Each handler module manages a specific domain of GitHub functionality:

- **Repository Handler**: Repository listing, info, search, contents, collaborators
- **Issue Handler**: Issue CRUD operations, assignments, locking
- **Comment Handler**: Issue comment management
- **Pull Request Handler**: Pull request operations
- **User Handler**: User information retrieval
- **Labels Handler**: Label management (create, edit, delete, list)
- **Milestones Handler**: Milestone management

### Configuration

- **Tools Config**: Centralized tool definitions with schemas and descriptions

## Benefits of This Structure

1. **Separation of Concerns**: Each module has a single responsibility
2. **Maintainability**: Easy to find and modify specific functionality
3. **Testability**: Individual modules can be tested in isolation
4. **Scalability**: Easy to add new features or handlers
5. **Code Reuse**: Common patterns are centralized in the API service

## Adding New Features

To add a new feature:

1. Create a new handler in `src/handlers/` if it's a new domain
2. Add the handler methods for the specific operations
3. Define tool configurations in `src/utils/tools-config.cjs`
4. Wire up the tools in `src/server.cjs`

## Development

The project maintains the same external API and functionality, but with much better internal organization.
