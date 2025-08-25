"use client"

import { useEffect, useRef } from "react"

const ScrollAnimation = ({ children, className = "", animation = "fadeInUp", delay = 0 }) => {
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("animate")
            }, delay)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [delay])

  return (
    <div ref={elementRef} className={`scroll-animate ${className}`}>
      {children}
    </div>
  )
}

export default ScrollAnimation
