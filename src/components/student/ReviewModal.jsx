import { useState } from "react";
import { Star, X } from "lucide-react";
import api from "../../api/axios";
import { auth } from "../../auth/firebase";

const ReviewModal = ({ isOpen, onClose, courseId, courseTitle, instructorId, instructorName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await auth.currentUser.getIdToken(true);
      await api.post(
        "/api/reviews",
        {
          course_id: courseId,
          instructor_id: instructorId,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Review submitted successfully! ⭐");
      onClose();
    } catch (error) {
      console.error("Submit review error:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in scale-95 duration-200 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Rate Instructor</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              {instructorName?.charAt(0) || "I"}
            </div>
            <p className="text-slate-500 font-medium">How was your experience with this course?</p>
            <h4 className="text-lg font-bold text-slate-800">{courseTitle}</h4>
            <p className="text-sm text-slate-500 mt-1">Instructor: {instructorName}</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={32}
                  className={`transition-colors ${(hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                    }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          <textarea
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all text-sm"
            placeholder="Share your feedback (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;