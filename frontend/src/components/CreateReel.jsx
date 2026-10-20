
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Video,
  Type,
  Hash,
  Sparkles,
  X,
  Send,
} from "lucide-react";

function CreateReel({ profile, onPublish, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [category, setCategory] = useState("Coding");
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (selectedFile) => {
    setError("");

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("video/")) {
      setError("कृपया योग्य video file निवड.");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("Video size 100 MB पेक्षा कमी असावा.");
      return;
    }

    setFile(selectedFile);
  };

  const publish = (event) => {
    event.preventDefault();

    if (!file) {
      setError("Publish करण्याआधी video निवड.");
      return;
    }

    setPublishing(true);

    const videoUrl = URL.createObjectURL(file);

    const newReel = {
      id: Date.now(),
      title: caption.trim() || file.name.replace(/\.[^/.]+$/, ""),
      creator: profile.name,
      category,
      video: videoUrl,
      description: [
        caption.trim(),
        hashtags
          .split(/[\s,]+/)
          .filter(Boolean)
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
          .join(" "),
      ]
        .filter(Boolean)
        .join(" "),
      likes: 0,
      comments: 0,
      followers: 0,
      isUploaded: true,
    };

    onPublish(newReel);
  };

  return (
    <section className="create-page">
      <div className="create-intro">
        <span className="section-eyebrow">YOUR CREATOR STUDIO</span>
        <h2>Create your next big thing ✨</h2>
        <p>Share what you know. Inspire someone today.</p>
      </div>

      <form className="create-layout" onSubmit={publish}>
        <div className="upload-column glass-panel">
          <div className="create-panel-heading">
            <Video size={19} />
            <h3>Video Preview</h3>
          </div>

          {preview ? (
            <div className="create-preview">
              <video src={preview} controls playsInline />
              <button
                type="button"
                className="remove-video"
                onClick={() => setFile(null)}
                aria-label="Remove selected video"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="upload-dropzone"
              onClick={() => inputRef.current?.click()}
            >
              <span className="upload-symbol">
                <Upload size={26} />
              </span>
              <strong>Drop your video here</strong>
              <span>Or click to browse your device</span>
              <small>Video files · Maximum 100 MB</small>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          {file && (
            <div className="selected-file">
              <Video size={16} />
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Clear selected file"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="secondary-button choose-video"
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={16} /> {file ? "Change Video" : "Choose Video"}
          </button>
        </div>

        <div className="create-details glass-panel">
          <div className="create-panel-heading">
            <Sparkles size={19} />
            <h3>Reel Details</h3>
          </div>

          <label className="field-label">
            <span><Type size={15} /> Caption</span>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={500}
              placeholder="What do you want to share with the world?"
              rows={5}
            />
            <small>{caption.length}/500 characters</small>
          </label>

          <label className="field-label">
            <span><Hash size={15} /> Hashtags</span>
            <input
              value={hashtags}
              onChange={(event) => setHashtags(event.target.value)}
              placeholder="#coding #motivation #career"
            />
          </label>

          <label className="field-label">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Coding</option>
              <option>Web Development</option>
              <option>Motivation</option>
              <option>Education</option>
              <option>Career</option>
              <option>Technology</option>
              <option>Other</option>
            </select>
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="publish-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={publishing}
            >
              <Send size={16} /> Publish Reel
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default CreateReel;
