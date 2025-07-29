import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import { Card, type ContentType } from "../components/Card";
import { SideBar } from "../components/SideBar";

interface SharedContent {
  _id: string;
  title: string;
  link: string;
  type?: string;
  createdAt: string;
}

export function SharedBrain() {
  const { shareLink } = useParams();
  const [sharedContent, setSharedContent] = useState<SharedContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [sharedAt, setSharedAt] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!shareLink) {
      setError("No share link provided.");
      setIsLoading(false);
      return;
    }

    const fetchSharedContent = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        console.log(`Fetching shared content from: ${BACKEND_URL}/api/v1/shared/${shareLink}`);
        
        // Use fetch instead of axios to ensure no auth headers are sent
        const response = await fetch(`${BACKEND_URL}/api/v1/shared/${shareLink}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          credentials: 'omit' // This ensures no cookies are sent
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shared content');
        }
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load shared content');
        }
        
        const { content, username, sharedAt } = data;
        
        if (!username) {
          throw new Error('No username found in response');
        }
        
        setOwner(username);
        setSharedContent(Array.isArray(content) ? content : []);
        setSharedAt(sharedAt);
      } catch (error) {
        console.error("Error fetching shared content:", error);
        setError(error instanceof Error ? error.message : "Failed to load shared content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedContent();
  }, [shareLink]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Function to determine content type from URL with proper return type
  const getContentType = (url: string): ContentType => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    } else if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return 'image';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return 'video';
    } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
      return 'audio';
    } else if (url.match(/\.(pdf)$/i)) {
      return 'pdf';
    }
    return 'link'; // Default to link
  };

  // Format the shared date if available
  const formattedDate = sharedAt ? new Date(sharedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with fixed height */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                ) : error ? 'Shared Content' : `Shared by ${owner}`}
              </h1>
              {!isLoading && !error && sharedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Shared on {formattedDate}
                </p>
              )}
            </div>
            {!error && (
              <button
                onClick={copyToClipboard}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] text-center justify-center"
              >
                {isLoading ? (
                  'Loading...'
                ) : isCopied ? (
                  'Copied!'
                ) : (
                  'Copy Link'
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          // Loading skeleton that matches the content layout
          <div className="space-y-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Content</h2>
              <p className="text-gray-600 mb-6">
                {error.includes('invalid') || error.includes('expired') 
                  ? 'The link you followed may be broken or the content may have been removed.' 
                  : 'An error occurred while loading the content. Please try again.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Try Again
                </button>
                <a
                  href="/"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Go to Home
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Success state - show shared content
          <div className="space-y-6">
            {sharedContent.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No content to display</h3>
                <p className="mt-1 text-gray-500">The owner hasn't shared any content yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedContent.map((item) => (
                  <Card
                    key={item._id}
                    id={item._id}
                    title={item.title}
                    link={item.link}
                    type={item.type as ContentType || getContentType(item.link)}
                    onDelete={() => {}}
                    showDelete={false}
                    onEdit={() => {}}
                    showEdit={false}
                    onToggleShare={() => {}}
                    showShare={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );

  // Error State
  if (error) {
    const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Content</h2>
          <p className="text-gray-600 mb-6">
            {errorMessage.includes('invalid') || errorMessage.includes('expired') 
              ? 'The link you followed may be broken or the content may have been removed.' 
              : 'An error occurred while loading the content. Please try again.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SideBar />
      <div className="p-4 ml-72">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {owner}'s Shared Brain
              </h1>
              {sharedAt && (
                <p className="text-gray-500 text-sm">
                  Shared {new Date(sharedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={copyToClipboard}
                className={`flex items-center px-4 py-2 rounded-md ${isCopied ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} transition-colors`}
                title="Copy share link"
              >
                {isCopied ? (
                  <>
                    <span className="mr-2">✓ Copied!</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔗</span>
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {sharedContent.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No content shared yet</h3>
            <p className="text-gray-500">This user hasn't shared any content yet.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700">
                {sharedContent.length} {sharedContent.length === 1 ? 'Item' : 'Items'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedContent.map((item) => {
                const type = getContentType(item.link);
                return (
                  <Card 
                    key={item._id}
                    id={item._id}
                    title={item.title}
                    link={item.link}
                    type={type}
                    className="h-full"
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
