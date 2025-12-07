// Active Directory / Azure AD Authentication Module
// Supports both Azure AD OAuth2 and LDAP authentication

import jwt from "jsonwebtoken";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "awash-bank-risk-management-secret-key-change-in-production";

// Azure AD configuration
const AZURE_AD_CONFIG = {
  tenantId: process.env.AZURE_AD_TENANT_ID || "",
  clientId: process.env.AZURE_AD_CLIENT_ID || "",
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
  redirectUri: process.env.AZURE_AD_REDIRECT_URI || "http://localhost:5000/api/auth/ad/callback",
};

// LDAP configuration
const LDAP_CONFIG = {
  url: process.env.LDAP_URL || "ldap://localhost:389",
  baseDN: process.env.LDAP_BASE_DN || "dc=awashbank,dc=com",
  bindDN: process.env.LDAP_BIND_DN || "",
  bindPassword: process.env.LDAP_BIND_PASSWORD || "",
};

export interface ADUserInfo {
  email: string;
  name: string;
  department: string;
  role?: string;
}

// Azure AD OAuth2 flow
export function getAzureADAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: AZURE_AD_CONFIG.clientId,
    response_type: "code",
    redirect_uri: AZURE_AD_CONFIG.redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state: generateState(),
  });
  
  return `https://login.microsoftonline.com/${AZURE_AD_CONFIG.tenantId}/oauth2/v2.0/authorize?${params}`;
}

// Exchange authorization code for access token
export async function exchangeAzureADCode(code: string): Promise<ADUserInfo> {
  try {
    // Exchange code for token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${AZURE_AD_CONFIG.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: AZURE_AD_CONFIG.clientId,
          client_secret: AZURE_AD_CONFIG.clientSecret,
          code,
          redirect_uri: AZURE_AD_CONFIG.redirectUri,
          grant_type: "authorization_code",
        }),
      }
    );
    
    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange authorization code");
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Get user profile from Microsoft Graph
    const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!profileResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }
    
    const profile = await profileResponse.json();
    
    return {
      email: profile.mail || profile.userPrincipalName,
      name: profile.displayName,
      department: profile.department || "General",
      role: mapADRoleToAppRole(profile.jobTitle),
    };
  } catch (error) {
    console.error("Azure AD authentication error:", error);
    throw new Error("Azure AD authentication failed");
  }
}

// LDAP authentication (simplified - requires ldapjs package for full implementation)
export async function authenticateLDAP(username: string, password: string): Promise<ADUserInfo> {
  // Note: This is a placeholder. Full LDAP implementation requires ldapjs package
  // For production, install: npm install ldapjs @types/ldapjs
  
  throw new Error("LDAP authentication not fully implemented. Please use Azure AD or install ldapjs.");
  
  // Example implementation with ldapjs:
  /*
  const ldap = require('ldapjs');
  const client = ldap.createClient({ url: LDAP_CONFIG.url });
  
  return new Promise((resolve, reject) => {
    const userDN = `uid=${username},${LDAP_CONFIG.baseDN}`;
    
    client.bind(userDN, password, (err) => {
      if (err) {
        client.unbind();
        return reject(new Error('Invalid credentials'));
      }
      
      // Search for user attributes
      client.search(userDN, { scope: 'base' }, (err, res) => {
        let userInfo: ADUserInfo | null = null;
        
        res.on('searchEntry', (entry) => {
          const attrs = entry.object;
          userInfo = {
            email: attrs.mail,
            name: attrs.cn,
            department: attrs.department || 'General',
            role: mapADRoleToAppRole(attrs.title),
          };
        });
        
        res.on('end', () => {
          client.unbind();
          if (userInfo) {
            resolve(userInfo);
          } else {
            reject(new Error('User not found'));
          }
        });
        
        res.on('error', (err) => {
          client.unbind();
          reject(err);
        });
      });
    });
  });
  */
}

// Map AD job title/role to application role
function mapADRoleToAppRole(jobTitle?: string): string {
  if (!jobTitle) return "business_user";
  
  const title = jobTitle.toLowerCase();
  
  if (title.includes("admin") || title.includes("administrator")) {
    return "risk_admin";
  }
  if (title.includes("auditor") || title.includes("audit")) {
    return "auditor";
  }
  if (title.includes("reviewer") || title.includes("review")) {
    return "reviewer";
  }
  if (title.includes("manager") || title.includes("director") || title.includes("head")) {
    return "risk_admin";
  }
  
  return "business_user";
}

// Generate state parameter for OAuth2
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create or update user from AD info
export async function syncADUser(adUserInfo: ADUserInfo): Promise<any> {
  // Check if user exists
  let user = await storage.getUserByEmail(adUserInfo.email);
  
  if (user) {
    // Update existing user
    user = await storage.updateUser(user.id, {
      name: adUserInfo.name,
      department: adUserInfo.department,
      role: adUserInfo.role || user.role,
    });
  } else {
    // Create new user (no password needed for AD users)
    user = await storage.createUser({
      email: adUserInfo.email,
      name: adUserInfo.name,
      department: adUserInfo.department,
      role: adUserInfo.role || "business_user",
      passwordHash: "", // AD users don't need password
    });
  }
  
  return user;
}

// Generate JWT token for AD user
export function generateADToken(user: any): string {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      department: user.department,
      authMethod: "ad",
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

// Check if AD authentication is configured
export function isADConfigured(): boolean {
  return !!(AZURE_AD_CONFIG.tenantId && AZURE_AD_CONFIG.clientId && AZURE_AD_CONFIG.clientSecret);
}
