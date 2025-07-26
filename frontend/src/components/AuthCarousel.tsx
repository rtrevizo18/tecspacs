import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";

const AuthCarousel: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial index based on current route
  const getInitialIndex = () => {
    switch (location.pathname) {
      case "/register":
        return 1;
      case "/reset-password":
        return 2;
      default:
        return 0; // login
    }
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const forms = [
    {
      component: <Login />,
      title: "Login",
      color: "bg-sticky-default",
      route: "/login",
    },
    {
      component: <Register />,
      title: "Register",
      color: "bg-sticky-green",
      route: "/register",
    },
    {
      component: <ResetPassword />,
      title: "Reset",
      color: "bg-sticky-blue",
      route: "/reset-password",
    },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50; // Reduced threshold for easier navigation
    let newIndex = currentIndex;

    if (translateX > threshold && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (translateX < -threshold && currentIndex < forms.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      navigate(forms[newIndex].route);
    }

    setTranslateX(0);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    navigate(forms[index].route);
  };

  // Update index when route changes
  useEffect(() => {
    const newIndex = getInitialIndex();
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [location.pathname]);

  return (
    <div className="pt-20 min-h-screen relative overflow-hidden">
      <div className="pt-20 h-full relative">
        {/* Show all forms with different scales and positions */}
        <div
          className="flex items-start justify-center h-full relative"
          style={{ paddingTop: "2rem" }}
        >
          {forms.map((form, index) => {
            const offset = index - currentIndex;
            const isActive = index === currentIndex;
            const isAdjacent = Math.abs(offset) === 1;
            const isVisible = Math.abs(offset) <= 1;

            if (!isVisible) return null;

            return (
              <div
                key={index}
                className={`absolute transition-all duration-500 ease-out cursor-pointer ${
                  !isActive ? "hover:scale-110" : ""
                }`}
                style={{
                  transform: `
                    translateX(${offset * 400}px) 
                    scale(${isActive ? 1 : 0.75}) 
                    rotate(${offset * 3}deg)
                  `,
                  opacity: isActive ? 1 : 0.6,
                  zIndex: isActive ? 20 : 10,
                  transformOrigin: "top center",
                }}
                onClick={() => !isActive && goToSlide(index)}
                onMouseDown={isActive ? handleMouseDown : undefined}
                onMouseMove={isActive ? handleMouseMove : undefined}
                onMouseUp={isActive ? handleDragEnd : undefined}
                onMouseLeave={isActive ? handleDragEnd : undefined}
                onTouchStart={isActive ? handleTouchStart : undefined}
                onTouchMove={isActive ? handleTouchMove : undefined}
                onTouchEnd={isActive ? handleDragEnd : undefined}
              >
                <div className="w-full max-w-md">
                  {/* Actual form */}
                  <div
                    className={`transform transition-all duration-300 ${
                      isActive ? "hover:scale-105" : ""
                    }`}
                  >
                    {React.cloneElement(form.component as React.ReactElement, {
                      key: index,
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {forms.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full border-2 border-pen-black transition-all duration-300 ${
              currentIndex === index
                ? "bg-sticky-default shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-text-accent text-sm">📎 side forms to navigate 👉</p>
      </div>
    </div>
  );
};

export default AuthCarousel;
