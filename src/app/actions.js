"use server";

import { cookies } from "next/headers";
import { xmlToJsonUtil } from "xml-to-json-util";

const DJ_URL = "https://www.deadjournal.com/interface/xmlrpc";
const USERNAME = "username";
const PASSWORD = "password";
const LJ_MASTER_SESSION = "ljmastersession";
const LJ_LOGGED_IN = "ljloggedin";
const COOKIE_OPTIONS = {
     httpOnly: true,
     secure: true,
};

export async function login(formData) {
     try {
          const username = formData.get(USERNAME);
          const password = formData.get(PASSWORD);

          const session = await generateSession(username, password);
          const sessionLoginId = extractSessionLoginId(session);

          cookies().set(LJ_MASTER_SESSION, session, COOKIE_OPTIONS);
          cookies().set(LJ_LOGGED_IN, sessionLoginId, COOKIE_OPTIONS);

          const userData = await getUserData(username);
          console.log(userData);
     } catch (err) {
          throw err;
     }
}

export async function logout() {
     if (cookies().has(LJ_MASTER_SESSION)) {
          cookies().delete(LJ_MASTER_SESSION);
     }
     if (cookies().has(LJ_LOGGED_IN)) {
          cookies().delete(LJ_LOGGED_IN);
     }
}

async function getMethodResponse(response) {
     const xml = await response.text();
     const methodResponse = xmlToJsonUtil(xml).methodResponse;
     if (methodResponse.fault) {
          throw new Error(
               methodResponse.fault.value.struct.member[0].value.string ??
                    "Failed to get method response"
          );
     }
     return methodResponse;
}

async function generateSession(username, password) {
     const response = await fetch(DJ_URL, {
          method: "POST",
          headers: {
               "Content-Type": "text/xml",
          },
          body: `<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>LJ.XMLRPC.sessiongenerate</methodName><params><param><value><struct><member><name>ver</name><value><i4>1</i4></value></member><member><name>password</name><value><string>${password}</string></value></member><member><name>username</name><value><string>${username}</string></value></member><member><name>expiration</name><value><string>short</string></value></member></struct></value></param></params></methodCall>`,
     });
     if (!response.ok) {
          throw new Error("Failed to generate session");
     }
     const methodResponse = await getMethodResponse(response);
     const session =
          methodResponse.params.param.value.struct.member.value.string;
     return session;
}

function extractSessionLoginId(session) {
     const pattern = /u\d+:s\d+/;
     const match = session.match(pattern);
     if (!match) {
          throw new Error("Failed to extract session login id");
     }
     const sessionLoginId = match[0];
     return sessionLoginId;
}

async function getUserData(username) {
     const ljMasterSession = cookies().get(LJ_MASTER_SESSION);
     const ljLoggedIn = cookies().get(LJ_LOGGED_IN);
     const response = await fetch(DJ_URL, {
          method: "POST",
          headers: {
               "Content-Type": "text/xml",
               "X-LJ-Auth": "cookie",
               Cookie: `${ljMasterSession.name}=${ljMasterSession.value}; ${ljLoggedIn.name}=${ljLoggedIn.value}`,
          },
          body: `<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>LJ.XMLRPC.login</methodName><params><param><value><struct><member><name>ver</name><value><i4>1</i4></value></member><member><name>getpickwurls</name><value><i4>1</i4></value></member><member><name>getmenus</name><value><i4>1</i4></value></member><member><name>auth_method</name><value><string>cookie</string></value></member><member><name>username</name><value><string>${username}</string></value></member></struct></value></param></params></methodCall>`,
     });
     if (!response.ok) {
          throw new Error("Failed to retrieve user data");
     }
     const methodResponse = await getMethodResponse(response);
     const userData = methodResponse.params.param.value.struct.member;
     return userData;
}
