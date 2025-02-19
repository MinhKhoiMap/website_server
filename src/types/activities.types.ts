import {
  ActivitiesCardType,
  ActivityBookletType,
  ActivityPostType,
} from "@/schemaValidation/activities.schema";

export interface ActivitiesParamsRequestType {
  slug: string;
}

export interface ActivitiesResType {
  data: ActivityBookletType | ActivityPostType;
  headerPageInfo: {
    title: string;
    [key: string]: any;
  };
  message: string;
}

export interface ActivitiesListResType {
  data: Array<ActivitiesCardType>;
  headerPageInfo: {
    title: string;
    description?: string;
    bg_image?: string;
    [key: string]: any;
  };
  totalPage: number;
  message: string;
}
