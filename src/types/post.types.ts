import { PostCardType, PostType } from "@/schemaValidation/post.schema";

export interface PostResType {
  data: PostType;
  message: string;
  headerPageInfo: {
    title: string;
    [key: string]: string;
  };
}

export interface PostParamsRequestType {
  slug: string;
}

export interface PostParamsRequestType {
  title: string;
}

export interface PostListResType {
  data: Array<PostCardType>;
  headerPageInfo: {
    title: string;
    description: string;
    bg_image: string;
    [key: string]: any;
  };
  totalPage: number;
  message: string;
}

export interface CreateUpdateResType {
  message: string;
  data: PostType;
}
