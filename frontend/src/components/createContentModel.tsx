import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Buttons";
import { useRef, useState } from "react";
import { Input } from "./Input";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Alert } from "./Alert";

//  @ts-ignore
enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter"
}

export function CreateContentModel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState(ContentType.Youtube);
  const [alert, setAlert] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  async function addContent() {
    const title = titleRef.current?.value?.trim();
    const link = linkRef.current?.value?.trim();

    if (!title || !link) {
      setAlert({ message: "Please enter both title and link.", type: 'error' });
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/contents`,
        { title, link, type },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAlert({ message: "Content added successfully!", type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to add content:", error);
      setAlert({ message: "Failed to add content. Please try again.", type: 'error' });
    }
  }

  return (
    <>
      {alert && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)}
        />
      )}
      {open && (
        <div className="w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-50 bg-black bg-opacity-40">
          <div className="bg-white p-4 rounded-xl shadow-xl w-96">
            <div className="flex justify-end mb-4">
              <div onClick={onClose} className="cursor-pointer">
                <CrossIcon />
              </div>
            </div>
            <div className="space-y-2">
              <Input ref={titleRef} placeholder="Title" />
              <Input ref={linkRef} placeholder="Link" />
            </div>
            <div className="mt-4">
              <h1 className="font-semibold text-gray-700">Types</h1>
              <div className="flex gap-2 p-2">
                <Button
                  text="Youtube"
                  variant={
                    type === ContentType.Youtube ? "primary" : "secondary"
                  }
                  onClick={() => setType(ContentType.Youtube)}
                />
                <Button
                  text="Twitter"
                  variant={
                    type === ContentType.Twitter ? "primary" : "secondary"
                  }
                  onClick={() => setType(ContentType.Twitter)}
                />
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <Button
                variant="primary"
                text="Submit"
                startIcon={<></>}
                onClick={addContent}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
