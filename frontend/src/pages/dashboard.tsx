import { useState, useCallback } from "react";
import { Card } from "../components/Card";
import { CreateContentModel } from "../components/createContentModel";
import { PlusIcon } from "../icons/plusIcon";
import { SideBar } from "../components/SideBar";
import { useContent } from "../hooks/useContent";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Share2 } from 'lucide-react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    className?: string;
  }
}

// Card component props are defined in the Card component file
interface ContentItem {
  _id: string;
  title: string;
  link: string;
  type?: string;
  user?: {
    username: string;
  };
}

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const allContents = useContent(refreshFlag) as ContentItem[];

  const getContentType = useCallback((link: string): "youtube" | "twitter" => {
    if (!link) return "youtube";
    if (link.includes("youtube.com") || link.includes("youtu.be")) return "youtube";
    if (link.includes("twitter.com") || link.includes("x.com")) return "twitter";
    return "youtube";
  }, []);

  // Alert function with proper cleanup
  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const alertElement = document.createElement("div");
    alertElement.textContent = message;
    alertElement.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    
    document.body.appendChild(alertElement);
    
    const timer = setTimeout(() => {
      if (document.body.contains(alertElement)) {
        document.body.removeChild(alertElement);
      }
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      if (document.body.contains(alertElement)) {
        document.body.removeChild(alertElement);
      }
    };
  }, []);

  const handleShareToggle = useCallback(async () => {
    try {
      console.log('Initiating share request...');
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const requestData = { share: true };
      const requestUrl = `${BACKEND_URL}/api/v1/share`;
      
      console.log('Sending request to:', requestUrl);
      console.log('Request data:', requestData);
      
      // Add a loading state
      showAlert('Generating share link...', 'info');
      
      const response = await axios.post<{ 
        hash?: string; 
        message?: string; 
        error?: string 
      }>(
        requestUrl,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          validateStatus: (status) => status < 500, // Don't throw for 4xx errors
          timeout: 10000, // 10 second timeout
        }
      );
      
      console.log('Share response:', response);
      
      if (response.status === 200 || response.status === 201) {
        if (response.data?.hash) {
          const shareableLink = `${window.location.origin}/shared/${response.data.hash}`;
          console.log('Generated shareable link:', shareableLink);
          
          try {
            await navigator.clipboard.writeText(shareableLink);
            showAlert("✅ Shareable link copied to clipboard!", 'success');
          } catch (clipboardError: unknown) {
            console.error('Failed to copy to clipboard:', clipboardError);
            showAlert(`🔗 Share link: ${shareableLink}`, 'info');
          }
          
          // Also log to console for debugging
          console.log('Shareable link:', shareableLink);
          
        } else if (response.data?.message?.includes("disabled")) {
          showAlert("🔒 Sharing has been disabled", 'info');
        } else {
          console.error('Unexpected response format:', response.data);
          throw new Error("The server returned an unexpected response format.");
        }
      } else {
        // Handle different status codes appropriately
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('The share endpoint was not found. Please check the URL.');
        } else {
          throw new Error(response.data?.message || 
                         response.data?.error || 
                         `Request failed with status ${response.status}`);
        }
      }
    } catch (error: unknown) {
      console.error("Failed to generate shareable link:", error);
      
      let errorMessage = "Failed to generate shareable link. Please try again.";
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timed out. Please check your connection and try again.";
        } else if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { status, data } = error.response;
          errorMessage = data?.message || data?.error || 
                        `Server responded with status ${status}`;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "No response from server. Please check your connection.";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      showAlert(`❌ ${errorMessage}`, 'error');
    }
  }, [showAlert]);

  const handleDeleteContent = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/v1/contents/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setRefreshFlag(prev => !prev);
      showAlert("Content deleted successfully!");
    } catch (error: unknown) {
      console.error("Error deleting content:", error);
      showAlert("Failed to delete content. Please try again.", 'error');
    }
  }, [showAlert]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />
      <div className="p-4 sm:ml-64">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">My Content</h1>
            <div className="flex gap-3">
              <button
                onClick={handleShareToggle}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Generate shareable link for all content"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share All
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                aria-label="Add new content"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Content
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allContents.map((content: ContentItem) => {
                // Create a wrapper div to handle the share functionality
                const card = (
                  <Card
                    key={content._id}
                    id={content._id}
                    title={content.title}
                    link={content.link}
                    type={getContentType(content.link)}
                    onDelete={() => handleDeleteContent(content._id)}
                  />
                );
                
                // Wrap the card in a div with click handler for share
                return (
                  <div 
                    key={content._id} 
                    className="cursor-pointer"
                    onClick={handleShareToggle}
                    title="Click to copy share link"
                  >
                    {card}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Content Modal */}
      <CreateContentModel
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setRefreshFlag(prev => !prev);
        }}
      />
    </div>
  );
}