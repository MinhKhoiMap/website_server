import {
  ProjectType,
  PublicationType,
} from "@/schemaValidation/research.schema";

export interface ResearchParamsRequestType {
  slug: string;
}

export interface ResearchResType<T = ProjectType | PublicationType> {
  data: T;
  message: string;
  headerPageInfo: {
    title: string;
    [key: string]: string;
  };
}

export interface ResearchListResType<T = ProjectType | PublicationType> {
  data: Array<T>;
  headerPageInfo: {
    title: string;
    description: string;
    bg_image?: string;
    [key: string]: any;
  };
  message: string;
}

export interface CreateUpdateResearchResType {
  message: string;
  data: ProjectType | PublicationType;
}
