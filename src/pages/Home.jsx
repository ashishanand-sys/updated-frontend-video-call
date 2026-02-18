import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const createStream = () => {
    const streamId = crypto.randomUUID();
    navigate(`/stream/${streamId}?role=host`);
  };

  return (
    <div className=" flex flex-col items-start justify-start px-10 py-16 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Live Video Streaming
      </h1>

      <button
        onClick={createStream}
        className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-lg font-medium transition duration-200"
      >
        Create Live Stream
      </button>
    </div>
  );
}
