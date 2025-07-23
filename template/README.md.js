/* eslint-disable no-unused-vars */
import { File } from '@asyncapi/generator-react-sdk';

export default function ReadmeMd({ asyncapi }) {
    const info = asyncapi.info();
    const title = info.title();

    // Detect protocols from servers
    const servers = asyncapi.servers();
    const protocols = new Set();
    const serverConfigs = [];

    if (servers) {
        Object.entries(servers).forEach(([name, server]) => {
            const protocol = server.protocol && server.protocol();
            if (protocol) {
                protocols.add(protocol.toLowerCase());
                serverConfigs.push({
                    name,
                    protocol: protocol.toLowerCase(),
                    host: server.host && server.host(),
                    description: server.description && server.description()
                });
            }
        });
    }

    // Extract channels and their operations
    const channels = asyncapi.channels();
    const channelData = [];
    const messageTypes = new Set();

    if (channels) {
        Object.entries(channels).forEach(([channelName, channel]) => {
            const operations = channel.operations && channel.operations();
            const channelOps = [];

            if (operations) {
                Object.entries(operations).forEach(([opName, operation]) => {
                    const action = operation.action && operation.action();
                    const messages = operation.messages && operation.messages();

                    if (messages) {
                        messages.forEach(message => {
                            const messageName = message.name && message.name();
                            if (messageName) {
                                messageTypes.add(messageName);
                            }
                        });
                    }

                    channelOps.push({
                        name: opName,
                        action,
                        messages: messages || []
                    });
                });
            }

            channelData.push({
                name: channelName,
                address: channel.address && channel.address(),
                description: channel.description && channel.description(),
                operations: channelOps
            });
        });
    }

    return (
        <File name="README.md">
            {`# ${title}

This is a Rust AsyncAPI server generated from the AsyncAPI specification.

## Architecture

This project is structured as a **library** that provides a trait-based architecture for implementing AsyncAPI services:

- **Library**: Contains all the core functionality and can be used as a dependency in other Rust projects
- **Trait-Based**: Business logic is separated from infrastructure code through generated traits
- **Regeneration Safe**: Your business logic implementations are never overwritten

## Features

- Async/await support with Tokio
- Structured logging with tracing
- Protocol support: ${Array.from(protocols).join(', ') || 'generic'}
- Type-safe message handling
- Generated message models
- Channel-based operation handlers
- Configuration management
- Error handling and middleware
- Library + Binary architecture for maximum flexibility

## Usage as a Library

This generated code is designed to be used as a library in your own Rust projects.

### Add as Dependency

Add this library to your project's \`Cargo.toml\`:

\`\`\`toml
[dependencies]
${title.toLowerCase().replace(/[^a-z0-9]/g, '-')} = { path = "../path/to/this/library" }
tokio = { version = "1.0", features = ["full"] }
tracing = "0.1"
tracing-subscriber = "0.3"
async-trait = "0.1"
\`\`\`

### Implement Service Traits

Implement the generated service traits with your business logic:

\`\`\`rust
use ${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}::{/* Generated traits */, MessageContext, AsyncApiResult};
use async_trait::async_trait;

// Implement the generated service traits
// See USAGE.md for detailed examples
\`\`\`

### Create Your Application

Create your own \`main.rs\` that uses this library:

\`\`\`rust
use ${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}::{Config, Server, RecoveryManager};
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt().init();

    // Load configuration
    let config = Config::from_env()?;

    // Create your service implementations
    // let my_service = Arc::new(MyServiceImpl::new());

    // Create handlers with your implementations
    // let handler = SomeHandler::new(my_service, recovery_manager);

    // Create and start server
    let server = Server::builder()
        .with_config(config)
        // .with_handlers(handler)
        .build()
        .await?;

    server.start().await?;
    Ok(())
}
\`\`\`

### Build and Test

\`\`\`bash
# Build the library
cargo build --lib

# Run library tests
cargo test --lib

# Build your application (in your project)
cargo build

# Run your application
cargo run
\`\`\`

## Generated Components

### Servers
${serverConfigs.map(server => `- **${server.name}**: ${server.protocol}://${server.host} - ${server.description || 'No description'}`).join('\n')}

### Channels
${channelData.map(channel => `- **${channel.name}**: ${channel.address || channel.name} - ${channel.description || 'No description'}`).join('\n')}

### Message Types
${Array.from(messageTypes).map(type => `- ${type}`).join('\n')}

## Quick Reference

For detailed usage instructions, see the generated \`USAGE.md\` file.

\`\`\`bash
# Build the library
cargo build --lib

# Run library tests
cargo test --lib

# Generate documentation
cargo doc --open
\`\`\`

## Configuration

The server can be configured through environment variables:

- \`LOG_LEVEL\`: Set logging level (trace, debug, info, warn, error)
- \`SERVER_HOST\`: Server host (default: 0.0.0.0)
- \`SERVER_PORT\`: Server port (default: 8080)

## Generated from AsyncAPI

This server was generated from an AsyncAPI specification. The original spec defines:

- **Title**: ${title}
- **Version**: ${info.version() || '1.0.0'}
- **Description**: ${info.description() || 'No description provided'}
- **Protocols**: ${Array.from(protocols).join(', ') || 'generic'}
`}
        </File>
    );
}
