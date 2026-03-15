import { Camera, CameraOff, Mic, MicOff, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  text?: string;
  audioUrl?: string;
  timestamp: Date;
  isSent: boolean;
}

export function WhatsappChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCountRef = useRef(0);

  useEffect(() => {
    if (messages.length !== msgCountRef.current) {
      msgCountRef.current = messages.length;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch {
      setCameraError("No se pudo acceder a la cámara.");
      setCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const toggleCamera = useCallback(() => {
    if (cameraOn) stopCamera();
    else startCamera();
  }, [cameraOn, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const msg: ChatMessage = {
          id: Date.now().toString(),
          audioUrl: url,
          timestamp: new Date(),
          isSent: true,
        };
        setMessages((prev) => [...prev, msg]);
        for (const t of stream.getTracks()) t.stop();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      // ignore
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      isSent: true,
    };
    setMessages((prev) => [...prev, msg]);
    setInputText("");
  }, [inputText]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <section
      data-ocid="chat.section"
      style={{
        maxWidth: 580,
        width: "100%",
        margin: "0 auto 32px",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        border: "1px solid rgba(7,94,84,0.5)",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #075e54, #128c7e)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            📱
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
              Chat WhatsAppeando
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
              {cameraOn
                ? "📹 Cámara activa"
                : isRecording
                  ? "🎙️ Grabando..."
                  : "En línea"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Camera toggle */}
          <button
            type="button"
            data-ocid="chat.camera.toggle"
            onClick={toggleCamera}
            title={cameraOn ? "Apagar cámara" : "Encender cámara"}
            style={{
              background: cameraOn
                ? "rgba(255,255,255,0.25)"
                : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              transition: "background 0.2s",
            }}
          >
            {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
          </button>
          {/* Mic toggle */}
          <button
            type="button"
            data-ocid="chat.audio.toggle"
            onClick={toggleRecording}
            title={isRecording ? "Detener grabación" : "Grabar audio"}
            style={{
              background: isRecording
                ? "rgba(220,50,50,0.7)"
                : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              transition: "background 0.2s",
            }}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>

      {/* Camera preview */}
      {cameraOn && (
        <div
          style={{
            background: "#000",
            display: "flex",
            justifyContent: "center",
            padding: 4,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </div>
      )}
      {cameraError && (
        <div
          data-ocid="chat.error_state"
          style={{
            background: "#ffebee",
            color: "#c62828",
            padding: "6px 14px",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          {cameraError}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          background: "#ece5dd",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          minHeight: 220,
          maxHeight: 340,
          overflowY: "auto",
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {messages.length === 0 && (
          <div
            data-ocid="chat.empty_state"
            style={{
              textAlign: "center",
              color: "#888",
              fontSize: 13,
              marginTop: 40,
              userSelect: "none",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
            <div>Inicia una conversación...</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            data-ocid={`chat.item.${i + 1}`}
            style={{
              display: "flex",
              justifyContent: msg.isSent ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                background: msg.isSent ? "#dcf8c6" : "#fff",
                borderRadius: msg.isSent
                  ? "12px 12px 2px 12px"
                  : "12px 12px 12px 2px",
                padding: "6px 10px 4px",
                maxWidth: "75%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {msg.text && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#111",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </p>
              )}
              {msg.audioUrl && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio
                  controls
                  src={msg.audioUrl}
                  style={{ width: 200, height: 36 }}
                >
                  <track kind="captions" />
                </audio>
              )}
              <div
                style={{
                  fontSize: 10,
                  color: "#999",
                  textAlign: "right",
                  marginTop: 2,
                }}
              >
                {formatTime(msg.timestamp)}
                {msg.isSent ? " ✓✓" : ""}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          background: "#f0f0f0",
          padding: "8px 10px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          borderTop: "1px solid #ddd",
        }}
      >
        <input
          data-ocid="chat.input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            border: "none",
            borderRadius: 24,
            padding: "9px 16px",
            fontSize: 14,
            background: "#fff",
            outline: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            color: "#111",
          }}
        />
        <button
          type="button"
          data-ocid="chat.send_button"
          onClick={sendMessage}
          disabled={!inputText.trim()}
          style={{
            background: inputText.trim() ? "#25d366" : "#b2dfdb",
            border: "none",
            borderRadius: "50%",
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: inputText.trim() ? "pointer" : "default",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <Send size={18} color="#fff" />
        </button>
      </div>
    </section>
  );
}
