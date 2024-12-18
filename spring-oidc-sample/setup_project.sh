#!/bin/bash

# Create root directory structure
mkdir -p auth-system
cd auth-system

# Create directories for all components
mkdir -p {auth-server,resource-server,react-client,nextjs-client}

# Create auth-server structure (Spring Boot OAuth2 Server)
mkdir -p auth-server/src/main/java/com/whitestartups/authserver/{config,controller,model,repository,service,exception,dto,security,util}
mkdir -p auth-server/src/main/resources/{templates,static}
mkdir -p auth-server/src/test/java/com/whitestartups/authserver

# Create auth-server pom.xml
cat << 'EOF' > auth-server/pom.xml
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
    <artifactId>auth-server</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>auth-server</name>
    <description>WhiteStartups OAuth2/OIDC Authorization Server</description>
    
    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
        <jjwt.version>0.11.5</jjwt.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <lombok.version>1.18.30</lombok.version>
    </properties>
    
    <!-- ... rest of pom.xml content remains the same ... -->
EOF

# Create MongoDB configuration
cat << 'EOF' > auth-server/src/main/java/com/whitestartups/authserver/config/MongoConfig.java
package com.whitestartups.authserver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.whitestartups.authserver.repository")
@EnableMongoAuditing
public class MongoConfig {
}
EOF

# Create Redis configuration
cat << 'EOF' > auth-server/src/main/java/com/whitestartups/authserver/config/RedisConfig.java
package com.whitestartups.authserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@Configuration
@EnableRedisHttpSession
public class RedisConfig {
    // ... Redis configuration content remains the same ...
}
EOF

# Create main application class
cat << 'EOF' > auth-server/src/main/java/com/whitestartups/authserver/AuthServerApplication.java
package com.whitestartups.authserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServerApplication.class, args);
    }
}
EOF

# Update React OIDC configuration
cat << 'EOF' > react-client/src/utils/auth-config.ts
import { UserManager, UserManagerSettings } from 'oidc-client-ts';

const oidcConfig: UserManagerSettings = {
  authority: 'http://localhost:9000',
  client_id: 'whitestartups-react-client',
  redirect_uri: 'http://localhost:3000/callback',
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: 'http://localhost:3000',
  silent_redirect_uri: 'http://localhost:3000/silent-renew',
  automaticSilentRenew: true,
};

export const userManager = new UserManager(oidcConfig);
EOF

# Update Next.js OIDC configuration
cat << 'EOF' > nextjs-client/src/lib/auth.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authOptions = {
  providers: [
    {
      id: 'whitestartups-oidc',
      name: 'WhiteStartups OIDC',
      type: 'oauth',
      wellKnown: 'http://localhost:9000/.well-known/openid-configuration',
      clientId: 'whitestartups-nextjs-client',
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      authorization: { params: { scope: 'openid profile email' } },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
EOF

# Create application.yml with WhiteStartups configuration
cat << 'EOF' > auth-server/src/main/resources/application.yml
server:
  port: 9000

spring:
  application:
    name: whitestartups-auth-server
  data:
    mongodb:
      host: localhost
      port: 27017
      database: whitestartups_oauth2
      authentication-database: admin
  redis:
    host: localhost
    port: 6379
  session:
    store-type: redis
    redis:
      namespace: whitestartups:session
      flush-mode: on_save
      repository-type: indexed
  security:
    oauth2:
      authorizationserver:
        issuer: http://localhost:9000
        client:
          mongodb:
            collection: oauth2_clients
        authorization:
          mongodb:
            collection: oauth2_authorizations
        token:
          mongodb:
            collection: oauth2_tokens
        device-code:
          mongodb:
            collection: oauth2_device_codes

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized

logging:
  level:
    com.whitestartups: DEBUG
    org.springframework.security: DEBUG
    org.springframework.security.oauth2: DEBUG
    org.springframework.data.mongodb: DEBUG
    org.springframework.data.redis: DEBUG
EOF

# Create docker-compose.yml
cat << 'EOF' > docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: whitestartups
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-secretpassword}
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD:-secretpassword}
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
EOF

# Create .env file
cat << 'EOF' > .env
MONGO_PASSWORD=secretpassword
REDIS_PASSWORD=secretpassword
OIDC_CLIENT_SECRET=your-secure-client-secret
EOF

# Add .env to .gitignore
echo ".env" >> .gitignore

echo "Project structure created successfully with WhiteStartups naming!"
echo "To start the infrastructure:"
echo "docker-compose up -d"
echo ""
echo "To build the auth server:"
echo "cd auth-server && ./mvnw clean install"
echo ""
echo "To start the React client:"
echo "cd react-client && npm install && npm start"
echo ""
echo "To start the Next.js client:"
echo "cd nextjs-client && npm install && npm run dev"

