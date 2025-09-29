import React from "react";
import { Tabs } from "antd";
import Interviewee from "./pages/Interviewee";
import Interviewer from "./pages/Interviewer";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      {/* Main floating card */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
          {/* Gradient Header */}
          <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg text-center">
            Swipe — AI Interview Assistant
          </h1>

          {/* Glassy Tabs */}
          <Tabs
            defaultActiveKey="1"
            className="custom-tabs"
            items={[
              { key: "1", label: "🎯 Interviewee", children: <Interviewee /> },
              { key: "2", label: "📊 Interviewer Dashboard", children: <Interviewer /> },
            ]}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
  