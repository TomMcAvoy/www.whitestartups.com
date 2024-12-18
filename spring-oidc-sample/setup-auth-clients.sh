#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="spring-oidc-sample"
AUTH_SYSTEM_DIR="$BASE_DIR/auth-system"
CLIENT_SYSTEM_DIR="$BASE_DIR/client-system"

# Function to check if directory exists
check_dir() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}Directory $1 does not exist${NC}"
        return 1
    fi
    return 0
}

# Function to create client application structure
create_client_app() {
    local client_name=$1
    local port=$2
    
    echo -e "${YELLOW}Creating client application: $client_name on port $port${NC}"
    
    # Create client directory
    mkdir -p "$CLIENT_SYSTEM_DIR/$client_name/src/main/java/com/whitestartups/client"
    mkdir -p "$CLIENT_SYSTEM_DIR/$client_name/src/main/resources"
    
    # Create pom.xml
    cat << EOF > "$CLIENT_SYSTEM_DIR/$client_name/pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.whitestartups</groupId>
    <artifactId>$client_name</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>$client_name</name>
    <description>OAuth2/OIDC Client Application</description>
    
    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.thymeleaf.extras</groupId>
            <artifactId>thymeleaf-extras-springsecurity6</artifactId>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>\${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
EOF

    # Create application.yml
    cat << EOF > "$CLIENT_SYSTEM_DIR/$client_name/src/main/resources/application.yml"
server:
  port: $port

spring:
  application:
    name: $client_name
  security:
    oauth2:
      client:
        registration:
          whitestartups:
            client-id: $client_name
            client-secret: secret
            scope:
              - openid
              - profile
              - email
            authorization-grant-type: authorization_code
            redirect-uri: http://localhost:$port/login/oauth2/code/whitestartups
        provider:
          whitestartups:
            issuer-uri: http://localhost:9000
EOF

    # Create main application class
    cat << EOF > "$CLIENT_SYSTEM_DIR/$client_name/src/main/java/com/whitestartups/client/ClientApplication.java"
package com.whitestartups.client;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClientApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClientApplication.class, args);
    }
}
EOF

    # Create security config
    cat << EOF > "$CLIENT_SYSTEM_DIR/$client_name/src/main/java/com/whitestartups/client/SecurityConfig.java"
package com.whitestartups.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/oauth2/authorization/whitestartups")
            )
            .build();
    }
}
EOF

    # Create controller
    cat << EOF > "$CLIENT_SYSTEM_DIR/$client_name/src/main/java/com/whitestartups/client/HomeController.java"
package com.whitestartups.client;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model, @AuthenticationPrincipal OidcUser principal) {
        if (principal != null) {
            model.addAttribute("profile", principal.getClaims());
        }
        return "home";
    }
}
EOF

    # Create templates
    mkdir -p "$CLIENT_SYSTEM_DIR/$client_name/src/main/resources/templates"
    
    # Create home.html template
    cat << EOF > "$CLIENT_SYSTEM_DIR/$client_name/src/main/resources/templates/home.html"
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org" xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity6">
<head>
    <title>Spring Security OIDC Client</title>
    <meta charset="utf-8" />
</head>
<body>
    <h1>Spring Security OIDC Client</h1>
    <div sec:authorize="!isAuthenticated()">
        <a th:href="@{/oauth2/authorization/whitestartups}">Log in</a>
    </div>
    <div sec:authorize="isAuthenticated()">
        <p>Welcome, <span sec:authentication="name">Username</span></p>
        <div th:if="${profile}">
            <h2>User Profile</h2>
            <dl th:each="claim : ${profile}">
                <dt th:text="${claim.key}">claim</dt>
                <dd th:text="${claim.value}">value</dd>
            </dl>
        </div>
        <form th:action="@{/logout}" method="post">
            <input type="submit" value="Logout" />
        </form>
    </div>
</body>
</html>
EOF

    echo -e "${GREEN}Created client application: $client_name${NC}"
}

# Main script execution
echo -e "${YELLOW}Setting up OAuth2/OIDC system...${NC}"

# Create client applications
create_client_app "client-app-1" "8080"
create_client_app "client-app-2" "8081"

# Generate Maven wrapper for clients
cd "$CLIENT_SYSTEM_DIR/client-app-1" && mvn -N wrapper:wrapper
cd "$CLIENT_SYSTEM_DIR/client-app-2" && mvn -N wrapper:wrapper

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}To register clients in the authorization server, add the following to your client configuration:${NC}"
echo -e "
Client 1:
- Client ID: client-app-1
- Client Secret: secret
- Redirect URI: http://localhost:8080/login/oauth2/code/whitestartups

Client 2:
- Client ID: client-app-2
- Client Secret: secret
- Redirect URI: http://localhost:8081/login/oauth2/code/whitestartups
"

echo -e "${YELLOW}To run the clients:${NC}"
echo "cd $CLIENT_SYSTEM_DIR/client-app-1 && ./mvnw spring-boot:run"
echo "cd $CLIENT_SYSTEM_DIR/client-app-2 && ./mvnw spring-boot:run"

