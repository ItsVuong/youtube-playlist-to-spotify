import "express-session";

declare module "express-session" {
  interface SessionData {
    spotify?: {
      access_token: string;
      refresh_token: string;
    }
  }
}
