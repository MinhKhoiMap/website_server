import path from "path";
import envConfig from "@/../config";

export const contentDir = path.normalize(envConfig.CONTENTS_UPLOAD_FOLDER);

export const TokenType = {
  SessionToken: "sessionToken",
} as const;

export const postPerPage = 6;

export const categoryCase = {
  news: 0,
  evolvingResearch: 1,
  voiceFromPublic: 2,
  openAdmission: 3,
};
