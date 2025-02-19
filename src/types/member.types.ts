import { MemberCardType, MemberType } from "@/schemaValidation/member.schema";

export interface MemberParamsRequestType {
  slug: string;
}

export interface MemberResType {
  data: MemberType;
  message: string;
  headerPageInfo: {
    title: string;
    [key: string]: string;
  };
}

export interface MemberListResType {
  data: Array<MemberCardType>;
  headerPageInfo: {
    title: string;
    description: string;
    bg_image?: string;
    [key: string]: any;
  };
  totalPage: number;
  message: string;
}

export interface CreateUpdateMemberResType {
  data: MemberType;
  message: string;
}
