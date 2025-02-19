import { CourseCardType, CourseType } from "@/schemaValidation/course.schema";

export interface CourseParamsRequestType {
  slug: string;
}

export interface CourseResType {
  data: CourseType;
  message: string;
  headerPageInfo: {
    title: string;
    [key: string]: string;
  };
}

export interface CourseListResType {
  data: Array<CourseCardType>;
  headerPageInfo: {
    title: string;
    description: string;
    bg_image?: string;
    [key: string]: any;
  };
  totalPage: number;
  message: string;
}
