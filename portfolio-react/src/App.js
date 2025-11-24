import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ContentProvider } from "./context/ContentContext";
import Sidebar from "./components/Sidebar";
import StyleSwitcher from "./components/StyleSwitcher";
import Home from "./components/Home";
import About from "./components/About";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import AdminDashboard from "./components/admin/AdminDashboard";
import "./index.css";

const MainShell = () => {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="main-container">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="main-content">
        <Home />
        <About />
        <Services />
        <Portfolio />
        <Contact />
      </div>
      <StyleSwitcher />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ContentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/*" element={<MainShell />} />
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </ThemeProvider>
  );
}

export default App;
