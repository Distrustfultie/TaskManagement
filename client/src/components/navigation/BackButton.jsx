// Updated with new color scheme
export default function BackButton() {
    const navigate = useNavigate();
  
    return (
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>
    );
  }