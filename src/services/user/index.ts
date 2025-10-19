// src/services/userApi.ts
import axios from "axios";
import type { UserCollectionInterface } from "@/type/user.interface";
import { PageMetaDto } from "@/type/general";
import * as multer from "multer";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const getUser = async (
  userid: string
): Promise<UserCollectionInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/user/${userid}`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });
  return data;
};

export const findAllUsers = async (
  userid: string,
  pagination: { page: number; perpage: number },
  search: string
): Promise<PageMetaDto<UserCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/user/all`,
    { userid, pagination, search },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const updateUser = async (
  userid: string,
  user?: UserCollectionInterface
): Promise<UserCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/user/${userid}`,
    user,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};
export const inviteUser = async (
  name: string,
  email: string
): Promise<UserCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/invite`,
    { name,email },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const register = async (
  token: string,
  user: Partial<UserCollectionInterface>
): Promise<UserCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/invite/accept`,
    { user, token },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const uploadTaxCertificate = async (
  userid: string,
  formData: any
): Promise<UserCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/user/certificate/${userid}`,
    formData,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};
