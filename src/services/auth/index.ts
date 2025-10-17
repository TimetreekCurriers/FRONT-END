import axios from "axios";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const login = async (email: string, password: string) => {
  const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/auth/login`, {
    email,
    password,
  }, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY, 
    },
  });
  return data;
};
