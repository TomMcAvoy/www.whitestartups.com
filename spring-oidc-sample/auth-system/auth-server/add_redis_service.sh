#!/bin/bash

# Create the LaunchAgents directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Create the plist file for redis-stack-server
cat << 'EOF' > ~/Library/LaunchAgents/com.redis-stack-server.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.redis-stack-server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/redis-stack-server</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/opt/homebrew/var/db/redis-stack</string>
    <key>StandardErrorPath</key>
    <string>/opt/homebrew/var/log/redis-stack-server.log</string>
    <key>StandardOutPath</key>
    <string>/opt/homebrew/var/log/redis-stack-server.log</string>
</dict>
</plist>
EOF

# Create required directories
sudo mkdir -p /opt/homebrew/var/db/redis-stack
sudo mkdir -p /opt/homebrew/var/log

# Set proper permissions
sudo chown -R $USER:staff /opt/homebrew/var/db/redis-stack
sudo chown -R $USER:staff /opt/homebrew/var/log

# Create log file with proper permissions
touch /opt/homebrew/var/log/redis-stack-server.log
chmod 644 /opt/homebrew/var/log/redis-stack-server.log

# Load the service
launchctl load ~/Library/LaunchAgents/com.redis-stack-server.plist

# Create service management script
cat << 'EOF' > ~/redis-service.sh
#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_redis() {
    nc -z localhost 6379 >/dev/null 2>&1
    return $?
}

case "$1" in
    start)
        if check_redis; then
            echo -e "${YELLOW}Redis Stack is already running${NC}"
        else
            echo -e "${GREEN}Starting Redis Stack...${NC}"
            launchctl load ~/Library/LaunchAgents/com.redis-stack-server.plist
        fi
        ;;
    stop)
        if check_redis; then
            echo -e "${YELLOW}Stopping Redis Stack...${NC}"
            launchctl unload ~/Library/LaunchAgents/com.redis-stack-server.plist
        else
            echo -e "${RED}Redis Stack is not running${NC}"
        fi
        ;;
    restart)
        echo -e "${YELLOW}Restarting Redis Stack...${NC}"
        launchctl unload ~/Library/LaunchAgents/com.redis-stack-server.plist
        sleep 2
        launchctl load ~/Library/LaunchAgents/com.redis-stack-server.plist
        ;;
    status)
        if check_redis; then
            echo -e "${GREEN}Redis Stack is running${NC}"
            redis-cli info server | grep version
        else
            echo -e "${RED}Redis Stack is not running${NC}"
        fi
        ;;
    logs)
        if [ -f /opt/homebrew/var/log/redis-stack-server.log ]; then
            tail -f /opt/homebrew/var/log/redis-stack-server.log
        else
            echo -e "${RED}Log file not found${NC}"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

# Make the service script executable
chmod +x ~/redis-service.sh

echo "Service definition and management script have been created."
echo "You can now use: ~/redis-service.sh {start|stop|restart|status|logs}"

