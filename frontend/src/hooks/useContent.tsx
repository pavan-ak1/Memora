import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

type ContentType = {
   _id: string;
  title: string;
  type: "twitter" | "youtube";
  link: string;
};

export function useContent(refreshFlag: boolean) {
  const [contents, setContents] = useState<ContentType[]>([]);
  

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/contents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
       
        setContents(response.data.contents || []);
      })
      .catch((err) => {
        console.error("Failed to fetch contents:", err);
      });
  }, [refreshFlag]);

  return contents;
}
