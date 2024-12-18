#!/bin/bash

# Script name: run-auth-server.sh

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if MongoDB is running locally
check_mongodb() {
    if ! nc -z localhost 27017 >/dev/null 2>&1; then
        echo -e "${RED}MongoDB is not running. Please start MongoDB first.${NC}"
        echo -e "${YELLOW}You can start MongoDB with: brew services start mongodb-community${NC}"
        exit 1
    else
        echo -e "${GREEN}MongoDB is running${NC}"
    fi
}

# Function to check if Redis is running locally
check_redis() {
    if ! nc -z localhost 6379 >/dev/null 2>&1; then
        echo -e "${RED}Redis is not running. Please start Redis first.${NC}"
        echo -e "${YELLOW}You can start Redis with: brew services start redis${NC}"
        exit 1
    else
        echo -e "${GREEN}Redis is running${NC}"
    fi
}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port 9000 is already in use. Attempting to kill the process...${NC}"
        lsof -ti:9000 | xargs kill -9
        sleep 2
    fi
}

# Function to generate Maven wrapper if it doesn't exist
ensure_maven_wrapper() {
    if [ ! -f "mvnw" ]; then
        echo -e "${YELLOW}Generating Maven wrapper...${NC}"
        mvn -N wrapper:wrapper
    fi
}

# Function to clean and compile the project
compile_project() {
    echo -e "${YELLOW}Compiling project...${NC}"
    ./mvnw clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo -e "${RED}Compilation failed!${NC}"
        exit 1
    fi
}

# Function to run the application
run_application() {
    echo -e "${GREEN}Starting Auth Server...${NC}"
    ./mvnw spring-boot:run
}

# Main execution
main() {
    # Navigate to auth-server directory if not already there
    if [[ ! -f "pom.xml" ]]; then
        if [[ -d "auth-server" ]]; then
            cd auth-server
        else
            echo -e "${RED}Cannot find auth-server directory!${NC}"
            exit 1
        fi
    fi

    # Check prerequisites
    check_mongodb
    check_redis
    check_port
    ensure_maven_wrapper
    
    # Compile and run
    compile_project
    run_application
}

# Trap Ctrl+C and cleanup
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    exit 0
}
trap cleanup SIGINT

# Execute main function
main

